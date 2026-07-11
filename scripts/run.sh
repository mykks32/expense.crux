#!/usr/bin/env bash
# Runs the published expense-crux backend image standalone, alongside a
# Mongo container, on a shared Docker network. For when you don't have
# an external Mongo and don't want to use docker compose.
#
# Usage: scripts/run.sh [path-to-env-file]
# Defaults to env/backend.env — copy env/backend.env.example there first,
# fill in real secrets, and make sure MONGO_URI's host is
# "expense-crux-mongo" (see the comment in that file).
set -euo pipefail

if command -v docker >/dev/null 2>&1; then
  DOCKER=docker
elif command -v podman >/dev/null 2>&1; then
  DOCKER=podman
else
  echo "error: neither docker nor podman found on PATH." >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

NETWORK="expense-crux-standalone"
MONGO_CONTAINER="expense-crux-mongo"
BACKEND_CONTAINER="expense-crux-backend"
IMAGE="ghcr.io/mykks32/expense-crux-backend:latest"
ENV_FILE="${1:-$REPO_ROOT/env/backend.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "error: $ENV_FILE not found." >&2
  echo "Copy env/backend.env.example to $ENV_FILE and fill in real secrets first." >&2
  exit 1
fi

if grep -q "change-me" "$ENV_FILE"; then
  echo "warning: $ENV_FILE still has placeholder secrets (change-me...)." >&2
  echo "         fine for local testing, but never use this for anything real." >&2
fi

if ! grep -q "expense-crux-mongo" "$ENV_FILE"; then
  echo "warning: $ENV_FILE's MONGO_URI doesn't reference expense-crux-mongo —" >&2
  echo "         if it still says localhost or mongo, the backend won't be able" >&2
  echo "         to reach the Mongo container this script creates." >&2
fi

"$DOCKER" network inspect "$NETWORK" >/dev/null 2>&1 || "$DOCKER" network create "$NETWORK"

"$DOCKER" rm -f "$MONGO_CONTAINER" >/dev/null 2>&1 || true
"$DOCKER" run -d --name "$MONGO_CONTAINER" --network "$NETWORK" -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=mongo \
  -e MONGO_INITDB_ROOT_PASSWORD=mongo \
  -e MONGO_INITDB_DATABASE=expense_crux \
  mongo:7 >/dev/null

"$DOCKER" rm -f "$BACKEND_CONTAINER" >/dev/null 2>&1 || true
"$DOCKER" run -d --name "$BACKEND_CONTAINER" --network "$NETWORK" -p 3000:3000 \
  --env-file "$ENV_FILE" \
  "$IMAGE" >/dev/null

echo "expense-crux-backend running at http://localhost:3000"
echo "logs: $DOCKER logs -f $BACKEND_CONTAINER"
