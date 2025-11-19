# Use official PHP + Apache
FROM php:8.2-apache

# Install PHP extensions (PostgreSQL for Render)
RUN apt-get update && apt-get install -y \
    git unzip libpng-dev libjpeg-dev libfreetype6-dev \
    libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_pgsql

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy app files
COPY . .

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy Apache config to point to /public
COPY 000-default.conf /etc/apache2/sites-available/000-default.conf

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Clear and cache config (will be done at runtime if .env exists)
# Note: Config caching happens at container startup via entrypoint script

EXPOSE 80

# Create entrypoint script to handle config caching
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Wait for .env to be available (Render sets it at runtime)\n\
if [ -f .env ]; then\n\
    echo "Clearing old config cache..."\n\
    php artisan config:clear || true\n\
    php artisan cache:clear || true\n\
    php artisan route:clear || true\n\
    \n\
    echo "Caching config for production..."\n\
    php artisan config:cache || true\n\
    php artisan route:cache || true\n\
fi\n\
\n\
echo "Starting Apache..."\n\
exec apache2-foreground' > /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["/usr/local/bin/docker-entrypoint.sh"]
