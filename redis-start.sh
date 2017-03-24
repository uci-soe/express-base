#!/usr/bin/env bash

docker run \
  --name cng-redis \
  -p 6379:6379 \
  -v $(pwd)/.redis-data:/data \
  -d redis redis-server --appendonly yes
