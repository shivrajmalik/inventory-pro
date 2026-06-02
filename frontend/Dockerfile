# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package info and install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

# Receive VITE_API_URL as build argument and expose as build environment variable
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage to nginx folder
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
