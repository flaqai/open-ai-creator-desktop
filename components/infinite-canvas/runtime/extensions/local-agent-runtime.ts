export const CANVAS_AGENT_PROTOCOL_VERSION = 6;

export interface CanvasAgentConnection {
  readonly endpoint: string;
  readonly token: string;
  readonly protocolVersion: number;
}

interface AgentConfigResponse {
  readonly ok?: boolean;
  readonly protocolVersion?: number;
  readonly url?: string;
  readonly token?: string;
}

export async function discoverCanvasAgent(endpoint: string, signal?: AbortSignal): Promise<CanvasAgentConnection> {
  const normalized = endpoint.trim().replace(/\/$/, '');
  const response = await fetch(`${normalized}/config`, { signal });
  if (!response.ok) throw new Error(`Canvas Agent discovery failed with HTTP ${response.status}`);
  const config = (await response.json()) as AgentConfigResponse;
  if (!config.ok || typeof config.protocolVersion !== 'number' || typeof config.token !== 'string') {
    throw new TypeError('Invalid Canvas Agent discovery response');
  }
  return {
    endpoint: (config.url ?? normalized).replace(/\/$/, ''),
    protocolVersion: config.protocolVersion,
    token: config.token,
  };
}

export function canvasAgentEventsUrl(connection: CanvasAgentConnection, clientId: string): string {
  return `${connection.endpoint}/events?token=${encodeURIComponent(connection.token)}&clientId=${encodeURIComponent(clientId)}`;
}

export async function sendCanvasAgentPrompt(
  connection: CanvasAgentConnection,
  input: { readonly clientId: string; readonly messageId: string; readonly prompt: string },
): Promise<void> {
  const response = await fetch(
    `${connection.endpoint}/agent/codex/turn?token=${encodeURIComponent(connection.token)}`,
    {
      body: JSON.stringify({
        clientId: input.clientId,
        messageId: input.messageId,
        messageText: input.prompt,
        permissionMode: 'request',
        prompt: input.prompt,
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    },
  );
  if (!response.ok) throw new Error(`Canvas Agent turn failed with HTTP ${response.status}`);
}

export async function postCanvasAgentState(
  connection: CanvasAgentConnection,
  clientId: string,
  snapshot: unknown,
): Promise<void> {
  await fetch(
    `${connection.endpoint}/canvas/state?token=${encodeURIComponent(connection.token)}&clientId=${encodeURIComponent(clientId)}`,
    {
      body: JSON.stringify({ ...(snapshot as object), hasCanvas: true }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    },
  );
}

export async function postCanvasAgentToolResult(
  connection: CanvasAgentConnection,
  clientId: string,
  input: { readonly requestId: string; readonly result?: unknown; readonly error?: string },
): Promise<void> {
  await fetch(
    `${connection.endpoint}/canvas/result?clientId=${encodeURIComponent(clientId)}&token=${encodeURIComponent(connection.token)}`,
    {
      body: JSON.stringify(input),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    },
  );
}
