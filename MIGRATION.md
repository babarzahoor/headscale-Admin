# Migration Guide: From React/Supabase to PHP/PostgreSQL

This document explains the migration from the React/Supabase frontend to the PHP/PostgreSQL-based admin panel.

## What Changed

### Architecture

**Before:**
- Frontend: React + TypeScript + Vite
- Backend: Supabase (managed PostgreSQL + Auth)
- Deployment: Static frontend + cloud database

**After:**
- Frontend: PHP templates with LayUI
- Backend: ThinkPHP 6.0 framework
- Database: Self-hosted PostgreSQL 14
- Deployment: Docker Compose (Nginx + PHP-FPM + PostgreSQL)

### Benefits of Migration

1. **Self-Hosted**: Complete control over your data and infrastructure
2. **Simplified Stack**: Single PHP application instead of separate frontend/backend
3. **No External Dependencies**: No reliance on Supabase or other cloud services
4. **Docker-Ready**: Easy deployment with Docker Compose
5. **Lower Costs**: No cloud service fees

## Migration Steps

### 1. Backup Your Data (if applicable)

If you were using the Supabase version and have data to migrate, export your data first:

```sql
-- Export users
COPY (SELECT * FROM user_profiles) TO '/tmp/users.csv' CSV HEADER;

-- Export nodes
COPY (SELECT * FROM nodes) TO '/tmp/nodes.csv' CSV HEADER;

-- Export other tables as needed
```

### 2. Set Up New Environment

1. Stop the old React development server if running
2. Pull the latest code with PHP implementation
3. Configure the environment:

```bash
# Copy example environment file
cd think-app
cp .example.env .env

# Edit .env with your settings
nano .env
```

### 3. Start Docker Services

```bash
# From project root
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- PHP application server
- Nginx web server on port 8080

### 4. Access the Application

Navigate to http://localhost:8080

### 5. Create First Admin Account

1. Register a new account via the web interface
2. Connect to the PostgreSQL database:
   ```bash
   docker-compose exec postgres psql -U postgres -d headscale
   ```

3. Promote the user to manager role:
   ```sql
   UPDATE users SET role = 'manager' WHERE name = 'your-username';
   ```

### 6. Import Old Data (if applicable)

If you exported data from Supabase:

```bash
# Copy CSV files to postgres container
docker cp users.csv headscale-postgres:/tmp/

# Import in PostgreSQL
docker-compose exec postgres psql -U postgres -d headscale -c "\COPY users(id,name,password,role,enable,expire) FROM '/tmp/users.csv' CSV HEADER;"
```

## Feature Mapping

### User Authentication

| Supabase | PHP |
|----------|-----|
| supabase.auth.signUp() | Register form → /Index/reg |
| supabase.auth.signInWithPassword() | Login form → /Index/login |
| supabase.auth.signOut() | Logout → /Api/logout |
| supabase.auth.getUser() | Session::get() |

### Database Access

| Supabase | PHP |
|----------|-----|
| supabase.from('users').select() | Db::table('users')->select() |
| supabase.from('nodes').insert() | Db::table('machines')->insert() |
| Row Level Security (RLS) | Middleware authentication |

### API Endpoints

| Feature | Supabase Client | PHP Endpoint |
|---------|----------------|--------------|
| Get Users | supabase.from('user_profiles') | /Api/getUsers |
| Get Nodes | supabase.from('nodes') | /Api/getMachine |
| Get Routes | supabase.from('routes') | /Api/getRoute |
| Get ACLs | supabase.from('acls') | /Api/getAcls |
| Get Keys | supabase.from('preauth_keys') | /Api/getPreAuthKey |
| Get Logs | supabase.from('activity_logs') | /Api/getLogs |

## Configuration Changes

### Environment Variables

**Supabase (.env):**
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**PHP (think-app/.env):**
```ini
[DATABASE]
DRIVER = pgsql
TYPE = pgsql
HOSTNAME = postgres
DATABASE = headscale
USERNAME = postgres
PASSWORD = your-password
HOSTPORT = 5432

[HEADSCALE]
SERVER = "http://headscale:8080"
TOKEN = "your-api-token"
ACL = "/headscale/config/acl.hujson"
```

## Development Workflow

### Before (React)

```bash
npm install
npm run dev          # Start dev server on :5173
npm run build        # Build for production
```

### After (PHP)

```bash
docker-compose up -d                    # Start all services
docker-compose logs -f php              # View PHP logs
docker-compose exec php composer install # Install dependencies
docker-compose restart php              # Restart after code changes
```

## Database Schema Comparison

### Supabase Tables → PostgreSQL Tables

| Supabase | PostgreSQL | Notes |
|----------|------------|-------|
| user_profiles | users | Added role, enable, expire fields |
| nodes | machines | Direct mapping from Headscale |
| routes | routes | Direct mapping from Headscale |
| acls | acls | Stores ACL configuration |
| preauth_keys | pre_auth_keys | Direct mapping from Headscale |
| activity_logs | logs | User activity tracking |

### New Tables (PHP Version)

- **menus** - Navigation menu configuration
- **roles** - Role-based permissions mapping
- **apis** - API endpoint access control
- **kvs** - Key-value storage for settings

## Troubleshooting Common Issues

### Port Conflicts

**Problem**: Port 8080 already in use

**Solution**: Edit `docker-compose.yml`
```yaml
nginx:
  ports:
    - "8081:80"  # Change to any available port
```

### Database Connection Failed

**Problem**: PHP can't connect to PostgreSQL

**Solution**:
1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Verify connection settings in `think-app/.env`

3. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

### Permission Denied

**Problem**: Can't write to directories

**Solution**:
```bash
# Fix permissions
chmod -R 755 think-app/runtime
chmod -R 755 think-app/public
chmod -R 755 postgres/data
```

## Rolling Back

If you need to go back to the React/Supabase version:

1. Check out the previous commit:
   ```bash
   git log --oneline  # Find the commit before migration
   git checkout <commit-hash>
   ```

2. Restore your Supabase configuration:
   ```bash
   # Restore .env file
   git checkout HEAD -- .env
   ```

3. Start the React dev server:
   ```bash
   npm install
   npm run dev
   ```

## Additional Resources

- [ThinkPHP Documentation](https://www.thinkphp.cn/docs.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Headscale Documentation](https://headscale.net/)

## Support

If you encounter issues during migration:

1. Check the logs: `docker-compose logs -f`
2. Verify environment configuration: `cat think-app/.env`
3. Test database connectivity: `docker-compose exec postgres psql -U postgres -d headscale`
4. Review [SETUP.md](SETUP.md) for detailed configuration steps

## Summary

The migration moves from a modern JavaScript frontend with cloud backend to a traditional PHP application with self-hosted database. This provides:

- ✅ Full data ownership and control
- ✅ No external service dependencies
- ✅ Easy Docker-based deployment
- ✅ Reduced operational complexity
- ✅ Lower long-term costs

The core functionality remains the same - managing Headscale users, nodes, routes, ACLs, and keys through a web interface.
