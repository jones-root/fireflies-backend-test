FROM node:22-slim

# Build server
RUN mkdir -p /usr/app
COPY . /usr/app
WORKDIR /usr/app
RUN npm install --omit=dev
RUN npm run build

ENV TZ UTC

# Start app
CMD npm run start
