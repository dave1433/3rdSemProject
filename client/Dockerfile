# 1. Create a stage for building the application.
FROM node:22-alpine AS build
WORKDIR /app
# 2. Copy package.json and package-lock.json
COPY package*.json ./
# 3. Install dependencies
RUN npm clean-install
# Copy the rest of the application source code
COPY . .
# 4. Build the React application
RUN npm run build

# 5. Stage 2: Serve the React app using nginx
FROM nginx:alpine AS final
# 6. Custom nginx config
COPY nginx.conf.template /
# 7. Copy the build output from the first stage to nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html
# 8. Expose port 80
EXPOSE 80
# 9. Start nginx
CMD envsubst '$BACKEND_URL' < /nginx.conf.template > /etc/nginx/conf.d/default.conf \
  && nginx -g 'daemon off;'