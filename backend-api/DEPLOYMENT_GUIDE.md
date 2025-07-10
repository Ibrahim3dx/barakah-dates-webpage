# Laravel Backend API - cPanel Deployment Guide

## Prerequisites

- cPanel hosting with PHP 8.1+ support
- MySQL database
- SSH access (recommended) or File Manager
- Composer support (most shared hosting provides this)

## Step 1: Prepare Your Project for Production

### 1.1 Update Environment Configuration
Create a production `.env` file with your cPanel hosting details:

```env
APP_NAME="Al Barakah Dates API"
APP_ENV=production
APP_KEY=base64:287ye8+JzDa2a6Pf+9Znzv4iadnwtHj6ExwQY7mmUJs=
APP_DEBUG=false
APP_URL=https://yourdomain.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en

# Database Configuration (from cPanel)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_cpanel_database_name
DB_USERNAME=your_cpanel_db_username
DB_PASSWORD=your_cpanel_db_password

# Session & Cache
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_CHANNEL=single
LOG_LEVEL=error

# Mail Configuration (if needed)
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# WhatsApp Service
ENABLE_WHATSAPP_SERVICE=false
ORDER_MESSAGE_RECIVER_NUMBER=0926537947
```

### 1.2 Optimize for Production
Run these commands locally before uploading:

```bash
# Install production dependencies only
composer install --optimize-autoloader --no-dev

# Clear and cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Generate optimized autoloader
composer dump-autoload --optimize
```

## Step 2: Upload Files to cPanel

### Method 1: Using SSH (Recommended)
If you have SSH access:

```bash
# Compress your project
tar -czf laravel-api.tar.gz .

# Upload to server (use your hosting details)
scp laravel-api.tar.gz username@yourdomain.com:~/

# SSH into server
ssh username@yourdomain.com

# Extract files
tar -xzf laravel-api.tar.gz
```

### Method 2: Using File Manager
1. Compress your entire `backend-api` folder into a ZIP file
2. Login to cPanel → File Manager
3. Navigate to your domain's root directory (usually `public_html`)
4. Upload and extract the ZIP file

## Step 3: Directory Structure in cPanel

Your cPanel directory structure should look like this:

```
public_html/
├── api/                 # Your Laravel app files (except public)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env
│   ├── artisan
│   ├── composer.json
│   └── composer.lock
├── index.php           # Laravel's public/index.php (moved here)
├── .htaccess          # Laravel's public/.htaccess (moved here)
└── storage -> api/storage/app/public  # Symlink
```

## Step 4: Configure Web Root

### 4.1 Move Public Files
Move the contents of Laravel's `public/` directory to your domain's document root:

```bash
# Move public files to web root
mv api/public/* ./
mv api/public/.htaccess ./

# Update index.php paths
```

### 4.2 Update index.php
Edit the `index.php` file to point to the correct paths:

```php
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Update these paths
require __DIR__.'/api/vendor/autoload.php';

$app = require_once __DIR__.'/api/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
```

## Step 5: Set Up Database

### 5.1 Create Database in cPanel
1. Go to cPanel → MySQL Databases
2. Create a new database (e.g., `username_albaraka`)
3. Create a database user and assign to database
4. Note down the database details

### 5.2 Run Migrations
```bash
# Via SSH
cd /path/to/your/api
php artisan migrate --force

# Via cPanel Terminal (if available)
# Or upload a migration script
```

### 5.3 Seed Database (Optional)
```bash
php artisan db:seed --force
```

## Step 6: Set Permissions

Set correct permissions for Laravel directories:

```bash
# Storage and cache directories
chmod -R 775 api/storage
chmod -R 775 api/bootstrap/cache

# Make sure web server can write to these
chown -R username:username api/storage
chown -R username:username api/bootstrap/cache
```

## Step 7: Create Storage Symlink

Create a symlink for file uploads:

```bash
# Via SSH
ln -s /path/to/your/api/storage/app/public /path/to/public_html/storage

# Or create manually in File Manager
```

## Step 8: Configure .htaccess Files

### 8.1 Laravel Backend .htaccess
The `.htaccess` file in `public/` directory should include:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# CORS Headers for API
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    Header always set Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-TOKEN"
</IfModule>
```

### 8.2 React Frontend .htaccess
For your React app, create `.htaccess` in the web root:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Handle client-side routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/html "access plus 0 seconds"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>
```

## Step 9: Test Your Installation

1. Visit `https://yourdomain.com/api/test` (create a test route)
2. Check if API endpoints work: `https://yourdomain.com/api/products`
3. Verify database connections

## Step 10: Configure Your Frontend

Update your frontend API configuration to point to your cPanel domain:

```javascript
// In your React app's API configuration
const API_BASE_URL = 'https://yourdomain.com/api';
```

## Troubleshooting

### Common Issues:

1. **500 Internal Server Error**
   - Check file permissions
   - Verify .env configuration
   - Check error logs in cPanel

2. **Database Connection Error**
   - Verify database credentials in .env
   - Ensure database user has correct permissions

3. **Storage/Upload Issues**
   - Check storage symlink
   - Verify directory permissions

4. **CORS Issues**
   - Update CORS configuration in `config/cors.php`
   - Add your frontend domain to allowed origins

### Useful Commands:

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Check application status
php artisan about

# Run specific migrations
php artisan migrate:status
```

## Security Considerations

1. **Hide Laravel Files**: Keep Laravel app files outside web root
2. **Environment File**: Never commit `.env` to version control
3. **Debug Mode**: Always set `APP_DEBUG=false` in production
4. **HTTPS**: Use SSL certificates
5. **Database**: Use strong passwords and limit user permissions

## File Upload Configuration

If you're using file uploads, ensure:

1. Storage symlink is created
2. Upload directories have write permissions
3. PHP upload limits are sufficient:

```ini
; In php.ini or .htaccess
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

This guide should help you successfully deploy your Laravel API to cPanel hosting.
