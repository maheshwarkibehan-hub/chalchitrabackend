"use client";

import { useAppStore } from "@/lib/store";

export default function SettingsPage() {
  const preferences = useAppStore((state) => state.preferences);
  const updatePreferences = useAppStore((state) => state.updatePreferences);
  const clearWatchHistory = useAppStore((state) => state.clearWatchHistory);
  const clearSearchHistory = useAppStore((state) => state.clearSearchHistory);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-medium text-yt-textPrimary">Settings</h1>

      <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4">
        <h2 className="mb-3 text-lg font-medium">Playback</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-yt-textSecondary">Default video quality</span>
            <select
              className="h-10 w-full rounded-lg border border-yt-border bg-yt-input px-3"
              value={preferences.defaultVideoQuality}
              onChange={(event) =>
                updatePreferences({
                  defaultVideoQuality: event.target.value as "Auto" | "144p" | "360p" | "480p" | "720p" | "1080p",
                })
              }
            >
              {[
                "Auto",
                "144p",
                "360p",
                "480p",
                "720p",
                "1080p",
              ].map((quality) => (
                <option key={quality}>{quality}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-yt-textSecondary">Default audio quality</span>
            <select
              className="h-10 w-full rounded-lg border border-yt-border bg-yt-input px-3"
              value={preferences.defaultAudioQuality}
              onChange={(event) =>
                updatePreferences({
                  defaultAudioQuality: event.target.value as "Low" | "Medium" | "High",
                })
              }
            >
              {["Low", "Medium", "High"].map((quality) => (
                <option key={quality}>{quality}</option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-yt-textSecondary">Default playback speed</span>
            <select
              className="h-10 w-full rounded-lg border border-yt-border bg-yt-input px-3"
              value={preferences.defaultPlaybackSpeed}
              onChange={(event) => updatePreferences({ defaultPlaybackSpeed: Number(event.target.value) })}
            >
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4].map((speed) => (
                <option key={speed} value={speed}>
                  {speed}x
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center justify-between rounded-lg border border-yt-border bg-yt-base px-3 py-2 text-sm">
            <span>Stable volume</span>
            <input
              type="checkbox"
              checked={preferences.stableVolumeEnabled}
              onChange={(event) => updatePreferences({ stableVolumeEnabled: event.target.checked })}
              className="h-4 w-4 accent-yt-accent"
            />
          </label>

          <label className="flex items-center justify-between rounded-lg border border-yt-border bg-yt-base px-3 py-2 text-sm">
            <span>Autoplay</span>
            <input
              type="checkbox"
              checked={preferences.autoplayEnabled}
              onChange={(event) => updatePreferences({ autoplayEnabled: event.target.checked })}
              className="h-4 w-4 accent-yt-accent"
            />
          </label>
        </div>
      </section>

      <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4">
        <h2 className="mb-3 text-lg font-medium">Privacy</h2>
        <label className="flex items-center justify-between rounded-lg border border-yt-border bg-yt-base px-3 py-2 text-sm">
          <span>SponsorBlock enabled</span>
          <input
            type="checkbox"
            checked={preferences.sponsorBlockEnabled}
            onChange={(event) => updatePreferences({ sponsorBlockEnabled: event.target.checked })}
            className="h-4 w-4 accent-yt-accent"
          />
        </label>
      </section>

      <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4">
        <h2 className="mb-3 text-lg font-medium">Appearance</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-yt-textSecondary">Theme</span>
            <select
              className="h-10 w-full rounded-lg border border-yt-border bg-yt-input px-3"
              value={preferences.theme}
              onChange={(event) =>
                updatePreferences({
                  theme: event.target.value as "dark" | "light" | "system",
                })
              }
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </label>

          <label className="flex items-center justify-between rounded-lg border border-yt-border bg-yt-base px-3 py-2 text-sm">
            <span>Ambient mode</span>
            <input
              type="checkbox"
              checked={preferences.ambientModeEnabled}
              onChange={(event) => updatePreferences({ ambientModeEnabled: event.target.checked })}
              className="h-4 w-4 accent-yt-accent"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-yt-textSecondary">Content language</span>
            <select
              className="h-10 w-full rounded-lg border border-yt-border bg-yt-input px-3"
              value={preferences.contentLanguage}
              onChange={(event) => updatePreferences({ contentLanguage: event.target.value })}
            >
              <option value="hi">Hindi</option>
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="bn">Bengali</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
              <option value="kn">Kannada</option>
              <option value="ml">Malayalam</option>
              <option value="pa">Punjabi</option>
              <option value="ur">Urdu</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
              <option value="ru">Russian</option>
              <option value="ar">Arabic</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-yt-textSecondary">Content region</span>
            <select
              className="h-10 w-full rounded-lg border border-yt-border bg-yt-input px-3"
              value={preferences.contentRegion}
              onChange={(event) => updatePreferences({ contentRegion: event.target.value })}
            >
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="JP">Japan</option>
              <option value="KR">South Korea</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="BR">Brazil</option>
              <option value="AE">UAE</option>
            </select>
          </label>

          <label className="flex items-center justify-between rounded-lg border border-yt-border bg-yt-base px-3 py-2 text-sm">
            <span>Captions by default</span>
            <input
              type="checkbox"
              checked={preferences.captionsEnabled}
              onChange={(event) => updatePreferences({ captionsEnabled: event.target.checked })}
              className="h-4 w-4 accent-yt-accent"
            />
          </label>
        </div>
      </section>

      <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4">
        <h2 className="mb-3 text-lg font-medium">History</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={clearWatchHistory} className="h-9 rounded-full bg-yt-chip px-4 text-sm hover:bg-yt-hover">
            Clear watch history
          </button>
          <button type="button" onClick={clearSearchHistory} className="h-9 rounded-full bg-yt-chip px-4 text-sm hover:bg-yt-hover">
            Clear search history
          </button>
          <label className="inline-flex h-9 items-center gap-2 rounded-full bg-yt-chip px-4 text-sm">
            Pause history
            <input
              type="checkbox"
              checked={preferences.pauseWatchHistory}
              onChange={(event) => updatePreferences({ pauseWatchHistory: event.target.checked })}
              className="h-4 w-4 accent-yt-accent"
            />
          </label>
        </div>
      </section>

      <section className="rounded-ytMenu border border-yt-border bg-yt-elevated p-4 text-sm text-yt-textSecondary">
        <h2 className="mb-1 text-lg font-medium text-yt-textPrimary">About</h2>
        <p>Chalchitra v0.1.0</p>
        <p>Standalone-ready architecture: use adapter mode to run web API mode now and direct mode in native mobile shell later.</p>
      </section>
    </div>
  );
}
