#!/bin/bash
# Don't exit on error - we need to see what's happening and continue
set +e

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
APP_DEBUG=${APP_DEBUG:-true}
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
LOG_LEVEL=${LOG_LEVEL:-debug}
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file exists"
fi

echo ""
echo "📋 Checking environment variables..."
echo "APP_ENV: ${APP_ENV:-not set}"
echo "APP_URL: ${APP_URL:-not set}"
echo "DB_CONNECTION: ${DB_CONNECTION:-not set}"
echo "APP_KEY: ${APP_KEY:+SET (hidden)}${APP_KEY:-NOT SET - CRITICAL!}"

# CRITICAL: Check if APP_KEY is set - Laravel won't work without it
if [ -z "$APP_KEY" ]; then
    echo ""
    echo "❌ CRITICAL: APP_KEY is not set!"
    echo "Generating APP_KEY..."
    php artisan key:generate --force 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ APP_KEY generated successfully"
        # Update .env file with the new key
        NEW_KEY=$(grep APP_KEY .env | cut -d '=' -f2)
        if [ -n "$NEW_KEY" ]; then
            export APP_KEY="$NEW_KEY"
            echo "✅ APP_KEY exported to environment"
        fi
    else
        echo "❌ Failed to generate APP_KEY - Laravel will crash!"
        echo "This is a critical error. Check Laravel logs."
    fi
fi

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
CONFIG_OUTPUT=$(php artisan config:cache 2>&1)
CONFIG_EXIT=$?
if [ $CONFIG_EXIT -ne 0 ]; then
    echo "❌ Config cache failed!"
    echo "Error output:"
    echo "$CONFIG_OUTPUT"
    echo ""
    echo "⚠️  Trying to continue without config cache..."
    echo "This may cause issues. Check Laravel logs for details."
else
    echo "✅ Config cached successfully"
fi

# Cache routes
echo ""
echo "🛣️  Caching routes..."
ROUTE_OUTPUT=$(php artisan route:cache 2>&1)
ROUTE_EXIT=$?
if [ $ROUTE_EXIT -ne 0 ]; then
    echo "❌ Route cache failed!"
    echo "Error output:"
    echo "$ROUTE_OUTPUT"
    echo ""
    echo "⚠️  Trying to continue without route cache..."
    echo "Routes may not work. Check Laravel logs for details."
else
    echo "✅ Routes cached successfully"
fi

# Verify routes are loaded
echo ""
echo "📋 Verifying routes..."
php artisan route:list --path=api/stores 2>&1 | head -5 || echo "⚠️  Cannot verify routes"
php artisan route:list --path=api/products 2>&1 | head -5 || echo "⚠️  Cannot verify routes"

# Set permissions
echo ""
echo "🔐 Setting permissions..."
chown -R www-data:www-data storage bootstrap/cache 2>&1 || true
chmod -R 775 storage bootstrap/cache 2>&1 || true

# Show Laravel version and status
echo ""
echo "📊 Laravel Status:"
php artisan --version 2>&1 || echo "⚠️  Cannot get Laravel version"

# Check if we can at least load Laravel
echo ""
echo "🔍 Testing Laravel bootstrap..."
php artisan tinker --execute="echo 'Laravel loaded successfully';" 2>&1 | head -5 || echo "⚠️  Laravel bootstrap test failed"

echo ""
echo "=========================================="
echo "✅ Setup complete! Starting Apache..."
if [ $CONFIG_EXIT -ne 0 ] || [ $ROUTE_EXIT -ne 0 ]; then
    echo "⚠️  WARNING: Some cache operations failed!"
    echo "Check the errors above and Laravel logs for details."
    echo "The application may not work correctly."
fi
echo "=========================================="
echo ""

# Start Apache (this should keep running)
exec apache2-foreground

