use std::{
    fs::{self, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};
use tauri::Manager;

const FILE_NAME: &str = "auth.json";
const LEGACY_FILE_NAME: &str = "connection-settings-v1.json";
const VERSION: u8 = 1;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionSettings {
    pub version: u8,
    pub base_url: String,
    pub client_key: String,
    pub remember: bool,
    pub authorized: bool,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveConnectionSettings {
    base_url: String,
    client_key: String,
    authorized: bool,
}

fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map(|directory| directory.join(FILE_NAME))
        .map_err(|error| format!("Could not locate the application settings directory: {error}"))
}

fn serialize_settings(settings: &ConnectionSettings) -> Result<Vec<u8>, String> {
    serde_json::to_vec_pretty(settings)
        .map_err(|error| format!("Could not serialize connection settings: {error}"))
}

fn deserialize_settings(bytes: &[u8]) -> Result<ConnectionSettings, String> {
    let settings: ConnectionSettings = serde_json::from_slice(bytes)
        .map_err(|_| "The saved auth.json file is invalid.".to_string())?;
    if settings.version != VERSION || !settings.remember {
        return Err("The saved auth.json version is not supported.".to_string());
    }
    validate_settings(&settings.base_url, &settings.client_key)?;
    Ok(settings)
}

fn validate_settings(base_url: &str, client_key: &str) -> Result<(), String> {
    let parsed =
        url::Url::parse(base_url.trim()).map_err(|_| "The API base URL is invalid.".to_string())?;
    if !matches!(parsed.scheme(), "http" | "https")
        || !parsed.username().is_empty()
        || parsed.password().is_some()
        || parsed.query().is_some()
        || parsed.fragment().is_some()
    {
        return Err("The API base URL must be HTTP(S) and cannot include credentials, a query, or a fragment.".to_string());
    }
    if client_key.trim().is_empty() {
        return Err("The Flaq Client Key cannot be empty.".to_string());
    }
    Ok(())
}

fn write_private_file(path: &Path, bytes: &[u8]) -> Result<(), String> {
    let directory = path
        .parent()
        .ok_or_else(|| "Invalid settings path.".to_string())?;
    fs::create_dir_all(directory)
        .map_err(|error| format!("Could not create the settings directory: {error}"))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::{OpenOptionsExt, PermissionsExt};
        fs::set_permissions(directory, fs::Permissions::from_mode(0o700))
            .map_err(|error| format!("Could not protect the settings directory: {error}"))?;
        let temporary = path.with_extension("tmp");
        let mut file = OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .mode(0o600)
            .open(&temporary)
            .map_err(|error| format!("Could not create the temporary settings file: {error}"))?;
        file.write_all(bytes)
            .and_then(|_| file.sync_all())
            .map_err(|error| format!("Could not write the connection settings: {error}"))?;
        fs::rename(&temporary, path)
            .map_err(|error| format!("Could not replace the connection settings: {error}"))?;
        return Ok(());
    }

    #[cfg(not(unix))]
    {
        let temporary = path.with_extension("tmp");
        let backup = path.with_extension("bak");
        let mut file = OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .open(&temporary)
            .map_err(|error| format!("Could not create the temporary settings file: {error}"))?;
        file.write_all(bytes)
            .and_then(|_| file.sync_all())
            .map_err(|error| format!("Could not write the connection settings: {error}"))?;
        if path.exists() {
            let _ = fs::remove_file(&backup);
            fs::rename(path, &backup)
                .map_err(|error| format!("Could not prepare the previous settings: {error}"))?;
        }
        if let Err(error) = fs::rename(&temporary, path) {
            if backup.exists() {
                let _ = fs::rename(&backup, path);
            }
            return Err(format!(
                "Could not replace the connection settings: {error}"
            ));
        }
        let _ = fs::remove_file(backup);
        Ok(())
    }
}

#[tauri::command]
pub fn load_connection_settings(
    app: tauri::AppHandle,
) -> Result<Option<ConnectionSettings>, String> {
    let path = settings_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let bytes = fs::read(path)
        .map_err(|error| format!("Could not read the saved auth.json file: {error}"))?;
    deserialize_settings(&bytes).map(Some)
}

#[tauri::command]
pub fn save_connection_settings(
    app: tauri::AppHandle,
    settings: SaveConnectionSettings,
) -> Result<ConnectionSettings, String> {
    let base_url = settings.base_url.trim().trim_end_matches('/').to_string();
    let client_key = settings.client_key.trim().to_string();
    validate_settings(&base_url, &client_key)?;
    let stored = ConnectionSettings {
        version: VERSION,
        base_url,
        client_key,
        remember: true,
        authorized: settings.authorized,
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    let bytes = serialize_settings(&stored)?;
    let path = settings_path(&app)?;
    write_private_file(&path, &bytes)?;

    let verified = deserialize_settings(
        &fs::read(&path).map_err(|error| format!("Could not verify auth.json: {error}"))?,
    )?;
    if verified != stored {
        return Err("The saved connection settings did not pass verification.".to_string());
    }
    let legacy_path = path.with_file_name(LEGACY_FILE_NAME);
    if legacy_path.exists() {
        fs::remove_file(legacy_path)
            .map_err(|error| format!("Could not remove the legacy connection settings: {error}"))?;
    }
    Ok(stored)
}

#[tauri::command]
pub fn clear_connection_settings(app: tauri::AppHandle) -> Result<(), String> {
    let path = settings_path(&app)?;
    for candidate in [path.clone(), path.with_file_name(LEGACY_FILE_NAME)] {
        if candidate.exists() {
            fs::remove_file(candidate).map_err(|error| {
                format!("Could not remove the saved connection settings: {error}")
            })?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn settings() -> ConnectionSettings {
        ConnectionSettings {
            version: VERSION,
            base_url: "https://api.flaq.ai".to_string(),
            client_key: "test-key".to_string(),
            remember: true,
            authorized: true,
            updated_at: "2026-09-20T00:00:00Z".to_string(),
        }
    }

    #[test]
    fn auth_json_is_plain_text_and_round_trips() {
        let bytes = serialize_settings(&settings()).unwrap();
        let text = String::from_utf8(bytes.clone()).unwrap();
        assert!(text.contains("\"clientKey\": \"test-key\""));
        assert!(!text.contains("ciphertext"));
        assert_eq!(deserialize_settings(&bytes).unwrap(), settings());
        assert!(deserialize_settings(b"{broken").is_err());
    }

    #[test]
    fn private_file_replaces_existing_contents() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join(FILE_NAME);
        write_private_file(&path, b"first").unwrap();
        write_private_file(&path, b"second").unwrap();
        assert_eq!(fs::read(&path).unwrap(), b"second");

        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            assert_eq!(
                fs::metadata(path).unwrap().permissions().mode() & 0o777,
                0o600
            );
        }
    }

    #[test]
    fn validation_rejects_unsafe_urls_and_empty_keys() {
        assert!(validate_settings("https://api.flaq.ai", "key").is_ok());
        assert!(validate_settings("https://user@example.test", "key").is_err());
        assert!(validate_settings("https://api.flaq.ai?secret=value", "key").is_err());
        assert!(validate_settings("https://api.flaq.ai", " ").is_err());
    }
}
