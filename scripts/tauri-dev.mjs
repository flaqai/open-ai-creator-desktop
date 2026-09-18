import net from 'node:net';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DESKTOP_DEV_HOST = 'localhost';
export const DESKTOP_DEV_PORT = 31415;

export function assertDesktopDevPortAvailable(port = DESKTOP_DEV_PORT, host = DESKTOP_DEV_HOST) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        reject(
          new Error(
            `Desktop development port ${host}:${port} is already in use. Close the existing Flaq Creator Dev process before restarting.`,
          ),
        );
        return;
      }
      reject(error);
    });
    server.listen(port, host, () => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await assertDesktopDevPortAvailable();
}
