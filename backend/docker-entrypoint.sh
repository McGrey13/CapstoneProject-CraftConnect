#!/bin/bash
set -e

echo "=========================================="
echo "Starting Laravel Application"
echo "=========================================="

# Wait a moment for .env to be available
sleep 2

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "Creating .env from environment variables..."
    
    # Create .env from Render environment variables
    cat > .env <<EOF
APP_NAME=${APP_NAME:-CraftConnect}
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL}

DB_CONNECTION=${DB_CONNECTION:-pgsql}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

CACHE_STORE=${CACHE_STORE:-file}
SESSION_DRIVER=${SESSION_DRIVER:-cookie}
SESSION_LIFETIME=${SESSION_LIFETIME:-720}
SESSION_DOMAIN=${SESSION_DOMAIN}
SESSION_SECURE_COOKIE=${SESSION_SECURE_COOKIE:-true}

CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS}

LOG_CHANNEL=${LOG_CHANNEL:-stack}
LOG_LEVEL=${LOG_LEVEL:-error}
EOF
    echo "✅ .env file created"
fi

echo "📋 Checking environment variables..."
echo "APP_ENV: ${APP_ENV:-not set}"
echo "APP_URL: ${APP_URL:-not set}"
echo "DB_CONNECTION: ${DB_CONNECTION:-not set}"

# Clear old caches
echo ""
echo "🧹 Clearing old caches..."
php artisan config:clear 2>&1 || echo "⚠️  Config clear failed (might not exist)"
php artisan cache:clear 2>&1 || echo "⚠️  Cache clear failed"
php artisan route:clear 2>&1 || echo "⚠️  Route clear failed"
php artisan view:clear 2>&1 || echo "⚠️  View clear failed"

# Test database connection
echo ""
echo "🔌 Testing database connection..."
php artisan tinker --execute="try { DB::connection()->getPdo(); echo '✅ Database connection successful'; } catch (Exception \$e) { echo '❌ Database connection failed: ' . \$e->getMessage(); }" 2>&1 || echo "⚠️  Database test failed"

# Run migrations (only if needed)
echo ""
echo "📦 Checking migrations..."
php artisan migrate --force 2>&1 || echo "⚠️  Migrations failed or already run"

# Create storage link
echo ""
echo "🔗 Creating storage link..."
php artisan storage:link 2>&1 || echo "⚠️  Storage link already exists or failed"

# Cache config for production
echo ""
echo "⚙️  Caching configuration..."
php artisan config:cache 2>&1 || {
    echo "❌ Config cache failed! Showing error:"
    php artisan config:cache 2>&1
    echo ""
    echo "⚠️  Continuing without config cache..."
}

# Cache routes
echo ""
echo "🛣️  Caching routes..."
php artisan route:cache 2>&1 || {
    echo "❌ Route cache failed! Showing error:"
    php artisan route:cache 2>&1
    echo ""
    echo "⚠️  Continuing without route cache..."
}

# Set permissions
echo ""
echo "🔐 Setting permissions..."
chown -R www-data:www-data storage bootstrap/cache 2>&1 || true
chmod -R 775 storage bootstrap/cache 2>&1 || true

echo ""
echo "=========================================="
echo "✅ Setup complete! Starting Apache..."
echo "=========================================="
echo ""

# Start Apache
exec apache2-foreground

