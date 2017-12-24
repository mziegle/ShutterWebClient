FROM nginx
COPY default.conf /etc/nginx/conf.d/default.conf
COPY index.html index.js nano.js /usr/share/nginx/html/