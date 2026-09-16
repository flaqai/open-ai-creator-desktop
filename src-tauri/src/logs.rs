use chrono::Local;
use std::{fs::OpenOptions, io::Write, path::PathBuf};
use tauri::Manager;
use tauri_plugin_opener::OpenerExt;

const LOG_FILE_NAME: &str = "flaq-creator.log";
const MAX_LOG_MESSAGE_BYTES: usize = 8 * 1024;

fn log_directory(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let directory = app
        .path()
        .app_log_dir()
        .map_err(|error| error.to_string())?;
    std::fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    Ok(directory)
}

fn clean_log_field(value: &str, fallback: &str) -> String {
    let value = value.trim().replace(['\r', '\n'], " ");
    if value.is_empty() {
        fallback.to_string()
    } else {
        value
    }
}

fn truncate_message(value: &str) -> String {
    let value = clean_log_field(value, "No details");
    if value.len() <= MAX_LOG_MESSAGE_BYTES {
        return value;
    }
    let mut end = MAX_LOG_MESSAGE_BYTES;
    while !value.is_char_boundary(end) {
        end -= 1;
    }
    format!("{}…", &value[..end])
}

pub fn append(
    app: &tauri::AppHandle,
    level: &str,
    scope: &str,
    message: &str,
) -> Result<(), String> {
    let path = log_directory(app)?.join(LOG_FILE_NAME);
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|error| error.to_string())?;
    writeln!(
        file,
        "{} [{}] [{}] {}",
        Local::now().format("%Y-%m-%d %H:%M:%S%.3f%:z"),
        clean_log_field(level, "INFO").to_uppercase(),
        clean_log_field(scope, "desktop"),
        truncate_message(message),
    )
    .map_err(|error| error.to_string())
}

pub fn initialize(app: &tauri::AppHandle) {
    if let Err(error) = append(app, "info", "desktop", "Flaq Creator started") {
        eprintln!("Could not initialize desktop log: {error}");
    }
}

#[tauri::command]
pub fn write_desktop_log(
    app: tauri::AppHandle,
    level: String,
    scope: String,
    message: String,
) -> Result<(), String> {
    append(&app, &level, &scope, &message)
}

#[tauri::command]
pub fn open_log_directory(app: tauri::AppHandle) -> Result<(), String> {
    let directory = log_directory(&app)?;
    append(&app, "info", "desktop", "Opened log directory")?;
    app.opener()
        .open_path(directory.to_string_lossy(), None::<&str>)
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn log_fields_cannot_inject_extra_lines() {
        assert_eq!(clean_log_field(" api\nrequest ", "fallback"), "api request");
        assert_eq!(clean_log_field("  ", "fallback"), "fallback");
    }

    #[test]
    fn long_utf8_messages_are_truncated_on_a_character_boundary() {
        let message = "图".repeat(MAX_LOG_MESSAGE_BYTES);
        let result = truncate_message(&message);
        assert!(result.ends_with('…'));
        assert!(result.len() <= MAX_LOG_MESSAGE_BYTES + '…'.len_utf8());
    }
}
