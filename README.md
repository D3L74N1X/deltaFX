# deltaFX

**Standalone Overlay-App für OBS / TikTok LIVE Studio.**

deltaFX öffnet beim Start **zwei Fenster**:

| Fenster | Zweck |
| --- | --- |
| **Control Panel** | Normales Desktop-Fenster: Medien verwalten, Hotkeys festlegen, Effekte manuell triggern |
| **Overlay** | Transparent, randlos, immer im Vordergrund – wird in OBS als Fensteraufnahme eingebunden |

Beide Fenster laufen im selben Tauri-Prozess und kommunizieren über Tauri-Events (IPC):
Das Control Panel sendet z. B. `deltafx://trigger-effect`, das Overlay lauscht darauf und
spielt den Effekt ab.

## Features

- **Asset Manager** – Medien werden beim Import in das App-Datenverzeichnis kopiert
  (`AppData/…/assets`), damit Pfade nicht kaputtgehen, wenn Originaldateien verschoben werden.
- **Unterstützte Formate**
  - Bilder: PNG, GIF, WEBP, JPG, AVIF
  - Videos: **WebM (VP8/VP9) mit Alpha-Kanal** für transparente Effekte (MP4 kann keine
    Transparenz im WebView!), außerdem MP4/MOV ohne Transparenz
  - Sounds: MP3, WAV, OGG, FLAC
  - 3D-Modelle: **GLTF/GLB**, gerendert mit Three.js (@react-three/fiber), automatisch rotierend
- **Positionierungs-Grid** – 3×3-Raster (Top-Left … Bottom-Right) oder eigene X/Y-Koordinaten
  in Prozent, plus Größenregler.
- **Ein-/Ausblend-Animationen** – Fade, Scale, Bounce und Slide aus allen vier Richtungen
  (Framer Motion).
- **Globale Hotkeys** – über `tauri-plugin-global-shortcut`; funktionieren auch, wenn der
  Streamer im Spiel ist (z. B. `Control+Shift+F`).
- **Queue-System** – Werden mehrere Effekte gleichzeitig getriggert, spielt das Overlay sie
  **nacheinander** ab, damit sich Videos und Sounds nicht überlappen.
- **Click-through** – Mausklicks gehen optional durch das Overlay-Fenster an das Spiel dahinter.
- **Hilfsrahmen** – Einblendbarer Rahmen im Overlay, um das Fenster in OBS leichter
  auszuwählen und auszurichten.

## Einrichtung in OBS

1. deltaFX starten – das transparente Overlay-Fenster öffnet sich automatisch mit.
2. In OBS eine **Fensteraufnahme (Window Capture)** hinzufügen.
3. Das Fenster **„deltaFX – Overlay“** auswählen.
4. In den Quelleneigenschaften **Transparenz zulassen** aktivieren
   (Windows: Aufnahmemethode „Windows 10 (1903 und neuer)“).
5. Im Control Panel den **Hilfsrahmen** aktivieren, um die Quelle auszurichten, danach
   wieder ausschalten.

Für TikTok LIVE Studio funktioniert das gleiche Prinzip über dessen Fensteraufnahme-Quelle.

## Entwicklung

Voraussetzungen: [Rust](https://rustup.rs), Node.js ≥ 20 und die
[Tauri-Systemabhängigkeiten](https://v2.tauri.app/start/prerequisites/)
(unter Linux u. a. `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`).

```bash
npm install
npm run tauri dev     # App im Dev-Modus starten (beide Fenster)
npm run tauri build   # Installierbares Bundle bauen
npm run build         # Nur Frontend typechecken + bauen
npm run icons         # App-Icons neu generieren
```

> **Hinweis:** `time` ist in `Cargo.lock` auf 0.3.47 gepinnt, weil 0.3.48 einen
> Trait-Konflikt (E0119) mit `tauri-utils` auslöst. Bei einem `cargo update` ggf. mit
> `cargo update time --precise 0.3.47` wieder pinnen.

### Projektstruktur

```
index.html / overlay.html   Einstiegspunkte der beiden Fenster (Vite Multi-Page)
src/control/                Control Panel (React, Zustand-Store, Hotkey-Registrierung)
src/overlay/                Overlay (Effekt-Queue, Renderer, Three.js-Modellviewer)
src/lib/                    Gemeinsame Helfer (Event-Namen, Asset-URLs)
src-tauri/                  Rust-Backend (Asset-Import, Konfiguration, Click-through)
```

### Tech-Stack

Tauri 2 (Rust) · React 18 + TypeScript · Tailwind CSS 4 · Zustand · Framer Motion ·
@react-three/fiber + drei

## Roadmap

- **Twitch/TikTok-Integration:** Effekte durch Chat-Befehle (`!dance`), Abos oder
  TikTok-Geschenke triggern. Die Trigger-Pipeline ist dafür vorbereitet – jede Quelle
  muss am Ende nur `deltafx://trigger-effect` an das Overlay senden.
- Mehrere Overlay-Szenen / Profile
- Drag-&-Drop-Positionierung direkt im Overlay

## Lizenz

MIT – siehe [LICENSE](LICENSE).
