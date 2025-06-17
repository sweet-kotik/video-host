#!/bim/bash
set -e

minio server /data --console-address ":9001" &

sleep 10

mc alias set local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
mc mb local/videos --ignore-existing
mc policy set public local/videos

wait