export type ThemePreference = 'system' | 'light' | 'dark';
export type AppPreferences = { version: 1; theme: ThemePreference; collapsed: boolean };
export const PREFERENCES_KEY = 'flaq-desktop-preferences';
export const DEFAULT_PREFERENCES: AppPreferences = { version: 1, theme: 'system', collapsed: false };

export function parsePreferences(value: string | null): AppPreferences {
  try {
    const data = JSON.parse(value || 'null');
    if (data?.version !== 1) return { ...DEFAULT_PREFERENCES };
    return {
      version: 1,
      theme: ['system', 'light', 'dark'].includes(data.theme) ? data.theme : 'system',
      collapsed: data.collapsed === true,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}
