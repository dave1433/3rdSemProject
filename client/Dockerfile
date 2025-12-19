# ---------- BUILD STAGE ----------
FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy env for Vite
COPY .env.production .env.production

COPY . .
RUN npm run build


# ---------- PRODUCTION STAGE ----------
FROM nginx:alpine

# ✅ Use main nginx.conf (NOT conf.d)
COPY nginx.conf /etc/nginx/nginx.conf

# ✅ Static build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
