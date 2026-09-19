# To be copied into the nebula-home repository as
# ci/nebula-front/Dockerfile (referenced by .github/workflows/deploy-prod.yml).
#
# Multi-stage: build the Vite SPA, then serve it with nginx under /nebula/app/
# exactly like infrastructure/docker/test/nginx/nebula-front/Dockerfile.
# VITE_* args are baked in at build time (import.meta.env.*).

FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_PUBLIC_URL=/nebula/app/
ARG VITE_REQUEST_URL=https://milkyway.lab/nebula/api/v1
ARG VITE_APACHE_DOMAIN=https://milkyway.lab/nebula/app/
ARG VITE_RESOURCES_DOMAIN=https://milkyway.lab/resources/
ARG VITE_TOMCAT_DOMAIN=https://milkyway.lab
ARG VITE_USERNAME=nebula-front
ARG VITE_PASSWORD=unused-basic-auth-disabled
ARG VITE_CSRF_PROBE=false

ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL \
    VITE_REQUEST_URL=$VITE_REQUEST_URL \
    VITE_APACHE_DOMAIN=$VITE_APACHE_DOMAIN \
    VITE_RESOURCES_DOMAIN=$VITE_RESOURCES_DOMAIN \
    VITE_TOMCAT_DOMAIN=$VITE_TOMCAT_DOMAIN \
    VITE_USERNAME=$VITE_USERNAME \
    VITE_PASSWORD=$VITE_PASSWORD \
    VITE_CSRF_PROBE=$VITE_CSRF_PROBE

RUN npm run build

FROM nginx:alpine

COPY ci/nebula-front/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html/nebula/app

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
