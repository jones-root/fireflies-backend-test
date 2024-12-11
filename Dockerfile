# Build
FROM node:22-slim AS builder

WORKDIR /usr/app
# Copy only package definition files first to optimize npm install on the Runtime stage due to caching
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime
FROM node:22-slim
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

COPY --from=builder /usr/app/dist ./dist

ENV TZ UTC

# Start app
CMD npm run start
