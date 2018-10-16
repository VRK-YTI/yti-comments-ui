# Comments base
FROM yti-comments-ui-base:dev

# Add nginx config
ADD nginx.conf /etc/nginx/nginx.conf

# Build the dist dir containing the static files
WORKDIR /app
RUN ["npm", "run", "build", "--", "--prod", "--output-hashing=all"]

# Start web server and expose http
EXPOSE 80
CMD ["nginx"]

