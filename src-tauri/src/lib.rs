use std::fs;
use std::path::PathBuf;

use serde::Serialize;
use tauri::{AppHandle, Manager};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ImportedAsset {
    file_name: String,
    original_name: String,
    kind: String,
}

/// Asset-Verzeichnis im AppData-Ordner. Medien werden hierher kopiert,
/// damit Pfade nicht kaputtgehen, wenn der User Originaldateien verschiebt.
fn assets_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("assets");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn kind_for_ext(ext: &str) -> &'static str {
    match ext.to_ascii_lowercase().as_str() {
        "png" | "jpg" | "jpeg" | "gif" | "webp" | "avif" | "svg" => "image",
        "webm" | "mp4" | "mov" => "video",
        "mp3" | "wav" | "ogg" | "flac" | "m4a" => "audio",
        "glb" | "gltf" => "model",
        _ => "image",
    }
}

fn validate_file_name(file_name: &str) -> Result<(), String> {
    if file_name.is_empty()
        || file_name.contains('/')
        || file_name.contains('\\')
        || file_name.contains("..")
    {
        return Err("Ungültiger Dateiname".into());
    }
    Ok(())
}

/// Kopiert eine Mediendatei in das Asset-Verzeichnis der App.
#[tauri::command]
fn import_asset(app: AppHandle, src_path: String) -> Result<ImportedAsset, String> {
    let src = PathBuf::from(&src_path);
    if !src.is_file() {
        return Err(format!("Datei nicht gefunden: {src_path}"));
    }
    let ext = src
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_string();
    let original_name = src
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("asset")
        .to_string();
    let file_name = if ext.is_empty() {
        uuid::Uuid::new_v4().to_string()
    } else {
        format!("{}.{}", uuid::Uuid::new_v4(), ext.to_ascii_lowercase())
    };
    let dest = assets_dir(&app)?.join(&file_name);
    fs::copy(&src, &dest).map_err(|e| format!("Kopieren fehlgeschlagen: {e}"))?;
    Ok(ImportedAsset {
        file_name,
        original_name,
        kind: kind_for_ext(&ext).to_string(),
    })
}

#[tauri::command]
fn delete_asset(app: AppHandle, file_name: String) -> Result<(), String> {
    validate_file_name(&file_name)?;
    let path = assets_dir(&app)?.join(file_name);
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn load_effects(app: AppHandle) -> Result<String, String> {
    let path = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("effects.json");
    if path.exists() {
        fs::read_to_string(path).map_err(|e| e.to_string())
    } else {
        Ok("[]".into())
    }
}

#[tauri::command]
fn save_effects(app: AppHandle, json: String) -> Result<(), String> {
    // Validierung, damit keine kaputte Konfiguration gespeichert wird
    serde_json::from_str::<serde_json::Value>(&json).map_err(|e| e.to_string())?;
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    fs::write(dir.join("effects.json"), json).map_err(|e| e.to_string())
}

/// Schaltet das Overlay-Fenster auf "Click-through": Mausklicks gehen
/// durch das Fenster hindurch an das Spiel dahinter.
#[tauri::command]
fn set_clickthrough(app: AppHandle, enabled: bool) -> Result<(), String> {
    let overlay = app
        .get_webview_window("overlay")
        .ok_or("Overlay-Fenster nicht gefunden")?;
    overlay
        .set_ignore_cursor_events(enabled)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            import_asset,
            delete_asset,
            load_effects,
            save_effects,
            set_clickthrough
        ])
        .run(tauri::generate_context!())
        .expect("Fehler beim Starten von deltaFX");
}
