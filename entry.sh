#!/bin/sh
set -e
git pull
npx prisma generate
yarn build
npx prisma migrate deploy
pm2 start --attach

# for docker
# node src/main.js