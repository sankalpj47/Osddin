#!/bin/sh
set -eu

AUTH_INCLUDE_PATH="/etc/nginx/conf.d/basic-auth.conf"
HTPASSWD_PATH="/etc/nginx/.htpasswd"

USERNAME="${FRONTEND_BASIC_AUTH_USERNAME:-}"
PASSWORD="${FRONTEND_BASIC_AUTH_PASSWORD:-}"

if [ -n "$USERNAME" ] && [ -n "$PASSWORD" ]; then
    htpasswd -bc "$HTPASSWD_PATH" "$USERNAME" "$PASSWORD"
    cat >"$AUTH_INCLUDE_PATH" <<EOF
auth_basic "Restricted";
auth_basic_user_file $HTPASSWD_PATH;
EOF
else
    : >"$AUTH_INCLUDE_PATH"
fi
