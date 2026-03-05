# Base: Nginx-RTMP image
FROM tiangolo/nginx-rtmp

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Set backend working directory
WORKDIR /usr/src/app

# Copy backend files
COPY ./backend /usr/src/app

# Install Node.js dependencies
RUN npm install

# Copy frontend to Nginx www
COPY ./frontend /var/www/html

# Copy nginx configuration
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Create HLS folder
RUN mkdir -p /var/www/hls

# Expose ports
EXPOSE 1935 8080

# Run Node backend in background, then start Nginx
CMD node /usr/src/app/index.js & nginx -g "daemon off;"
