# Define the base image from node
FROM node:22-alpine AS base
RUN apk add --no-cache openssl bash postgresql-client curl bind-tools netcat-openbsd
RUN yarn global add ts-node
# Configure DNS for better external connectivity
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf && \
    echo "nameserver 8.8.4.4" >> /etc/resolv.conf && \
    echo "options timeout:2 attempts:3 rotate single-request-reopen" >> /etc/resolv.conf
WORKDIR /api

# Build nestjs app
FROM base AS builder
# Install packages and cache it
COPY package.json yarn.lock ./
RUN yarn install
# copy prisma and cache it
COPY prisma ./
RUN npx prisma generate
# Copy the rest of the application code
COPY . .
# Build the app
RUN yarn build

# Pre-production
FROM base AS preprod
COPY package.json yarn.lock ./
RUN yarn install --prod
COPY prisma ./
RUN npx prisma generate

# Create the final image (most optimized size) (prod)
FROM base AS server
COPY --from=preprod /api/node_modules ./node_modules
COPY prisma ./
COPY public ./dist/public
COPY template ./template
COPY package.json yarn.lock ./
COPY /tool ./tools
COPY --from=builder /api/dist ./dist
COPY entry.sh ./
# Run server
EXPOSE 3000

CMD ["bash", "./entry.sh"]
