#/bin/bash
export APP_DEV=true
export APP_PORT=8000
export APP_PUBLIC=./public
export APP_TARGET=/app.js
export APP_SOURCE=./src/app.ts
export APP_SOURCE_ROOT=./src
export APP_IMPORT_MAP=./import_map.json

while true
do
  deno run -A deploy.ts
  sleep 5
done