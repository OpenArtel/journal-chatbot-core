#!/bin/sh
set -eu

DUMP="${1:-}"
C="${2:-}"

[ -n "$DUMP" ] && [ -n "$C" ] || {
  echo "Usage: $0 <dump_path> <container_id_or_name>" >&2
  exit 1
}

[ -f "$DUMP" ] || {
  echo "No such file: $DUMP" >&2
  exit 1
}

# Cleanup function
cleanup() {
  docker exec "$C" rm -f "$TMP" 2>/dev/null || true
}
trap cleanup EXIT

# Try to get defaults from container env
USER="$(docker exec "$C" sh -c 'printf "%s" "${POSTGRES_USER:-postgres}"' 2>/dev/null || echo postgres)"
DB="$(docker exec "$C" sh -c 'printf "%s" "${POSTGRES_DB:-postgres}"' 2>/dev/null || echo postgres)"

BASE="$(basename "$DUMP")"
TMP="/tmp/$BASE"

docker cp "$DUMP" "$C:$TMP" >/dev/null

# Kill connections - экранируем одинарные кавычки
ESCAPED_DB="$(printf "%s" "$DB" | sed "s/'/''/g")"
docker exec -i "$C" psql -U "$USER" -d postgres -v ON_ERROR_STOP=1 -c \
"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$ESCAPED_DB' AND pid <> pg_backend_pid();" \
>/dev/null 2>&1 || true

# Recreate DB - используем утилиты (они сами экранируют)
docker exec "$C" dropdb -U "$USER" --if-exists "$DB" 2>/dev/null || true
docker exec "$C" createdb -U "$USER" "$DB"

# Restore
case "$DUMP" in
  *.sql|*.sql.gz)
    if [ "${DUMP%.gz}" != "$DUMP" ]; then
      docker exec -i "$C" sh -c "gunzip < '$TMP' | psql -U '$USER' -d '$DB' -v ON_ERROR_STOP=1"
    else
      docker exec -i "$C" psql -U "$USER" -d "$DB" -v ON_ERROR_STOP=1 -f "$TMP"
    fi
    ;;
  *)
    docker exec -i "$C" pg_restore -U "$USER" -d "$DB" --no-owner --no-privileges --exit-on-error "$TMP"
    ;;
esac

echo "OK: restored into $DB as $USER in container $C"