#!/usr/bin/env bash

#docker run \
#  --name express-database \
#  -p 3306:3306 \
#  -e MYSQL_ROOT_PASSWORD=root \
#  -e MYSQL_DATABASE=database \
#  -e MYSQL_USER=username \
#  -e MYSQL_PASSWORD=password \
#  -v $(pwd)/.database-data:/data \
#  -d mysql:latest

docker run \
  --name express-database \
  -p 5432:5432 \
  -e POSTGRES_DB="database" \
  -e POSTGRES_USER="username" \
  -e POSTGRES_PASSWORD="password" \
  -v $(pwd)/.database-data:/var/lib/postgresql/data \
  -d postgres:latest
