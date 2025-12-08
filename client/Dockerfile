# ---------- BUILD STAGE ----------
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

# IMPORTANT: copy env file for Vite
COPY .env.production .env.production

COPY . .
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
