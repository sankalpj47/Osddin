#!/bin/sh
set -eu

AUTH_INCLUDE_PATH="/etc/nginx/conf.d/basic-auth.conf"
HTPASSWD_PATH="/etc/nginx/.htpasswd"

USERNAME="${FRONTEND_BASIC_AUTH_USERNAME:-}"
PASSWORD="${FRONTEND_BASIC_AUTH_PASSWORD:-}"
USERS="${FRONTEND_BASIC_AUTH_USERS:-}"

if [ -n "$USERS" ]; then
    : >"$HTPASSWD_PATH"
    OLD_IFS="$IFS"
    IFS=';'
    set -- $USERS
    IFS="$OLD_IFS"

    for entry in "$@"; do
        [ -n "$entry" ] || continue
        case "$entry" in
            *=*)
                user=${entry%%=*}
                pass=${entry#*=}
                if [ -n "$user" ] && [ -n "$pass" ]; then
                    htpasswd -b "$HTPASSWD_PATH" "$user" "$pass"
                fi
                ;;
        esac
    done

    if [ ! -s "$HTPASSWD_PATH" ]; then
        rm -f "$HTPASSWD_PATH"
        : >"$AUTH_INCLUDE_PATH"
        exit 0
    fi
elif [ -n "$USERNAME" ] && [ -n "$PASSWORD" ]; then
    htpasswd -bc "$HTPASSWD_PATH" "$USERNAME" "$PASSWORD"
else
    : >"$AUTH_INCLUDE_PATH"
    rm -f "$HTPASSWD_PATH"
    exit 0
fi

cat >"$AUTH_INCLUDE_PATH" <<EOF
auth_basic "Restricted";
auth_basic_user_file $HTPASSWD_PATH;
EOF
