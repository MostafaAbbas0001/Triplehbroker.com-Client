FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
ARG VITE_SITE_URL
ARG VITE_API_BASE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV NITRO_PRESET=node_server
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
