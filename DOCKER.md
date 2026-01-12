# Docker Configuration Guide

This document explains the Docker setup for the Headscale Admin Panel.

## Container Architecture

```
┌─────────────────────────────────────────────┐
│           Docker Network                     │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Nginx   │→ │   PHP    │→ │PostgreSQL│ │
│  │  :80     │  │  :8000   │  │  :5432   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│      ↓              ↓              ↓        │
│   Web Layer    App Layer     Data Layer    │
└─────────────────────────────────────────────┘
         ↓
    Host :8080
```

## Services

### 1. PostgreSQL (postgres)
- **Image**: postgres:14
- **Port**: 5432
- **Purpose**: Database server
- **Volumes**: 
  - `./postgres/data` - Persistent data
  - `./postgres/postgres.sql` - Init script
- **Health Check**: Automatic with retry

### 2. PHP (php)
- **Image**: Custom (built from Dockerfile)
- **Port**: 8000 (internal)
- **Purpose**: PHP-FPM + ThinkPHP application
- **Startup**: docker-start.sh
- **Volumes**:
  - `./think-app` - Application code
  - `./headscale/config` - Headscale config
  - `./headscale/data` - Headscale data

### 3. Nginx (nginx)
- **Image**: nginx:alpine
- **Port**: 8080 (host) → 80 (container)
- **Purpose**: Web server & reverse proxy
- **Config**: nginx-php.conf

## Dockerfile Breakdown

```dockerfile
FROM php:7.4-fpm-alpine3.16

# System packages
RUN apk add tzdata libpq-dev freetype-dev libpng-dev libjpeg-turbo-dev

# PHP extensions
RUN docker-php-ext-install gd bcmath pgsql pdo_pgsql pdo

# Composer
RUN php -r "copy('https://install.phpcomposer.com/installer', 'composer-setup.php');"
RUN php composer-setup.php && mv composer.phar /usr/local/bin/composer

# think-captcha
RUN composer require topthink/think-captcha

# Startup script
COPY docker-start.sh /usr/local/bin/docker-start.sh
RUN chmod +x /usr/local/bin/docker-start.sh

WORKDIR /var/www/html
ENTRYPOINT ["/usr/local/bin/docker-start.sh"]
```

## docker-start.sh Script

The container startup script performs these steps in order:

### Step 1: Start PHP-FPM
```bash
php-fpm -D  # Daemon mode
```
Launches the FastCGI Process Manager that Nginx will communicate with.

### Step 2: Verify PHP-FPM
```bash
pgrep -x "php-fpm"
```
Ensures PHP-FPM started successfully before proceeding.

### Step 3: Wait for Database
```bash
# Tries 30 times with 2-second intervals
fsockopen($host, $port, $errno, $errstr, $timeout);
```
Waits up to 60 seconds for PostgreSQL to accept connections.

### Step 4: Start Application Server
```bash
php think run --host 0.0.0.0 --port 8000
```
Starts the ThinkPHP development server that handles HTTP requests.

## Environment Variables

### In docker-compose.yml:
```yaml
environment:
  TZ: Asia/Shanghai
```

### In think-app/.env:
```ini
[DATABASE]
HOSTNAME = postgres      # Service name in docker-compose
DATABASE = headscale
USERNAME = postgres
PASSWORD = pVMnj2IXMtXcfmFTgVI8F8uxLNAiLXphxhgwPs
HOSTPORT = 5432

[HEADSCALE]
SERVER = "http://headscale:8080"
TOKEN = "your-api-token"
```

## Volume Mounts

### Application Code
```yaml
./think-app:/var/www/html
```
- PHP application files
- Hot-reload enabled (changes reflect immediately)

### PostgreSQL Data
```yaml
./postgres/data:/var/lib/postgresql/data
```
- Persistent database storage
- Survives container restarts

### Headscale Config
```yaml
./headscale/config:/headscale/config
./headscale/data:/headscale/data
```
- ACL configuration
- Headscale database (if using SQLite)

## Networking

Services communicate through the `headscale-network` bridge network:

```yaml
networks:
  headscale-network:
    driver: bridge
```

Service Discovery:
- `postgres` resolves to PostgreSQL container
- `php` resolves to PHP container
- `nginx` resolves to Nginx container

## Building and Running

### Build the PHP image:
```bash
docker-compose build php
```

### Start all services:
```bash
docker-compose up -d
```

### Rebuild and restart:
```bash
docker-compose up -d --build
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f php
docker-compose logs -f nginx
docker-compose logs -f postgres
```

### Execute commands in container:
```bash
# PHP container
docker-compose exec php sh

# Run composer
docker-compose exec php composer install

# PostgreSQL
docker-compose exec postgres psql -U postgres -d headscale
```

## Startup Sequence

1. **PostgreSQL** starts first
   - Health check runs every 10s
   - Must be healthy before PHP starts

2. **PHP container** starts
   - Waits for PostgreSQL health check
   - Runs docker-start.sh
   - Starts PHP-FPM
   - Waits for database connection
   - Starts ThinkPHP server

3. **Nginx** starts
   - Waits for PHP container
   - Proxies requests to PHP:8000

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs php

# Check if ports are in use
lsof -i :8080
lsof -i :5432

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database connection failed
```bash
# Test database connectivity
docker-compose exec php ping postgres

# Check PostgreSQL is ready
docker-compose exec postgres pg_isready -U postgres

# Verify .env settings
docker-compose exec php cat /var/www/html/.env
```

### PHP-FPM issues
```bash
# Check PHP-FPM status
docker-compose exec php ps aux | grep php-fpm

# Restart PHP service
docker-compose restart php

# View PHP error logs
docker-compose exec php tail -f /var/www/html/runtime/log/*
```

### Nginx errors
```bash
# Test Nginx config
docker-compose exec nginx nginx -t

# Reload Nginx
docker-compose exec nginx nginx -s reload

# Check Nginx logs
docker-compose logs nginx
```

## Performance Tuning

### PHP-FPM Configuration
Edit a custom php-fpm.conf if needed:
```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```

### PostgreSQL Configuration
Edit postgresql.conf for production:
```ini
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
```

### Nginx Configuration
The nginx-php.conf can be tuned:
```nginx
fastcgi_read_timeout 300;
client_max_body_size 20M;
```

## Security Considerations

1. **Change default passwords** in .env
2. **Use secrets** for production (Docker secrets or env files)
3. **Limit exposed ports** - only expose 8080
4. **Update base images** regularly
5. **Run containers as non-root** (add USER directive)
6. **Use read-only volumes** where possible

## Production Deployment

For production, consider:

1. **Use production-ready PHP image**
   ```dockerfile
   FROM php:7.4-fpm-alpine
   # ... without dev tools
   ```

2. **Add health checks**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:8000"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

3. **Use environment-specific configs**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

4. **Set resource limits**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

## Quick Reference

```bash
# Start
./start.sh

# Stop
./stop.sh

# Rebuild
docker-compose build

# Clean restart
docker-compose down && docker-compose up -d

# View logs
docker-compose logs -f

# Shell access
docker-compose exec php sh

# Database access
docker-compose exec postgres psql -U postgres -d headscale
```
