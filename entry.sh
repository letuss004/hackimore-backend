#!/bin/sh
set -e
git pull
yarn build
npx prisma migrate deploy
pm2 start --attach
# node src/main.js # for docker