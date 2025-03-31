# Docker Deployment Guide for MediaMaster

This document provides detailed instructions for deploying MediaMaster using Docker in production environments.

## Prerequisites

- Docker and Docker Compose installed on your server
- A domain name (optional for HTTPS setup)
- OpenAI API key
- Basic knowledge of server administration

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/saluja-ji/MediaMaster.git
cd MediaMaster
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit the `.env` file and configure the following variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: Set to `production`
- `PORT`: The port to run the application on (default is 5000)
- `DATABASE_URL`: PostgreSQL connection string (the docker-compose setup uses default credentials)

### 3. Build and Start the Containers

```bash
docker-compose up -d
```

This will start:
- The MediaMaster application container
- A PostgreSQL database container
- Apply database migrations automatically

### 4. Verify Deployment

Access the application at `http://your-server-ip:5000`

### 5. Setting Up HTTPS with Nginx (Optional)

For production deployments, it's recommended to use HTTPS. Here's how to set it up with Nginx as a reverse proxy:

1. Install Nginx on your server:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Install Certbot for Let's Encrypt certificates:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

3. Create an Nginx configuration file for your domain:
   ```bash
   sudo nano /etc/nginx/sites-available/mediamaster
   ```

4. Add the following configuration (replace with your domain):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

5. Enable the site and test Nginx configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/mediamaster /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. Obtain SSL certificates:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

7. Certbot will modify your Nginx configuration to include SSL settings and redirect HTTP to HTTPS.

## Updating the Application

To update the application to the latest version:

```bash
cd MediaMaster
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Backup and Restore

### Database Backup

```bash
docker exec mediamaster-db pg_dump -U postgres mediamaster > backup.sql
```

### Database Restore

```bash
cat backup.sql | docker exec -i mediamaster-db psql -U postgres -d mediamaster
```

## Troubleshooting

1. Check container logs:
   ```bash
   docker-compose logs app
   docker-compose logs db
   ```

2. Check if the containers are running:
   ```bash
   docker-compose ps
   ```

3. Check database connection:
   ```bash
   docker exec -it mediamaster-db psql -U postgres -d mediamaster -c "\l"
   ```

4. Restart the containers:
   ```bash
   docker-compose restart
   ```

5. If you encounter permission issues with the database volume, run:
   ```bash
   sudo chown -R 1000:1000 ./postgres-data
   ```