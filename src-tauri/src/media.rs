use std::{path::Path, time::Duration};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_http::reqwest;
use tokio::io::AsyncWriteExt;

fn validate_url(value: &str) -> Result<reqwest::Url, String> {
    let url = reqwest::Url::parse(value).map_err(|e| e.to_string())?;
    if !matches!(url.scheme(), "https" | "http") || !url.username().is_empty() || url.password().is_some() {
        return Err("Only HTTP(S) media URLs without embedded credentials are supported.".into());
    }
    Ok(url)
}

fn safe_filename(value: &str) -> String {
    let name: String = value.chars().map(|c| {
        if c.is_control() || "\\/:*?\"<>|".contains(c) { '_' } else { c }
    }).take(180).collect();
    if name.trim_matches('.').trim().is_empty() { "flaq-media".into() } else { name }
}

async fn download_to_path(url: reqwest::Url, path: &Path) -> Result<(), String> {
    let builder = reqwest::Client::builder();
    #[cfg(test)]
    let builder = builder.no_proxy();
    let client = builder
        .connect_timeout(Duration::from_secs(30))
        .timeout(Duration::from_secs(1800))
        .build().map_err(|e| e.to_string())?;
    let mut response = client.get(url).send().await.map_err(|e| e.to_string())?
        .error_for_status().map_err(|e| e.to_string())?;
    let parent = path.parent().ok_or("Invalid save location")?;
    // Save next to the destination and commit only on success. Existing files
    // survive network failures; large videos never pass through JS memory.
    let temp = tempfile::NamedTempFile::new_in(parent).map_err(|e| e.to_string())?;
    let mut file = tokio::fs::File::from_std(temp.reopen().map_err(|e| e.to_string())?);
    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;
    }
    file.flush().await.map_err(|e| e.to_string())?;
    file.sync_all().await.map_err(|e| e.to_string())?;
    drop(file);
    temp.persist(path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn save_media(app: tauri::AppHandle, url: String, filename: String) -> Result<bool, String> {
    let url = validate_url(&url)?;
    let selection = tauri::async_runtime::spawn_blocking(move || {
        app.dialog().file().set_file_name(safe_filename(&filename)).blocking_save_file()
    }).await.map_err(|e| e.to_string())?;
    let Some(selection) = selection else { return Ok(false) };
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
        for url in ["file:///etc/passwd", "javascript:alert(1)", "https://user:pass@example.com/a"] {
            assert!(validate_url(url).is_err());
        }
        assert!(validate_url("https://example.com/a.mp4?signature=test").is_ok());
        assert_eq!(safe_filename("../../a:video.mp4"), ".._.._a_video.mp4");
    }

    #[test]
    fn download_streams_bytes_and_preserves_existing_file_on_http_failure() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("video.mp4");
        for (status, body) in [("200 OK", "video-content"), ("500 Internal Server Error", "error")] {
            let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
            let address = listener.local_addr().unwrap();
            let worker = std::thread::spawn(move || {
                let (mut stream, _) = listener.accept().unwrap();
                let mut buf = [0; 4096];
                let _ = stream.read(&mut buf);
                write!(stream, "HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}", body.len()).unwrap();
            });
            let result = tauri::async_runtime::block_on(download_to_path(
                validate_url(&format!("http://{address}/video.mp4")).unwrap(), &path,
            ));
            worker.join().unwrap();
            assert_eq!(result.is_ok(), status.starts_with("200"));
            assert_eq!(std::fs::read_to_string(&path).unwrap(), "video-content");
        }
    }
}
