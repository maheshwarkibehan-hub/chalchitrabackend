import { directSource } from "@/lib/runtime/direct-source";
import { webApiSource } from "@/lib/runtime/web-api-source";
import type { AppDataSource, DataMode } from "@/lib/runtime/types";

declare global {
  interface Window {
    Capacitor?: unknown;
    ReactNativeWebView?: unknown;
  }
}

function isNativeShell(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.Capacitor || window.ReactNativeWebView);
}

export function getDataSource(mode: DataMode = "auto"): AppDataSource {
  if (mode === "direct") return directSource;
  if (mode === "web-api") return webApiSource;

  if (typeof window === "undefined") {
    return directSource;
  }

  const standalonePreferred = process.env.NEXT_PUBLIC_STANDALONE_MODE === "true";
  if (standalonePreferred && isNativeShell()) {
    return directSource;
  }

  return webApiSource;
}

export async function withDataSource<T>(
  fn: (source: AppDataSource) => Promise<T>,
  mode: DataMode = "auto",
): Promise<T> {
  const source = getDataSource(mode);
  return fn(source);
}
