FROM node:20 as build
WORKDIR /app
COPY ./package.json /app/
RUN npm install
COPY . /app/
RUN npm run build

FROM nginx:1.25.4-alpine
COPY ./nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
COPY --from=build /app/dist/ssr/browser /usr/share/nginx/html/ssr
