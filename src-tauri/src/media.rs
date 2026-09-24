use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};
use std::{
    io::Write,
    path::{Path, PathBuf},
    time::Duration,
};
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_http::reqwest;
use tauri_plugin_opener::OpenerExt;
use tokio::io::AsyncWriteExt;

const MEDIA_SETTINGS_FILE: &str = "media-storage-v1.json";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaStorageSettings {
    directory: String,
    is_default: bool,
}

#[derive(Debug, Deserialize, Serialize)]
struct StoredMediaSettings {
    version: u8,
    directory: Option<String>,
}

fn default_media_directory(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("media"))
}

fn media_settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join(MEDIA_SETTINGS_FILE))
}

fn configured_media_directory(app: &tauri::AppHandle) -> Result<(PathBuf, bool), String> {
    let default = default_media_directory(app)?;
    let path = media_settings_path(app)?;
    let stored = std::fs::read(path)
        .ok()
        .and_then(|bytes| serde_json::from_slice::<StoredMediaSettings>(&bytes).ok())
        .filter(|settings| settings.version == 1)
        .and_then(|settings| settings.directory)
        .filter(|directory| !directory.trim().is_empty())
        .map(PathBuf::from);
    Ok(match stored {
        Some(directory) => (directory, false),
        None => (default, true),
    })
}

fn validate_writable_directory(path: &Path) -> Result<(), String> {
    std::fs::create_dir_all(path).map_err(|e| format!("Could not create media directory: {e}"))?;
    let mut probe = tempfile::NamedTempFile::new_in(path)
        .map_err(|e| format!("Media directory is not writable: {e}"))?;
    probe
        .write_all(b"flaq-media-write-check")
        .and_then(|_| probe.flush())
        .map_err(|e| format!("Media directory is not writable: {e}"))?;
    Ok(())
}

fn persist_media_directory(app: &tauri::AppHandle, directory: Option<&Path>) -> Result<(), String> {
    let path = media_settings_path(app)?;
    let parent = path.parent().ok_or("Invalid media settings location")?;
    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    let settings = StoredMediaSettings {
        version: 1,
        directory: directory.map(|value| value.to_string_lossy().into_owned()),
    };
    let mut temp = tempfile::NamedTempFile::new_in(parent).map_err(|e| e.to_string())?;
    serde_json::to_writer(&mut temp, &settings).map_err(|e| e.to_string())?;
    temp.flush().map_err(|e| e.to_string())?;
    temp.as_file().sync_all().map_err(|e| e.to_string())?;
    temp.persist(path).map_err(|e| e.to_string())?;
    Ok(())
}

fn settings_response(directory: PathBuf, is_default: bool) -> MediaStorageSettings {
    MediaStorageSettings {
        directory: directory.to_string_lossy().into_owned(),
        is_default,
    }
}

fn validate_url(value: &str) -> Result<reqwest::Url, String> {
    let url = reqwest::Url::parse(value).map_err(|e| e.to_string())?;
    if !matches!(url.scheme(), "https" | "http")
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err("Only HTTP(S) media URLs without embedded credentials are supported.".into());
    }
    Ok(url)
}

fn safe_filename(value: &str) -> String {
    let name: String = value
        .chars()
        .map(|c| {
            if c.is_control() || "\\/:*?\"<>|".contains(c) {
                '_'
            } else {
                c
            }
        })
        .take(180)
        .collect();
    if name.trim_matches('.').trim().is_empty() {
        "flaq-media".into()
    } else {
        name
    }
}

fn http_client() -> Result<reqwest::Client, String> {
    let builder = reqwest::Client::builder();
    #[cfg(test)]
    let builder = builder.no_proxy();
    builder
        .connect_timeout(Duration::from_secs(30))
        .timeout(Duration::from_secs(1800))
        .build()
        .map_err(|e| e.to_string())
}

async fn send_download_request(
    client: &reqwest::Client,
    url: &reqwest::Url,
) -> Result<reqwest::Response, String> {
    const RETRY_DELAYS: [Duration; 2] = [Duration::from_millis(500), Duration::from_millis(1500)];
    for (attempt, delay) in RETRY_DELAYS.iter().enumerate() {
        match client.get(url.clone()).send().await {
            Ok(response) => return Ok(response),
            Err(_) => tokio::time::sleep(*delay).await,
        }
        if attempt + 1 == RETRY_DELAYS.len() {
            break;
        }
    }
    client
        .get(url.clone())
        .send()
        .await
        .map_err(|error| format!("{error} after 3 attempts"))
}

async fn persist_response(
    mut response: reqwest::Response,
    path: &Path,
    replace: bool,
) -> Result<(), String> {
    let parent = path.parent().ok_or("Invalid save location")?;
    let temp = tempfile::NamedTempFile::new_in(parent).map_err(|e| e.to_string())?;
    let mut file = tokio::fs::File::from_std(temp.reopen().map_err(|e| e.to_string())?);
    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;
    }
    file.flush().await.map_err(|e| e.to_string())?;
    file.sync_all().await.map_err(|e| e.to_string())?;
    drop(file);
    if replace {
        temp.persist(path).map_err(|e| e.to_string())?;
    } else if let Err(error) = temp.persist_noclobber(path) {
        if !path.exists() {
            return Err(error.to_string());
        }
    }
    Ok(())
}

async fn download_to_path(url: reqwest::Url, path: &Path) -> Result<(), String> {
    let client = http_client()?;
    let response = send_download_request(&client, &url)
        .await
        .map_err(|e| e.to_string())?
        .error_for_status()
        .map_err(|e| e.to_string())?;
    persist_response(response, path, true).await
}

fn content_extension(content_type: Option<&str>, url: &reqwest::Url, media_type: &str) -> String {
    let mime = content_type
        .unwrap_or_default()
        .split(';')
        .next()
        .unwrap_or_default()
        .trim();
    let mapped = match mime {
        "image/jpeg" => Some("jpg"),
        "image/png" => Some("png"),
        "image/webp" => Some("webp"),
        "image/gif" => Some("gif"),
        "image/avif" => Some("avif"),
        "video/mp4" => Some("mp4"),
        "video/webm" => Some("webm"),
        "video/quicktime" => Some("mov"),
        _ => None,
    };
    if let Some(extension) = mapped {
        return extension.into();
    }
    let extension = Path::new(url.path())
        .extension()
        .and_then(|value| value.to_str())
        .map(str::to_ascii_lowercase)
        .filter(|value| {
            let allowed = if media_type == "image" {
                ["jpg", "jpeg", "png", "webp", "gif", "avif"].as_slice()
            } else {
                ["mp4", "webm", "mov"].as_slice()
            };
            allowed.contains(&value.as_str())
        });
    extension.unwrap_or_else(|| {
        if media_type == "image" {
            "webp".into()
        } else {
            "mp4".into()
        }
    })
}

fn archive_directory(root: &Path, completed_at: i64) -> Result<PathBuf, String> {
    let date: DateTime<Local> = DateTime::from_timestamp_millis(completed_at)
        .ok_or("Invalid media completion time")?
        .with_timezone(&Local);
    Ok(root
        .join(date.format("%Y").to_string())
        .join(date.format("%m").to_string())
        .join(date.format("%d").to_string()))
}

fn existing_archive(directory: &Path, prefix: &str) -> Option<PathBuf> {
    std::fs::read_dir(directory)
        .ok()?
        .flatten()
        .find_map(|entry| {
            let name = entry.file_name();
            let name = name.to_string_lossy();
            (entry.path().is_file()
                && name.starts_with(prefix)
                && name[prefix.len()..].starts_with('.'))
            .then(|| entry.path())
        })
}

fn is_archived_media_file(file: &Path, root: &Path) -> bool {
    let Ok(relative) = file.strip_prefix(root) else {
        return false;
    };
    let parts: Vec<_> = relative.components().collect();
    if parts.len() != 4 {
        return false;
    }
    let segments: Vec<_> = parts
        .iter()
        .filter_map(|part| part.as_os_str().to_str())
        .collect();
    if segments.len() != 4
        || segments[0].len() != 4
        || segments[1].len() != 2
        || segments[2].len() != 2
        || segments[..3]
            .iter()
            .any(|part| !part.chars().all(|c| c.is_ascii_digit()))
    {
        return false;
    }
    let name = segments[3];
    let extension = file
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    (name.starts_with("image-")
        && ["jpg", "jpeg", "png", "webp", "gif", "avif"].contains(&extension.as_str()))
        || (name.starts_with("video-") && ["mp4", "webm", "mov"].contains(&extension.as_str()))
}

#[tauri::command]
pub fn get_media_storage_settings(app: tauri::AppHandle) -> Result<MediaStorageSettings, String> {
    let (directory, is_default) = configured_media_directory(&app)?;
    validate_writable_directory(&directory)?;
    Ok(settings_response(directory, is_default))
}

#[tauri::command]
pub async fn choose_media_storage_directory(
    app: tauri::AppHandle,
) -> Result<Option<String>, String> {
    let selection =
        tauri::async_runtime::spawn_blocking(move || app.dialog().file().blocking_pick_folder())
            .await
            .map_err(|e| e.to_string())?;
    selection
        .map(|path| {
            path.into_path()
                .map(|value| value.to_string_lossy().into_owned())
                .map_err(|e| e.to_string())
        })
        .transpose()
}

#[tauri::command]
pub fn set_media_storage_directory(
    app: tauri::AppHandle,
    directory: Option<String>,
) -> Result<MediaStorageSettings, String> {
    let custom = directory
        .filter(|value| !value.trim().is_empty())
        .map(PathBuf::from);
    let target = custom.clone().unwrap_or(default_media_directory(&app)?);
    validate_writable_directory(&target)?;
    persist_media_directory(&app, custom.as_deref())?;
    Ok(settings_response(target, custom.is_none()))
}

#[tauri::command]
pub fn open_media_storage_directory(app: tauri::AppHandle) -> Result<(), String> {
    let (directory, _) = configured_media_directory(&app)?;
    validate_writable_directory(&directory)?;
    app.opener()
        .open_path(directory.to_string_lossy(), None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn archive_generated_media(
    app: tauri::AppHandle,
    url: String,
    media_type: String,
    task_id: String,
    completed_at: i64,
) -> Result<String, String> {
    let (root, _) = configured_media_directory(&app)?;
    archive_url_to_root(&root, &url, &media_type, &task_id, completed_at)
        .await
        .map(|path| path.to_string_lossy().into_owned())
}

/// Grant the asset protocol access only to a previously archived media file.
#[tauri::command]
pub fn register_canvas_media_path(app: tauri::AppHandle, path: String) -> Result<(), String> {
    let file = std::fs::canonicalize(&path).map_err(|e| e.to_string())?;
    if !file.is_file() {
        return Err("Canvas media path is not a file".into());
    }
    let (configured_root, _) = configured_media_directory(&app)?;
    let default_root = default_media_directory(&app)?;
    let permitted = [configured_root, default_root]
        .iter()
        .filter_map(|root| std::fs::canonicalize(root).ok())
        .any(|root| is_archived_media_file(&file, &root));
    if !permitted {
        return Err("Canvas media path is outside the application media directory".into());
    }
    app.asset_protocol_scope()
        .allow_file(&file)
        .map_err(|e| e.to_string())
}

async fn archive_url_to_root(
    root: &Path,
    url: &str,
    media_type: &str,
    task_id: &str,
    completed_at: i64,
) -> Result<PathBuf, String> {
    if !matches!(media_type, "image" | "video") {
        return Err("Media type must be image or video".into());
    }
    let url = validate_url(url)?;
    let directory = archive_directory(root, completed_at)?;
    validate_writable_directory(&directory)?;
    let prefix = format!("{}-{}", media_type, safe_filename(&task_id));
    if let Some(path) = existing_archive(&directory, &prefix) {
        return Ok(path);
    }
    let client = http_client()?;
    let response = send_download_request(&client, &url)
        .await
        .map_err(|e| e.to_string())?
        .error_for_status()
        .map_err(|e| e.to_string())?;
    let extension = content_extension(
        response
            .headers()
            .get(reqwest::header::CONTENT_TYPE)
            .and_then(|value| value.to_str().ok()),
        &url,
        &media_type,
    );
    let path = directory.join(format!("{prefix}.{extension}"));
    persist_response(response, &path, false).await?;
    Ok(path)
}

#[tauri::command]
pub async fn save_media(
    app: tauri::AppHandle,
    url: String,
    filename: String,
) -> Result<bool, String> {
    let url = validate_url(&url)?;
    let selection = tauri::async_runtime::spawn_blocking(move || {
        app.dialog()
            .file()
            .set_file_name(safe_filename(&filename))
            .blocking_save_file()
    })
    .await
    .map_err(|e| e.to_string())?;
    let Some(selection) = selection else {
        return Ok(false);
    };
    let path = selection.into_path().map_err(|e| e.to_string())?;
    download_to_path(url, &path).await?;
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Read, Write};

    #[test]
    fn rejects_non_network_and_credential_urls() {
        for url in [
            "file:///etc/passwd",
            "javascript:alert(1)",
            "https://user:pass@example.com/a",
        ] {
            assert!(validate_url(url).is_err());
        }
        assert!(validate_url("https://example.com/a.mp4?signature=test").is_ok());
        assert_eq!(safe_filename("../../a:video.mp4"), ".._.._a_video.mp4");
    }

    #[test]
    fn archive_paths_use_nested_local_date_and_safe_extensions() {
        let root = Path::new("media-root");
        let path = archive_directory(root, 1_725_955_200_000).unwrap();
        assert_eq!(path.components().count(), root.components().count() + 3);
        let url = validate_url("https://example.com/output.unsupported?token=test").unwrap();
        assert_eq!(
            content_extension(Some("image/png; charset=binary"), &url, "image"),
            "png"
        );
        assert_eq!(content_extension(None, &url, "video"), "mp4");
    }

    #[test]
    fn archive_downloads_once_into_the_nested_date_directory() {
        let root = tempfile::tempdir().unwrap();
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let worker = std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut buf = [0; 4096];
            let _ = stream.read(&mut buf);
            write!(
                stream,
                "HTTP/1.1 200 OK\r\nContent-Type: image/png\r\nContent-Length: 13\r\nConnection: close\r\n\r\nimage-content"
            )
            .unwrap();
        });
        let completed_at = 1_725_955_200_000;
        let url = format!("http://{address}/generated");
        let first = tauri::async_runtime::block_on(archive_url_to_root(
            root.path(),
            &url,
            "image",
            "task-1",
            completed_at,
        ))
        .unwrap();
        worker.join().unwrap();
        assert_eq!(first.file_name().unwrap(), "image-task-1.png");
        assert_eq!(std::fs::read_to_string(&first).unwrap(), "image-content");

        // The server has stopped, so this succeeds only if the stable task name
        // is detected before another network request is attempted.
        let second = tauri::async_runtime::block_on(archive_url_to_root(
            root.path(),
            &url,
            "image",
            "task-1",
            completed_at,
        ))
        .unwrap();
        assert_eq!(second, first);
    }

    #[test]
    fn archive_retries_a_transient_connection_failure() {
        let root = tempfile::tempdir().unwrap();
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let worker = std::thread::spawn(move || {
            let (first, _) = listener.accept().unwrap();
            drop(first);

            let (mut second, _) = listener.accept().unwrap();
            let mut buf = [0; 4096];
            let _ = second.read(&mut buf);
            write!(
                second,
                "HTTP/1.1 200 OK\r\nContent-Type: video/mp4\r\nContent-Length: 13\r\nConnection: close\r\n\r\nvideo-content"
            )
            .unwrap();
        });

        let path = tauri::async_runtime::block_on(archive_url_to_root(
            root.path(),
            &format!("http://{address}/generated"),
            "video",
            "task-retry",
            1_725_955_200_000,
        ))
        .unwrap();
        worker.join().unwrap();
        assert_eq!(std::fs::read_to_string(path).unwrap(), "video-content");
    }

    #[test]
    fn writable_validation_rejects_a_file_as_the_storage_root() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("not-a-directory");
        std::fs::write(&file, b"content").unwrap();
        assert!(validate_writable_directory(&file).is_err());
    }

    #[test]
    fn asset_scope_accepts_only_dated_archived_media() {
        let root = Path::new("/example/media");
        assert!(is_archived_media_file(
            &root.join("2026/09/23/image-task.png"),
            root
        ));
        assert!(is_archived_media_file(
            &root.join("2026/09/23/video-task.mp4"),
            root
        ));
        assert!(!is_archived_media_file(&root.join("auth.json"), root));
        assert!(!is_archived_media_file(
            &root.join("2026/09/23/image-task.html"),
            root
        ));
        assert!(!is_archived_media_file(
            &root.join("2026/09/23/secret.png"),
            root
        ));
        assert!(!is_archived_media_file(
            &root.join("2026/09/23/extra/image-task.png"),
            root
        ));
    }

    #[test]
    fn download_streams_bytes_and_preserves_existing_file_on_http_failure() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("video.mp4");
        for (status, body) in [
            ("200 OK", "video-content"),
            ("500 Internal Server Error", "error"),
        ] {
            let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
            let address = listener.local_addr().unwrap();
            let worker = std::thread::spawn(move || {
                let (mut stream, _) = listener.accept().unwrap();
                let mut buf = [0; 4096];
                let _ = stream.read(&mut buf);
                write!(
                    stream,
                    "HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
                    body.len()
                )
                .unwrap();
            });
            let result = tauri::async_runtime::block_on(download_to_path(
                validate_url(&format!("http://{address}/video.mp4")).unwrap(),
                &path,
            ));
            worker.join().unwrap();
            assert_eq!(result.is_ok(), status.starts_with("200"));
            assert_eq!(std::fs::read_to_string(&path).unwrap(), "video-content");
        }
    }
}
