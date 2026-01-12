# Headscale Admin Panel - Docker Setup

This is a PHP-based Headscale admin panel running on Docker with PostgreSQL database.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

### 1. Start the services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- PHP application server
- Nginx web server (port 8080)

### 2. Access the application

Open your browser and navigate to:
```
http://localhost:8080
```

### 3. Login/Register

The application uses the PostgreSQL database for user management. You'll need to register a new account on first use.

Default login page: `http://localhost:8080`

## Configuration

### Database Configuration

The database configuration is in `think-app/.env`:

```ini
[DATABASE]
DRIVER = pgsql
TYPE = pgsql
HOSTNAME = postgres
DATABASE = headscale
USERNAME = postgres
PASSWORD = pVMnj2IXMtXcfmFTgVI8F8uxLNAiLXphxhgwPs
HOSTPORT = 5432
```

### Headscale Configuration

Update the Headscale settings in `think-app/.env`:

```ini
[HEADSCALE]
SERVER = "http://headscale:8080"
HOST = "http://localhost:8080"
TOKEN = "your-api-token-here"
ACL = "/headscale/config/acl.hujson"
```

## Database Schema

The database schema is automatically initialized from `postgres/postgres.sql` on first startup.

Tables include:
- `users` - User accounts
- `machines` - Headscale nodes
- `routes` - Network routes
- `acls` - Access control lists
- `pre_auth_keys` - Pre-authentication keys
- `logs` - Activity logs
- `menus` - Menu configuration
- `roles` - User roles and permissions
- `apis` - API endpoint permissions

## Features

- User management (admin and regular users)
- Node management
- Route management
- ACL management
- Pre-auth key management
- Activity logs
- Role-based access control

## Stopping the services

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

## Troubleshooting

### Database connection issues

Check if PostgreSQL is running:
```bash
docker-compose ps
```

View PHP logs:
```bash
docker-compose logs php
```

View Nginx logs:
```bash
docker-compose logs nginx
```

### Port conflicts

If port 8080 or 5432 is already in use, edit `docker-compose.yml` to change the ports:

```yaml
ports:
  - "8081:80"  # Change 8080 to 8081
```

## Development

To rebuild the PHP container:
```bash
docker-compose build php
docker-compose up -d
```

## File Structure

```
.
├── docker-compose.yml       # Main Docker Compose configuration
├── Dockerfile              # PHP application Docker image
├── nginx-php.conf          # Nginx configuration
├── think-app/              # PHP application (ThinkPHP)
│   ├── .env               # Application configuration
│   ├── app/               # Application code
│   ├── config/            # Configuration files
│   ├── public/            # Public web files
│   └── view/              # View templates
├── postgres/
│   ├── postgres.sql       # Database schema
│   └── data/              # Database files (created on first run)
└── headscale/
    ├── config/            # Headscale configuration
    └── data/              # Headscale data
```
