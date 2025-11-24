FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

# Copy frontend build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx template (with variables like $BACKEND_URL)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Enable environment variable substitution
RUN apk add --no-cache gettext

EXPOSE 8080

CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
