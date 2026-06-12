import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";

let assetsDirPromise: Promise<string> | null = null;

function assetsDir(): Promise<string> {
  if (!assetsDirPromise) {
    assetsDirPromise = appDataDir().then((dir) => join(dir, "assets"));
  }
  return assetsDirPromise;
}

/**
 * Wandelt einen Dateinamen aus dem Asset-Verzeichnis in eine URL um,
 * die der WebView über das Tauri-Asset-Protokoll laden darf.
 */
export async function assetUrl(fileName: string): Promise<string> {
  const dir = await assetsDir();
  return convertFileSrc(await join(dir, fileName));
}
