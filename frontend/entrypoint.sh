#!/bin/sh
set -e

if [ -z "$BACKEND_ORIGIN" ]; then
  echo "BACKEND_ORIGIN is not set. Defaulting to http://backend:3001" >&2
  BACKEND_ORIGIN="http://backend:3001"
fi

env | grep BACKEND_ORIGIN

envsubst '\$BACKEND_ORIGIN' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'


