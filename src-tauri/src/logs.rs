use chrono::Local;
use std::{
    fs::OpenOptions,
    io::Write,
    path::{Path, PathBuf},
};
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
    open_directory_with_logging(
        &directory,
        |target| {
            app.opener()
                .open_path(target.to_string_lossy(), None::<&str>)
                .map_err(|error| error.to_string())
        },
        |level, message| append(&app, level, "desktop", message),
    )
}

fn open_directory_with_logging(
    directory: &Path,
    open: impl FnOnce(&Path) -> Result<(), String>,
    mut log: impl FnMut(&str, &str) -> Result<(), String>,
) -> Result<(), String> {
    let record = |log: &mut dyn FnMut(&str, &str) -> Result<(), String>, level, message: &str| {
        if let Err(error) = log(level, message) {
            eprintln!("Could not record log-directory {level} event: {error}");
        }
    };

    let target = match std::fs::canonicalize(directory) {
        Ok(target) if target.is_dir() => target,
        Ok(_) => {
            let error = "Application log path is not a directory".to_string();
            record(
                &mut log,
                "error",
                &format!("Log directory validation failed: {error}"),
            );
            return Err(error);
        }
        Err(error) => {
            let error = format!("Application log directory is unavailable: {error}");
            record(
                &mut log,
                "error",
                &format!("Log directory validation failed: {error}"),
            );
            return Err(error);
        }
    };

    record(
        &mut log,
        "info",
        &format!(
            "Requesting log directory via system launcher target={}",
            target.display()
        ),
    );
    match open(&target) {
        Ok(()) => {
            // The launcher can report acceptance, but cannot attest to Finder's final window state.
            record(
                &mut log,
                "info",
                &format!(
                    "System launcher accepted log directory target={}",
                    target.display()
                ),
            );
            Ok(())
        }
        Err(error) => {
            record(
                &mut log,
                "error",
                &format!(
                    "System launcher failed to open log directory target={} error={error}",
                    target.display()
                ),
            );
            Err(error)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::{Cell, RefCell};

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

    #[test]
    fn opening_logs_records_launcher_result_after_the_attempt() {
        let events = RefCell::new(Vec::new());
        let target = std::env::temp_dir();
        let result = open_directory_with_logging(
            &target,
            |_| {
                events.borrow_mut().push("launcher".to_string());
                Ok(())
            },
            |level, message| {
                events.borrow_mut().push(format!("{level}:{message}"));
                Ok(())
            },
        );
        assert!(result.is_ok());
        let events = events.into_inner();
        assert!(events[0].starts_with("info:Requesting log directory"));
        assert_eq!(events[1], "launcher");
        assert!(events[2].starts_with("info:System launcher accepted log directory"));
    }

    #[test]
    fn opening_logs_records_launcher_failure_and_returns_it() {
        let events = RefCell::new(Vec::new());
        let result = open_directory_with_logging(
            &std::env::temp_dir(),
            |_| {
                events.borrow_mut().push("launcher".to_string());
                Err("LaunchServices refused target".to_string())
            },
            |level, message| {
                events.borrow_mut().push(format!("{level}:{message}"));
                Ok(())
            },
        );
        assert_eq!(result.unwrap_err(), "LaunchServices refused target");
        let events = events.into_inner();
        assert_eq!(events[1], "launcher");
        assert!(events[2].contains("error:System launcher failed to open log directory"));
    }

    #[test]
    fn logging_failure_does_not_prevent_opening_logs() {
        let opened = Cell::new(false);
        let result = open_directory_with_logging(
            &std::env::temp_dir(),
            |_| {
                opened.set(true);
                Ok(())
            },
            |_, _| Err("Log writer is unavailable".to_string()),
        );
        assert!(result.is_ok());
        assert!(opened.get());
    }

    #[test]
    fn non_directory_target_is_rejected_before_the_launcher() {
        let opened = Cell::new(false);
        let levels = RefCell::new(Vec::new());
        let executable = std::env::current_exe().expect("test executable path");
        let result = open_directory_with_logging(
            &executable,
            |_| {
                opened.set(true);
                Ok(())
            },
            |level, _| {
                levels.borrow_mut().push(level.to_string());
                Ok(())
            },
        );
        assert_eq!(
            result.unwrap_err(),
            "Application log path is not a directory"
        );
        assert!(!opened.get());
        assert_eq!(levels.into_inner(), ["error"]);
    }
}
