# Docker Deployment Instructions

This document provides detailed instructions for deploying the Social Media AI Platform using Docker.

## Prerequisites

- Docker installed on your server
- Docker Compose installed on your server
- OpenAI API Key

## Basic Deployment

1. Clone your repository on the server:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   cd YOUR_REPOSITORY_NAME
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   
3. Edit the `.env` file and add your OpenAI API key:
   ```
   NODE_ENV=production
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

5. The application should now be running at http://your-server-ip:5000

## Production Deployment with HTTPS

For a production environment, you should use HTTPS. Here's how to set it up with Nginx as a reverse proxy:

1. Create a new file called `docker-compose.prod.yml`:
   ```yaml
   version: '3.8'

   services:
     app:
       build: .
       restart: unless-stopped
       environment:
         - NODE_ENV=production
         - PORT=5000
         - OPENAI_API_KEY=${OPENAI_API_KEY}
       volumes:
         - app-data:/app/data
       networks:
         - app-network

     nginx:
       image: nginx:latest
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx/conf:/etc/nginx/conf.d
         - ./nginx/certbot/conf:/etc/letsencrypt
         - ./nginx/certbot/www:/var/www/certbot
       depends_on:
         - app
       networks:
         - app-network
       restart: unless-stopped

     certbot:
       image: certbot/certbot
       volumes:
         - ./nginx/certbot/conf:/etc/letsencrypt
         - ./nginx/certbot/www:/var/www/certbot
       entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

   volumes:
     app-data:

   networks:
     app-network:
   ```

2. Create the Nginx configuration:
   ```bash
   mkdir -p nginx/conf
   mkdir -p nginx/certbot/conf
   mkdir -p nginx/certbot/www
   ```

3. Create a file called `nginx/conf/app.conf`:
   ```
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location /.well-known/acme-challenge/ {
           root /var/www/certbot;
       }
       
       location / {
           return 301 https://$host$request_uri;
       }
   }

   server {
       listen 443 ssl;
       server_name yourdomain.com www.yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       location / {
           proxy_pass http://app:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. Initialize SSL certificates:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d nginx
   
   # Get the certificates
   docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d yourdomain.com -d www.yourdomain.com
   
   # Start all services
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Maintaining Your Deployment

### Updating to a New Version

1. Pull the latest changes:
   ```bash
   git pull
   ```

2. Rebuild and restart containers:
   ```bash
   docker-compose up -d --build
   ```

### Checking Logs

To check application logs:
```bash
docker-compose logs -f app
```

### Backup and Restore

To backup the data volume:
```bash
docker run --rm -v social-media-ai-platform_app-data:/data -v $(pwd):/backup alpine tar czf /backup/app-data-backup.tar.gz -C /data .
```

To restore the data volume:
```bash
docker run --rm -v social-media-ai-platform_app-data:/data -v $(pwd):/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/app-data-backup.tar.gz -C /data"
```