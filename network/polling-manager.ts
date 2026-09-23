export type PollTask = { traceId: string; type: 'image' | 'video'; submitTime: number };
type PollState = { controller: AbortController; timer?: ReturnType<typeof setTimeout> };
type PollingOptions = {
  poll: (task: PollTask, signal: AbortSignal) => Promise<'pending' | 'done'>;
  onError?: (task: PollTask, error: unknown) => void;
  timeout: (task: PollTask) => void;
  finish: (task: PollTask) => void;
  interval?: number;
  maxAge?: (task: PollTask) => number;
  now?: () => number;
};

/** Reserves tasks synchronously and invalidates in-flight work when stopped. */
export class PollingManager {
  private active = new Map<string, { task: PollTask; state: PollState }>();
  constructor(private options: PollingOptions) {}
  private key(task: PollTask) {
    return `${task.type}:${task.traceId}`;
  }

  start(task: PollTask): boolean {
    const key = this.key(task);
    if (this.active.has(key)) return false;
    const state = { controller: new AbortController() };
    this.active.set(key, { task, state });
    void this.tick(task, state);
    return true;
  }

  private async tick(task: PollTask, state: PollState) {
    const { signal } = state.controller;
    try {
      const result = await this.options.poll(task, signal);
      if (signal.aborted) return;
      if (result === 'done') {
        this.stop(task);
        return;
      }
    } catch (error) {
      // Network errors are transient. The age limit still bounds retries.
      if (!signal.aborted) this.options.onError?.(task, error);
    }
    const maxAge = this.options.maxAge?.(task) ?? (task.type === 'video' ? 30 : 10) * 60_000;
    if (!signal.aborted && (this.options.now?.() ?? Date.now()) - task.submitTime > maxAge) {
      this.options.timeout(task);
      this.stop(task);
      return;
    }
    if (!signal.aborted) state.timer = setTimeout(() => void this.tick(task, state), this.options.interval ?? 3000);
  }

  stop(task: PollTask) {
    const key = this.key(task);
    const active = this.active.get(key);
    if (!active) return;
    active.state.controller.abort();
    if (active.state.timer) clearTimeout(active.state.timer);
    this.active.delete(key);
    this.options.finish(active.task);
  }

  stopAll() {
    for (const { task } of this.active.values()) this.stop(task);
  }
  get size() {
    return this.active.size;
  }
}
