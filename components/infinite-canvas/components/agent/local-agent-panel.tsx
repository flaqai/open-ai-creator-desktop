'use client';

import { useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { CanvasAgentOp, CanvasAgentSnapshot } from '../../runtime/extensions/agent-canvas-ops';
import {
  CANVAS_AGENT_PROTOCOL_VERSION,
  canvasAgentEventsUrl,
  discoverCanvasAgent,
  postCanvasAgentState,
  postCanvasAgentToolResult,
  sendCanvasAgentPrompt,
  type CanvasAgentConnection,
} from '../../runtime/extensions/local-agent-runtime';
import { useInfiniteCanvasI18n } from '../../runtime/i18n/infinite-canvas-context';

interface AgentMessage {
  readonly id: string;
  readonly role: string;
  readonly text: string;
}

export default function LocalAgentPanel({
  endpoint,
  storageKeyPrefix,
  snapshot,
  onApplyOps,
}: {
  readonly endpoint: string;
  readonly storageKeyPrefix: string;
  readonly snapshot: CanvasAgentSnapshot;
  readonly onApplyOps: (ops: readonly CanvasAgentOp[]) => CanvasAgentSnapshot;
}) {
  const i18n = useInfiniteCanvasI18n();
  const clientId = useRef(nanoid());
  const snapshotRef = useRef(snapshot);
  const onApplyOpsRef = useRef(onApplyOps);
  const [connection, setConnection] = useState<CanvasAgentConnection | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'unavailable' | 'protocol-mismatch'>('connecting');
  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<readonly AgentMessage[]>([]);

  useEffect(() => {
    snapshotRef.current = snapshot;
    onApplyOpsRef.current = onApplyOps;
  }, [onApplyOps, snapshot]);

  useEffect(() => {
    const controller = new AbortController();
    let source: EventSource | undefined;
    void discoverCanvasAgent(endpoint, controller.signal)
      .then((next) => {
        if (next.protocolVersion !== CANVAS_AGENT_PROTOCOL_VERSION) {
          setStatus('protocol-mismatch');
          return;
        }
        window.localStorage.setItem(
          `${storageKeyPrefix}:infinite-canvas:v1:agent-config`,
          JSON.stringify({ endpoint: next.endpoint }),
        );
        setConnection(next);
        source = new EventSource(canvasAgentEventsUrl(next, clientId.current));
        source.addEventListener('hello', () => setStatus('connected'));
        source.addEventListener('chat_message', (event) => {
          try {
            const data = JSON.parse((event as MessageEvent<string>).data) as { readonly message?: AgentMessage };
            if (data.message?.id && data.message.text) {
              setMessages((current) => [
                ...current.filter((message) => message.id !== data.message!.id),
                data.message!,
              ]);
            }
          } catch {
            // Ignore malformed local-companion events without affecting the Canvas project.
          }
        });
        source.addEventListener('tool_call', (event) => {
          try {
            const payload = JSON.parse((event as MessageEvent<string>).data) as {
              readonly requestId?: string;
              readonly name?: string;
              readonly input?: { readonly ops?: readonly CanvasAgentOp[] };
            };
            if (!payload.requestId) return;
            if (payload.name !== 'canvas_apply_ops') {
              void postCanvasAgentToolResult(next, clientId.current, {
                requestId: payload.requestId,
                error: 'Unsupported Canvas Agent tool',
              });
              return;
            }
            const result = onApplyOpsRef.current(payload.input?.ops ?? []);
            snapshotRef.current = result;
            void postCanvasAgentToolResult(next, clientId.current, { requestId: payload.requestId, result });
            void postCanvasAgentState(next, clientId.current, result);
          } catch {
            // Ignore malformed local-companion tool calls.
          }
        });
        source.addEventListener('error', () => setStatus('unavailable'));
      })
      .catch(() => setStatus('unavailable'));
    return () => {
      controller.abort();
      source?.close();
    };
  }, [endpoint, storageKeyPrefix]);

  useEffect(() => {
    if (connection === null) return;
    const timer = setTimeout(() => void postCanvasAgentState(connection, clientId.current, snapshot), 300);
    return () => clearTimeout(timer);
  }, [connection, snapshot]);

  const submit = async () => {
    const text = prompt.trim();
    if (connection === null || !text || sending) return;
    const messageId = nanoid();
    setMessages((current) => [...current, { id: messageId, role: 'user', text }]);
    setPrompt('');
    setSending(true);
    try {
      await sendCanvasAgentPrompt(connection, { clientId: clientId.current, messageId, prompt: text });
    } catch {
      setStatus('unavailable');
    } finally {
      setSending(false);
    }
  };

  return (
    <aside
      data-canvas-overlay
      className='absolute bottom-4 right-4 z-40 flex max-h-[70vh] w-96 flex-col rounded-xl border border-canvas-border bg-canvas-panel p-4 text-canvas-text shadow-xl'
    >
      <h2 className='font-medium'>{i18n.agent.open}</h2>
      <p className='mt-1 text-xs text-gray-color'>
        {status === 'connecting'
          ? i18n.agent.connecting
          : status === 'connected'
            ? i18n.agent.connected
            : status === 'protocol-mismatch'
              ? i18n.agent.protocolMismatch
              : i18n.agent.unavailable}
      </p>
      <ol className='my-3 min-h-20 flex-1 space-y-2 overflow-auto text-sm'>
        {messages.map((message) => (
          <li key={message.id} className='rounded border p-2'>
            <strong className='mr-2'>{message.role}</strong>
            {message.text}
          </li>
        ))}
      </ol>
      <Textarea
        value={prompt}
        placeholder={i18n.agent.promptPlaceholder}
        disabled={status !== 'connected'}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <Button
        type='button'
        className='mt-2'
        disabled={status !== 'connected' || sending || !prompt.trim()}
        onClick={() => void submit()}
      >
        {i18n.agent.send}
      </Button>
    </aside>
  );
}
