#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if [[ "$(id -un)" != "flamehorn" ]]; then
  echo 'Run this deployment as flamehorn so it uses the existing PM2 service.' >&2
  exit 1
fi

exec 9>.deploy.lock
flock -n 9 || { echo 'Another deployment is already running.' >&2; exit 1; }

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo 'Production deployments must run from the main branch.' >&2
  exit 1
fi
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo 'Commit or stash tracked changes before deploying.' >&2
  exit 1
fi

git pull --ff-only origin main
npm ci --include=dev
npm run check
npm test
npm run validate:coverage

# Build away from the live directory; failed builds leave the live site intact.
export VITE_BASE_PATH=/personality
export BUILD_DIR=.deploy/build-next
npm run build
test -s "$BUILD_DIR/index.html"
mkdir -p build
# Keep older hashed assets available for visitors with an already-open page.
# Publish the new HTML only after all of its assets have been copied.
rsync -a --exclude=index.html "$BUILD_DIR/" build/
cp "$BUILD_DIR/index.html" build/.index.html.next
mv -f build/.index.html.next build/index.html

npm run pm2:reload
curl --fail --silent --show-error --retry 10 --retry-connrefused --retry-delay 1 \
  http://127.0.0.1:4005/ -o /dev/null
pm2 save
pm2 status personality-test
echo 'Manyfold personality test deployed: https://buttery.wtf/personality/'
