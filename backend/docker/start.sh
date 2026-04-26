#!/bin/sh
set -e

cat > .env <<EOF
APP_NAME="${APP_NAME:-BIZDOM Inbox}"
APP_ENV=${APP_ENV:-local}
APP_KEY=
APP_DEBUG=${APP_DEBUG:-true}
APP_URL=${APP_URL:-http://localhost:8000}
LOG_CHANNEL=${LOG_CHANNEL:-stack}

DB_CONNECTION=${DB_CONNECTION:-mysql}
DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-bizdom_inbox}
DB_USERNAME=${DB_USERNAME:-root}
DB_PASSWORD=${DB_PASSWORD:-}

FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}
SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS:-localhost:5173,127.0.0.1:5173}
EOF

php artisan key:generate --force --no-interaction >/dev/null

until mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" --silent; do
  echo "Waiting for database..."
  sleep 2
done

php artisan config:clear --no-interaction
php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction
php artisan serve --host=0.0.0.0 --port=8000
