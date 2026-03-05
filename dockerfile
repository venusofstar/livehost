# Use Node + Nginx-RTMP base
FROM tiangolo/nginx-rtmp

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

# Set working dir for backend
WORKDIR /usr/src/app

# Copy backend
COPY ./server /usr/src/app

# Install Node dependencies
RUN npm install express cors body-parser

# Copy frontend to Nginx www
COPY ./web /var/www/html

# Copy nginx config
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Create HLS folder
RUN mkdir -p /var/www/hls

# Expose ports
EXPOSE 1935 8080

# Run Node backend in background, then Nginx
CMD node /usr/src/app/index.js & nginx -g "daemon off;"
