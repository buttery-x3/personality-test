import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2']
]);

// Caddy strips /personality before proxying requests to this static server.
export function createStaticServer(buildRoot) {
  const root = path.resolve(buildRoot);

  return createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method Not Allowed');
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400);
      response.end('Bad Request');
      return;
    }

    if (pathname.includes('\0') || pathname.split(/[\\/]/).some((part) => part.startsWith('.'))) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    let filePath = path.resolve(root, `.${pathname}`);
    const relative = path.relative(root, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    try {
      let stats = await stat(filePath);
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
        stats = await stat(filePath);
      }
      if (!stats.isFile()) {
        response.writeHead(404);
        response.end('Not Found');
        return;
      }

      const immutable = path
        .relative(root, filePath)
        .replaceAll(path.sep, '/')
        .startsWith('_app/immutable/');
      response.writeHead(200, {
        'Content-Type': mimeTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
        'Content-Length': stats.size,
        'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      });
      if (request.method === 'HEAD') response.end();
      else await pipeline(createReadStream(filePath), response);
    } catch (error) {
      if (response.headersSent) {
        response.destroy();
        return;
      }
      const missing = error.code === 'ENOENT' || error.code === 'ENOTDIR';
      if (!missing) console.error(error);
      response.writeHead(missing ? 404 : 500);
      response.end(missing ? 'Not Found' : 'Internal Server Error');
    }
  });
}
