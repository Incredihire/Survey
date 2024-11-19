#! /usr/bin/env sh

# Exit in case of error
set -e
set -x

docker compose exec -T backend bash /app/whitelist-email.sh "$@"
