# Headscale Admin Panel (PHP Edition)

A web administration panel for [Headscale](https://github.com/juanfont/headscale), built with PHP (ThinkPHP framework) and PostgreSQL, running on Docker.

## Features

### Core Features
- **User Management** - Create, edit, and manage user accounts with role-based permissions
- **Node Management** - View and manage connected Headscale devices
- **Route Management** - Configure and control network routes
- **Access Control Lists (ACL)** - Manage network permissions with ACL editor
- **Pre-authentication Keys** - Generate and manage device enrollment keys
- **Activity Logs** - View system logs and user activities
- **Role-Based Access Control** - Manager and user roles with different permissions
- **Command Console** - Execute Headscale commands directly from the web interface

### Technology Stack
- **Backend**: PHP 7.4 with ThinkPHP 6.0 framework
- **Database**: PostgreSQL 14
- **Web Server**: Nginx
- **Frontend**: LayUI (Layered Web UI)
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Docker
- Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd headscale-admin
   ```

2. **Configure Headscale connection**

   Edit `think-app/.env`:
   ```ini
   [HEADSCALE]
   SERVER = "http://your-headscale-server:8080"
   TOKEN = "your-headscale-api-token"
   ACL = "/headscale/config/acl.hujson"
   ```

3. **Start the services**
   ```bash
   ./start.sh
   ```

   Or manually:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**

   Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

5. **First Login**

   Register a new account, then you can start managing your Headscale instance.

## Configuration

### Database Configuration

PostgreSQL settings are in `think-app/.env`:

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

### Headscale Integration

Configure the Headscale connection in `think-app/.env`:

```ini
[HEADSCALE]
SERVER = "http://headscale:8080"    # Headscale server URL
TOKEN = "your-api-token-here"        # Headscale API token
ACL = "/headscale/config/acl.hujson" # ACL file path
OFFSETIME = false                    # Time offset setting
```

To get your Headscale API token:
```bash
headscale apikeys create
```

## Services

The Docker Compose setup includes:

- **PostgreSQL** (port 5432) - Database server
- **PHP-FPM** - PHP application server
- **Nginx** (port 8080) - Web server

## Database Schema

The PostgreSQL database includes these tables:

- **users** - User accounts with roles and permissions
- **machines** - Headscale nodes (connected devices)
- **routes** - Network routes configuration
- **acls** - Access control lists
- **pre_auth_keys** - Pre-authentication keys
- **logs** - Activity and audit logs
- **menus** - Menu configuration
- **roles** - Role permissions mapping
- **apis** - API endpoint permissions

## User Roles

### Manager (Admin)
- Full access to all features
- User management
- View all users' nodes, routes, and logs
- ACL management
- System configuration

### User (Regular User)
- Manage own nodes and routes
- Generate pre-auth keys
- View own activity logs
- Limited system access

## Usage

### Managing Nodes

1. Navigate to "Nodes" from the sidebar
2. View all connected devices
3. Rename nodes or delete disconnected devices
4. View node details (IP, OS, client version, last seen)

### Managing Routes

1. Go to "Routes" page
2. View all advertised routes
3. Enable or disable routes as needed
4. Delete unused routes

### Pre-authentication Keys

1. Navigate to "Pre-auth Keys"
2. Click "Add Key" to generate a new key
3. Set expiration time
4. Copy the key and use it to connect devices:
   ```bash
   tailscale up --login-server=YOUR_HEADSCALE_URL --authkey=YOUR_KEY
   ```

### ACL Management

1. Go to "ACL" page
2. Edit the ACL configuration directly
3. Save changes to apply new access rules
4. Reload Headscale configuration if needed

### User Management (Manager only)

1. Navigate to "Users" page
2. View all registered users
3. Change user roles
4. Set account expiration dates
5. Enable or disable user accounts

## File Structure

```
.
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile              # PHP container image
├── docker-start.sh         # Container startup script
├── nginx-php.conf          # Nginx configuration
├── start.sh                # Quick start script (host)
├── stop.sh                 # Stop script (host)
├── SETUP.md                # Detailed setup guide
├── think-app/              # PHP application
│   ├── .env               # Application configuration
│   ├── app/               # Application code
│   │   ├── controller/    # Controllers
│   │   ├── middleware/    # Middleware
│   │   └── validate/      # Validation rules
│   ├── config/            # Framework configuration
│   ├── public/            # Public web files
│   │   ├── index.php     # Entry point
│   │   └── res/          # Frontend assets (LayUI)
│   ├── route/            # Route definitions
│   └── view/             # View templates
├── postgres/
│   ├── postgres.sql       # Database schema
│   └── data/              # PostgreSQL data directory
└── headscale/
    ├── config/            # Headscale configuration
    └── data/              # Headscale data

```

## API Endpoints

The application provides these API endpoints:

- `/Api/getUsers` - Get user list
- `/Api/getMachine` - Get nodes/machines
- `/Api/getRoute` - Get routes
- `/Api/getAcls` - Get ACL configuration
- `/Api/getPreAuthKey` - Get pre-auth keys
- `/Api/getLogs` - Get activity logs
- `/Api/initData` - Initialize dashboard data

See `postgres/postgres.sql` for the complete API list.

## Container Startup Process

The `docker-start.sh` script handles the container initialization:

1. **Starts PHP-FPM** - Launches PHP FastCGI Process Manager in daemon mode
2. **Verifies PHP-FPM** - Checks that PHP-FPM process is running
3. **Database Connection** - Waits for PostgreSQL to be ready (up to 60 seconds)
4. **ThinkPHP Server** - Starts the application server on port 8000

The script includes:
- Automatic retry logic for database connections
- Clear status messages during startup
- Graceful error handling
- Proper signal handling for clean shutdown

You can view the startup logs:
```bash
docker-compose logs -f php
```

## Troubleshooting

### Check service status
```bash
docker-compose ps
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f php
docker-compose logs -f nginx
docker-compose logs -f postgres
```

### Restart services
```bash
docker-compose restart
```

### Database connection issues

1. Ensure PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check database connectivity:
   ```bash
   docker-compose exec postgres psql -U postgres -d headscale -c "SELECT version();"
   ```

### Port conflicts

If port 8080 or 5432 is in use, edit `docker-compose.yml`:

```yaml
ports:
  - "8081:80"  # Change external port
```

## Stopping the Application

```bash
./stop.sh
```

Or manually:
```bash
docker-compose down
```

To remove all data including database:
```bash
docker-compose down -v
```

## Credits

This project is based on [Headscale-Admin](https://github.com/arounyf/headscale-Admin) by arounyf.

## License

This project is open source and available under the MIT License.
