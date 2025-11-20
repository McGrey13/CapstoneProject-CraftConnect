#!/bin/bash
# Don't exit on error - we need to see what's happening and continue
set +e

# Redirect all output to stderr so it shows in Render logs
exec 1>&2

echo "=========================================="
echo "Starting Laravel Application"
echo "=========================================="

# Wait a moment for .env to be available
sleep 2

# Fix environment variables before creating .env
# Use MySQL (Dockerfile has pdo_mysql)
ORIG_DB_CONNECTION=${DB_CONNECTION:-mysql}
DB_CONNECTION=${ORIG_DB_CONNECTION:-mysql}

# Use file-based cache to avoid database table requirements
ORIG_CACHE_STORE=${CACHE_STORE:-file}
if [ "$ORIG_CACHE_STORE" = "database" ]; then
    echo "⚠️  WARNING: CACHE_STORE=database detected, changing to file"
    echo "This avoids requiring a cache table in the database"
    CACHE_STORE=file
else
    CACHE_STORE=${ORIG_CACHE_STORE:-file}
fi

# Use cookie sessions to avoid database table requirements
ORIG_SESSION_DRIVER=${SESSION_DRIVER:-cookie}
if [ "$ORIG_SESSION_DRIVER" = "database" ]; then
    echo "⚠️  WARNING: SESSION_DRIVER=database detected, changing to cookie"
    echo "This avoids requiring a sessions table in the database"
    SESSION_DRIVER=cookie
else
    SESSION_DRIVER=${ORIG_SESSION_DRIVER:-cookie}
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "Creating .env from environment variables..."
    
    # Create .env from Render environment variables
    # Remove quotes from APP_KEY if present
    CLEAN_APP_KEY=$(echo "$APP_KEY" | sed 's/^"//;s/"$//')
    
    cat > .env <<EOF
APP_NAME=${APP_NAME:-CraftConnect}
APP_ENV=${APP_ENV:-production}
APP_KEY=${CLEAN_APP_KEY}
APP_DEBUG=${APP_DEBUG:-true}
APP_URL=${APP_URL}

DB_CONNECTION=${DB_CONNECTION}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

CACHE_STORE=${CACHE_STORE}
SESSION_DRIVER=${SESSION_DRIVER}
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
    # Update existing .env with corrected values (if needed)
    # No need to change mysql to pgsql anymore
    if [ "$ORIG_CACHE_STORE" = "database" ]; then
        sed -i 's/^CACHE_STORE=database/CACHE_STORE=file/' .env
    fi
    if [ "$ORIG_SESSION_DRIVER" = "database" ]; then
        sed -i 's/^SESSION_DRIVER=database/SESSION_DRIVER=cookie/' .env
    fi
fi

echo ""
echo "📋 Checking environment variables..."
echo "APP_ENV: ${APP_ENV:-not set}"
echo "APP_URL: ${APP_URL:-not set}"
echo "DB_CONNECTION: ${DB_CONNECTION:-not set}"
echo "APP_KEY: ${APP_KEY:+SET (hidden)}${APP_KEY:-NOT SET - CRITICAL!}"

# CRITICAL: Check if APP_KEY is set and in correct format
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
else
    # Check if APP_KEY is in correct format (should start with "base64:")
    if [[ ! "$APP_KEY" =~ ^base64: ]]; then
        echo ""
        echo "⚠️  WARNING: APP_KEY is not in correct format!"
        echo "Current format: ${APP_KEY:0:20}..."
        echo "Laravel requires format: base64:..."
        echo "Converting APP_KEY to correct format..."
        
        # If it's a hex string, we need to generate a new one
        # Laravel's key:generate creates base64 encoded keys
        php artisan key:generate --force 2>&1
        if [ $? -eq 0 ]; then
            NEW_KEY=$(grep APP_KEY .env | cut -d '=' -f2)
            if [ -n "$NEW_KEY" ]; then
                export APP_KEY="$NEW_KEY"
                echo "✅ APP_KEY converted to correct format"
            fi
        else
            echo "❌ Failed to regenerate APP_KEY - Laravel may crash!"
        fi
    else
        echo "✅ APP_KEY format is correct"
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

