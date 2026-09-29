# Deployment on buttery.wtf

## Server conventions

- Repository: https://github.com/buttery-x3/personality-test (public, anonymous HTTPS pulls; no deploy key).
- Checkout: `/home/flamehorn/personality-test` on the Hetzner VPS.
- Unix owner and PM2 user: `flamehorn`.
- PM2 process: `personality-test`, configured in `ecosystem.config.cjs`.
- Static HTTP service: `127.0.0.1:4005`, started by `server/static-server.mjs`.
- Public URL: https://buttery.wtf/personality/ (`/personality` redirects to the trailing slash).
- Node.js: 22.12+; the server already provides Node 22 and global PM2.
- System tools: Bash, Git, npm, curl, flock, rsync.
- Reboot persistence: the existing `pm2-flamehorn` systemd service and `pm2 save`.

Survey responses and saved results stay in each visitor's browser. The server only serves static files.

## Updates

Commit and push your local changes to `main`, then run:

```powershell
ssh hetzner-server "sudo -iu flamehorn bash /home/flamehorn/personality-test/deploy.sh"
```

On the server as `flamehorn`, either `./deploy.sh` or `npm run deploy:production` works from the checkout. The deploy script uses the same pull/build/PM2 pattern as the other buttery projects. It builds into `.deploy/build-next` so failed builds leave the live `build` directory intact. Assets are copied before atomically replacing the homepage, and old hashed chunks are retained for existing browser sessions. Deployment exits with a nonzero status if a check fails.

`VITE_BASE_PATH=/personality` is a build setting. Local development and ordinary local builds default to `/`. Production Caddy strips `/personality` before proxying, so the Node server receives `/`, `/favicon.svg`, and `/_app/...`. See [SvelteKit paths](https://svelte.dev/docs/kit/configuration#paths) and [Caddy handle_path](https://caddyserver.com/docs/caddyfile/directives/handle_path).

## Caddy and the project registry

The following block lives inside the existing `buttery.wtf, www.buttery.wtf` site in `/etc/caddy/Caddyfile`, before its fallback handler:

```caddyfile
redir /personality /personality/ 308

handle_path /personality/* {
    reverse_proxy 127.0.0.1:4005
}
```

The hub reads `/home/flamehorn/buttery-hub/projects.json` on every home-page request. The registered entry is:

```json
{
  "slug": "personality",
  "name": "manyfold personality test",
  "description": "one personality survey, six perspectives",
  "repo": "https://github.com/buttery-x3/personality-test.git",
  "path": "/home/flamehorn/personality-test",
  "port": 4005,
  "pm2Name": "personality-test",
  "enabled": true
}
```

At initial deployment, the hub's `scripts/render-caddy.mjs` still contained obsolete Vibe routes that were absent from the active Caddyfile. Registration therefore updates the registry and the active Caddyfile directly. Do not run that old generator or `add-project` until the generator has been reconciled with the current configuration. Routine updates use this repository's deploy script and do not need hub or Caddy changes.

## Status and logs

Run PM2 commands as `flamehorn`:

```bash
pm2 status personality-test
pm2 logs personality-test --lines 50 --nostream
curl --fail http://127.0.0.1:4005/ -o /dev/null
curl --fail https://buttery.wtf/personality/ -o /dev/null
```

The repository's static-server tests check document and asset responses, HEAD, cache headers, missing files, invalid URLs, traversal attempts, and unsupported methods. The production deploy also runs the existing scoring/session tests, Svelte diagnostics, and question-coverage audit.
