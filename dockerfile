# Base image
FROM tiangolo/nginx-rtmp

# Copy nginx config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Copy web files
COPY ./web /var/www/html

# Create HLS folder
RUN mkdir -p /var/www/hls

# Expose ports
EXPOSE 1935 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
