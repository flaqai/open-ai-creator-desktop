use serde::{Deserialize, Serialize};
use tauri::{
    menu::{MenuBuilder, MenuItem, SubmenuBuilder},
    Emitter, LogicalSize, Manager, PhysicalPosition,
};
use tauri_plugin_opener::OpenerExt;

#[derive(Serialize, Deserialize)]
pub struct Geometry {
    version: u8,
    x: i32,
    y: i32,
    width: f64,
    height: f64,
}

pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let settings = MenuItem::with_id(app, "settings", "Settings…", true, Some("CmdOrCtrl+,"))?;
    let quit = MenuItem::with_id(app, "quit", "Quit Flaq Creator", true, Some("CmdOrCtrl+Q"))?;
    let application = SubmenuBuilder::new(app, "Flaq Creator")
        .text("about", "About Flaq Creator")
        .separator()
        .item(&settings)
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .item(&quit)
        .build()?;
    let edit = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;
    let window = SubmenuBuilder::new(app, "Window")
        .minimize()
        .maximize()
        .fullscreen()
        .separator()
        .close_window()
        .build()?;
    let help = SubmenuBuilder::new(app, "Help")
        .text("help", "Flaq Creator Help")
        .build()?;
    app.set_menu(
        MenuBuilder::new(app)
            .items(&[&application, &edit, &window, &help])
            .build()?,
    )?;
    app.on_menu_event(|app, event| match event.id().as_ref() {
        "settings" | "about" => {
            focus_main_window(app);
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("desktop-menu", event.id().as_ref());
            }
        }
        "quit" => {
            save_window(app);
            app.exit(0);
        }
        "help" => {
            let _ = app.opener().open_url("https://flaq.ai/docs", None::<&str>);
        }
        _ => {}
    });
    if let Some(window) = app.get_webview_window("main") {
        if let Ok(bytes) = std::fs::read(app.path().app_config_dir()?.join("window-v1.json")) {
            if let Ok(saved) = serde_json::from_slice::<Geometry>(&bytes) {
                if saved.version == 1 && saved.width.is_finite() && saved.height.is_finite() {
                    let monitors = window.available_monitors()?;
                    let visible = monitors.iter().find(|monitor| {
                        let pos = monitor.position();
                        let size = monitor.size();
                        saved.x >= pos.x
                            && saved.y >= pos.y
                            && saved.x as i64 + 200 < pos.x as i64 + size.width as i64
                            && saved.y as i64 + 100 < pos.y as i64 + size.height as i64
                    });
                    let primary = window.primary_monitor()?;
                    if let Some(monitor) = visible.or(primary.as_ref()) {
                        let scale = monitor.scale_factor();
                        let (width, height, x, y) = fit_geometry(
                            &saved,
                            monitor.position().x,
                            monitor.position().y,
                            monitor.size().width,
                            monitor.size().height,
                            scale,
                        );
                        window.set_min_size(Some(LogicalSize::new(
                            width.min(1040.0),
                            height.min(720.0),
                        )))?;
                        window.set_size(LogicalSize::new(width, height))?;
                        if visible.is_some() {
                            window.set_position(PhysicalPosition::new(x, y))?;
                        } else {
                            window.center()?;
                        }
                    }
                }
            }
        }
    }
    // Monitor hot-plug does not reliably produce a scale-change event. Check topology only,
    // then correct the window on the UI thread when the attached displays change.
    let handle = app.handle().clone();
    std::thread::spawn(move || {
        let mut previous = String::new();
        loop {
            std::thread::sleep(std::time::Duration::from_secs(2));
            let Some(window) = handle.get_webview_window("main") else {
                break;
            };
            let Ok(monitors) = window.available_monitors() else {
                continue;
            };
            let topology = format!("{:?}", monitors);
            if topology != previous {
                previous = topology;
                let app = handle.clone();
                let _ = handle.run_on_main_thread(move || ensure_visible(&app));
            }
        }
    });
    Ok(())
}

pub fn focus_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

pub(crate) fn should_show_initial_window(path: &str) -> bool {
    path != "/" && !path.ends_with("/index.html")
}

fn fit_geometry(
    saved: &Geometry,
    left: i32,
    top: i32,
    pixels_w: u32,
    pixels_h: u32,
    scale: f64,
) -> (f64, f64, i32, i32) {
    let width = saved.width.max(1040.0).min(pixels_w as f64 / scale);
    let height = saved
        .height
        .max(720.0)
        .min((pixels_h as f64 / scale - 72.0).max(200.0));
    let x = (saved.x as f64).clamp(
        left as f64,
        (left as f64 + pixels_w as f64 - width * scale).max(left as f64),
    );
    let min_y = top as f64 + 28.0 * scale;
    let max_y = (top as f64 + pixels_h as f64 - height * scale - 40.0 * scale).max(min_y);
    (
        width,
        height,
        x as i32,
        (saved.y as f64).clamp(min_y, max_y) as i32,
    )
}

fn ensure_visible(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    if window.is_fullscreen().unwrap_or(false) || window.is_minimized().unwrap_or(false) {
        return;
    }
    let (Ok(pos), Ok(size), Ok(scale), Ok(monitors)) = (
        window.outer_position(),
        window.inner_size(),
        window.scale_factor(),
        window.available_monitors(),
    ) else {
        return;
    };
    let primary = window.primary_monitor().ok().flatten();
    let monitor = monitors
        .iter()
        .find(|m| {
            pos.x >= m.position().x
                && pos.y >= m.position().y
                && (pos.x as i64) < m.position().x as i64 + m.size().width as i64
                && (pos.y as i64) < m.position().y as i64 + m.size().height as i64
        })
        .or(primary.as_ref());
    if let Some(m) = monitor {
        let geometry = Geometry {
            version: 1,
            x: pos.x,
            y: pos.y,
            width: size.width as f64 / scale,
            height: size.height as f64 / scale,
        };
        let (w, h, x, y) = fit_geometry(
            &geometry,
            m.position().x,
            m.position().y,
            m.size().width,
            m.size().height,
            m.scale_factor(),
        );
        let _ = window.set_min_size(Some(LogicalSize::new(w.min(1040.0), h.min(720.0))));
        let _ = window.set_size(LogicalSize::new(w, h));
        let _ = window.set_position(PhysicalPosition::new(x, y));
    }
}

pub fn save_window(app: &tauri::AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    if window.is_fullscreen().unwrap_or(false) {
        return;
    }
    let (pos, size, scale, dir) = (
        window.outer_position(),
        window.inner_size(),
        window.scale_factor(),
        app.path().app_config_dir(),
    );
    let (Ok(pos), Ok(size), Ok(scale), Ok(dir)) = (pos, size, scale, dir) else {
        eprintln!("Could not read window geometry for persistence");
        return;
    };
    let data = Geometry {
        version: 1,
        x: pos.x,
        y: pos.y,
        width: size.width as f64 / scale,
        height: size.height as f64 / scale,
    };
    if size.width == 0 || size.height == 0 {
        return;
    }
    if let Ok(bytes) = serde_json::to_vec(&data) {
        let result = std::fs::create_dir_all(&dir)
            .and_then(|_| std::fs::write(dir.join("window-v1.tmp"), bytes))
            .and_then(|_| std::fs::rename(dir.join("window-v1.tmp"), dir.join("window-v1.json")));
        if let Err(error) = result {
            eprintln!("Could not save window geometry: {error}");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn removed_display_is_clamped_to_visible_work_area() {
        let saved = Geometry {
            version: 1,
            x: 9000,
            y: -200,
            width: 2000.0,
            height: 1200.0,
        };
        let (w, h, x, y) = fit_geometry(&saved, 0, 0, 2880, 1800, 2.0);
        assert_eq!((w, h, x, y), (1440.0, 828.0, 0, 56));
    }
    #[test]
    fn negative_monitor_coordinates_and_small_displays_are_supported() {
        let saved = Geometry {
            version: 1,
            x: -1700,
            y: 100,
            width: 1100.0,
            height: 750.0,
        };
        let (w, h, x, y) = fit_geometry(&saved, -1920, 0, 1920, 1080, 1.0);
        assert_eq!((w, h, x, y), (1100.0, 750.0, -1700, 100));
        let (w, h, _, _) = fit_geometry(&saved, 0, 0, 1024, 768, 1.0);
        assert_eq!((w, h), (1024.0, 696.0));
    }

    #[test]
    fn bootstrap_page_stays_hidden_until_the_localized_workspace_loads() {
        assert!(!should_show_initial_window("/"));
        assert!(!should_show_initial_window("/index.html"));
        assert!(should_show_initial_window("/zh/"));
        assert!(should_show_initial_window("/zh/image-to-image/"));
    }
}
