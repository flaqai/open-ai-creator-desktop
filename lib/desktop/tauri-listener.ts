export type TauriUnlisten = () => void | Promise<void>;

/** Tauri's runtime unlisten function is async even though its public type currently returns void. */
export async function safelyUnlisten(unlisten: TauriUnlisten | undefined): Promise<void> {
  if (!unlisten) return;
  try {
    await unlisten();
  } catch {
    // The runtime may already have removed this listener during reload or teardown.
  }
}
