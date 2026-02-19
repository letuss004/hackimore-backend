#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

git pull
yarn build
pm2 start --attach