/**
 * Event-Namen für die IPC-Kommunikation zwischen Control Panel und Overlay.
 * Beide Fenster laufen im selben Tauri-Prozess und kommunizieren über
 * emitTo(...) / listen(...).
 */
export const EVT_TRIGGER_EFFECT = "deltafx://trigger-effect";
export const EVT_CLEAR_QUEUE = "deltafx://clear-queue";
export const EVT_SHOW_GUIDES = "deltafx://show-guides";

export const OVERLAY_WINDOW = "overlay";
