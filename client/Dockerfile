# ============================
# STAGE 1: Build
# ============================
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm clean-install

COPY . .
RUN npm run build

# ============================
# STAGE 2: nginx
# ============================
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
