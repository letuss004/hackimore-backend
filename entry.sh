#!/bin/sh
set -e
npx prisma migrate deploy
node src/main.js