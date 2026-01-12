#!/bin/sh
set -e

echo "========================================="
echo "Starting Headscale Admin Panel"
echo "========================================="

echo "[1/4] Starting PHP-FPM..."
php-fpm -D

echo "[2/4] Waiting for PHP-FPM to be ready..."
sleep 2

# Check if PHP-FPM is running
if ! pgrep -x "php-fpm" > /dev/null; then
    echo "ERROR: PHP-FPM failed to start"
    exit 1
fi

echo "[3/4] Waiting for database connection..."
MAX_TRIES=30
TRIES=0

while [ $TRIES -lt $MAX_TRIES ]; do
    if php -r "
        \$host = getenv('DATABASE_HOSTNAME') ?: 'postgres';
        \$port = getenv('DATABASE_HOSTPORT') ?: '5432';
        \$timeout = 1;
        \$conn = @fsockopen(\$host, \$port, \$errno, \$errstr, \$timeout);
        if (!\$conn) {
            exit(1);
        }
        fclose(\$conn);
        exit(0);
    " 2>/dev/null; then
        echo "✓ Database connection successful!"
        break
    fi

    TRIES=$((TRIES + 1))
    if [ $TRIES -lt $MAX_TRIES ]; then
        echo "  Waiting for database... (attempt $TRIES/$MAX_TRIES)"
        sleep 2
    else
        echo "ERROR: Could not connect to database after $MAX_TRIES attempts"
        exit 1
    fi
done

echo "[4/4] Starting ThinkPHP application server..."
cd /var/www/html

# Display startup info
echo ""
echo "========================================="
echo "Application Ready!"
echo "========================================="
echo "PHP-FPM:    Running"
echo "Database:   Connected"
echo "Server:     http://0.0.0.0:8000"
echo "========================================="
echo ""

# Start the ThinkPHP server (this blocks and runs in foreground)
exec php think run --host 0.0.0.0 --port 8000
