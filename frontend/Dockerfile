FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Install gettext for envsubst
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 3000

# envsubst replaces ${API_GATEWAY_URL} etc. at container startup
CMD ["/bin/sh", "-c", "envsubst '${API_GATEWAY_URL} ${ANALYTICS_SERVICE_URL} ${RATE_LIMITER_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
