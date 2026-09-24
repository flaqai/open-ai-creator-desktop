use serde::{Deserialize, Serialize};
#[cfg(target_os = "macos")]
use std::sync::atomic::{AtomicBool, Ordering};
#[cfg(target_os = "macos")]
use tauri::menu::Menu;
use tauri::{
    menu::{MenuBuilder, MenuItem, SubmenuBuilder},
    Emitter, LogicalSize, Manager, PhysicalPosition,
};
#[cfg(not(target_os = "macos"))]
use tauri_plugin_opener::OpenerExt;

#[derive(Serialize, Deserialize)]
pub struct Geometry {
    version: u8,
    x: i32,
    y: i32,
    width: f64,
    height: f64,
}

#[cfg(target_os = "macos")]
static MENU_ZH: AtomicBool = AtomicBool::new(false);
#[cfg(target_os = "macos")]
static CANVAS_EDITOR_ACTIVE: AtomicBool = AtomicBool::new(false);

#[cfg(target_os = "macos")]
fn macos_menu(app: &tauri::AppHandle, zh: bool) -> tauri::Result<Menu<tauri::Wry>> {
    let label = |english, chinese| if zh { chinese } else { english };
    let canvas_active = CANVAS_EDITOR_ACTIVE.load(Ordering::Relaxed);
    let settings = MenuItem::with_id(
        app,
        "settings",
        label("Settings…", "设置…"),
        true,
        Some("CmdOrCtrl+,"),
    )?;
    let workspace = MenuItem::with_id(
        app,
        "nav_workspace",
        label("Workspace", "工作台"),
        true,
        Some("CmdOrCtrl+1"),
    )?;
    let create = MenuItem::with_id(
        app,
        "nav_ai_create",
        label("AI Creation", "AI 创作"),
        true,
        Some("CmdOrCtrl+2"),
    )?;
    let library = MenuItem::with_id(
        app,
        "nav_library",
        label("Media Library", "素材库"),
        true,
        Some("CmdOrCtrl+3"),
    )?;
    let new_canvas = MenuItem::with_id(
        app,
        "canvas_new",
        label("New Canvas", "新建画布"),
        true,
        Some("CmdOrCtrl+N"),
    )?;
    let open_canvas = MenuItem::with_id(
        app,
        "nav_canvas",
        label("Infinite Canvas", "无限画布"),
        true,
        Some("CmdOrCtrl+4"),
    )?;
    let save_canvas = MenuItem::with_id(
        app,
        "canvas_save",
        label("Save Canvas", "保存画布"),
        canvas_active,
        Some("CmdOrCtrl+S"),
    )?;
    let import_canvas = MenuItem::with_id(
        app,
        "canvas_import",
        label("Import Media…", "导入素材…"),
        canvas_active,
        None::<&str>,
    )?;
    let export_canvas = MenuItem::with_id(
        app,
        "canvas_export",
        label("Export Canvas…", "导出画布…"),
        canvas_active,
        None::<&str>,
    )?;
    let reset_canvas_view = MenuItem::with_id(
        app,
        "canvas_reset_view",
        label("Reset Canvas View", "重置画布视图"),
        canvas_active,
        Some("CmdOrCtrl+0"),
    )?;
    let quit = MenuItem::with_id(
        app,
        "quit",
        label("Quit Flaq Creator", "退出 Flaq Creator"),
        true,
        Some("CmdOrCtrl+Q"),
    )?;
    let application = SubmenuBuilder::new(app, "Flaq Creator")
        .text("about", label("About Flaq Creator", "关于 Flaq Creator"))
        .separator()
        .item(&settings)
        .text("appearance", label("Appearance…", "外观…"))
        .text("connection", label("Connect Flaq…", "连接 Flaq…"))
        .separator()
        .hide()
        .hide_others()
        .show_all()
        .separator()
        .item(&quit)
        .build()?;
    let file = SubmenuBuilder::new(app, label("File", "文件"))
        .item(&new_canvas)
        .separator()
        .item(&library)
        .separator()
        .text(
            "open_media_folder",
            label("Open Media Folder", "打开作品文件夹"),
        )
        .build()?;
    let canvas = SubmenuBuilder::new(app, label("Canvas", "画布"))
        .item(&open_canvas)
        .separator()
        .item(&save_canvas)
        .item(&import_canvas)
        .item(&export_canvas)
        .separator()
        .item(&reset_canvas_view)
        .build()?;
    let edit = if canvas_active {
        let undo = MenuItem::with_id(
            app,
            "canvas_undo",
            label("Undo", "撤销"),
            true,
            Some("CmdOrCtrl+Z"),
        )?;
        let redo = MenuItem::with_id(
            app,
            "canvas_redo",
            label("Redo", "重做"),
            true,
            Some("CmdOrCtrl+Shift+Z"),
        )?;
        let cut = MenuItem::with_id(
            app,
            "canvas_cut",
            label("Cut", "剪切"),
            true,
            Some("CmdOrCtrl+X"),
        )?;
        let copy = MenuItem::with_id(
            app,
            "canvas_copy",
            label("Copy", "复制"),
            true,
            Some("CmdOrCtrl+C"),
        )?;
        let paste = MenuItem::with_id(
            app,
            "canvas_paste",
            label("Paste", "粘贴"),
            true,
            Some("CmdOrCtrl+V"),
        )?;
        let select_all = MenuItem::with_id(
            app,
            "canvas_select_all",
            label("Select All", "全选"),
            true,
            Some("CmdOrCtrl+A"),
        )?;
        SubmenuBuilder::new(app, label("Edit", "编辑"))
            .item(&undo)
            .item(&redo)
            .separator()
            .item(&cut)
            .item(&copy)
            .item(&paste)
            .item(&select_all)
            .build()?
    } else {
        SubmenuBuilder::new(app, label("Edit", "编辑"))
            .undo()
            .redo()
            .separator()
            .cut()
            .copy()
            .paste()
            .select_all()
            .build()?
    };
    let view = SubmenuBuilder::new(app, label("View", "视图"))
        .item(&workspace)
        .item(&create)
        .separator()
        .text("nav_text_to_image", label("Text to Image", "文本转图像"))
        .text("nav_image_to_image", label("Image to Image", "图像转图像"))
        .text("nav_virtual_try_on", label("Virtual Try-On", "虚拟试穿"))
        .separator()
        .text("nav_text_to_video", label("Text to Video", "文本转视频"))
        .text("nav_image_to_video", label("Image to Video", "图片转视频"))
        .text(
            "nav_reference_to_video",
            label("Reference to Video", "参考素材转视频"),
        )
        .separator()
        .text("toggle_sidebar", label("Toggle Sidebar", "切换侧栏"))
        .build()?;
    let window = SubmenuBuilder::new(app, label("Window", "窗口"))
        .minimize()
        .maximize()
        .fullscreen()
        .separator()
        .close_window()
        .build()?;
    let help = SubmenuBuilder::new(app, label("Help", "帮助"))
        .text("help", label("Help Center", "帮助中心"))
        .separator()
        .text("open_logs", label("Open Log Folder", "打开日志文件夹"))
        .build()?;

    MenuBuilder::new(app)
        .items(&[&application, &file, &edit, &view, &canvas, &window, &help])
        .build()
}

#[tauri::command]
pub fn set_desktop_menu_locale(app: tauri::AppHandle, locale: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        MENU_ZH.store(matches!(locale.as_str(), "zh" | "tw"), Ordering::Relaxed);
        let menu = macos_menu(&app, matches!(locale.as_str(), "zh" | "tw"))
            .map_err(|error| error.to_string())?;
        app.set_menu(menu).map_err(|error| error.to_string())?;
    }
    #[cfg(not(target_os = "macos"))]
    let _ = (app, locale);
    Ok(())
}

#[tauri::command]
pub fn set_canvas_editor_menu_active(app: tauri::AppHandle, active: bool) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        CANVAS_EDITOR_ACTIVE.store(active, Ordering::Relaxed);
        let menu =
            macos_menu(&app, MENU_ZH.load(Ordering::Relaxed)).map_err(|error| error.to_string())?;
        app.set_menu(menu).map_err(|error| error.to_string())?;
    }
    #[cfg(not(target_os = "macos"))]
    let _ = (app, active);
    Ok(())
}

pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(target_os = "macos")]
    app.set_menu(macos_menu(app.handle(), false)?)?;

    #[cfg(not(target_os = "macos"))]
    {
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
    }
    app.on_menu_event(|app, event| match event.id().as_ref() {
        "settings"
        | "about"
        | "appearance"
        | "connection"
        | "nav_workspace"
        | "nav_ai_create"
        | "nav_library"
        | "nav_canvas"
        | "canvas_new"
        | "canvas_save"
        | "canvas_import"
        | "canvas_export"
        | "canvas_reset_view"
        | "canvas_undo"
        | "canvas_redo"
        | "canvas_cut"
        | "canvas_copy"
        | "canvas_paste"
        | "canvas_select_all"
        | "nav_text_to_image"
        | "nav_image_to_image"
        | "nav_virtual_try_on"
        | "nav_text_to_video"
        | "nav_image_to_video"
        | "nav_reference_to_video"
        | "toggle_sidebar" => {
            focus_main_window(app);
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("desktop-menu", event.id().as_ref());
            }
        }
        "open_media_folder" => {
            if let Err(error) = crate::media::open_media_storage_directory(app.clone()) {
                eprintln!("Could not open media folder: {error}");
            }
        }
        "open_logs" => {
            if let Err(error) = crate::logs::open_log_directory(app.clone()) {
                eprintln!("Could not open log folder: {error}");
            }
        }
        "quit" => {
            save_window(app);
            app.exit(0);
        }
        "help" => {
            #[cfg(target_os = "macos")]
            {
                focus_main_window(app);
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("desktop-menu", "help");
                }
            }
            #[cfg(not(target_os = "macos"))]
            let _ = app.opener().open_url("https://flaq.ai/docs", None::<&str>);
        }
        _ => {}
    });
    if let Some(window) = app.get_webview_window("main") {
        #[cfg(target_os = "windows")]
        window.set_decorations(false)?;

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
