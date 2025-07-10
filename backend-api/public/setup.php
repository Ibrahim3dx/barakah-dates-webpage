<?php
/**
 * One-time setup script for production deployment
 * Run this script once after uploading files to cPanel
 *
 * Usage: php setup.php
 * Or visit: https://yourdomain.com/setup.php (remove after setup)
 */

// Change to the Laravel root directory
chdir(__DIR__ . '/../');

// Load Laravel
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "<h1>Barakah Dates - Production Setup</h1>\n";

try {
    // Test database connection
    echo "<h2>1. Testing Database Connection...</h2>\n";
    DB::connection()->getPdo();
    echo "✅ Database connection successful!\n<br><br>";

    // Run migrations
    echo "<h2>2. Running Database Migrations...</h2>\n";
    Artisan::call('migrate', ['--force' => true]);
    echo "✅ Migrations completed!\n<br>";
    echo "<pre>" . Artisan::output() . "</pre><br>";

    // Run seeders
    echo "<h2>3. Seeding Database...</h2>\n";
    Artisan::call('db:seed', ['--force' => true]);
    echo "✅ Database seeded!\n<br>";
    echo "<pre>" . Artisan::output() . "</pre><br>";

    // Clear and cache config
    echo "<h2>4. Optimizing Application...</h2>\n";
    Artisan::call('config:cache');
    echo "✅ Config cached!\n<br>";

    Artisan::call('route:cache');
    echo "✅ Routes cached!\n<br>";

    Artisan::call('view:cache');
    echo "✅ Views cached!\n<br>";

    // Set up storage link
    echo "<h2>5. Setting up Storage Link...</h2>\n";
    if (!file_exists(public_path('storage'))) {
        Artisan::call('storage:link');
        echo "✅ Storage link created!\n<br>";
    } else {
        echo "✅ Storage link already exists!\n<br>";
    }

    // Check permissions
    echo "<h2>6. Checking Permissions...</h2>\n";
    $permissions = [
        'storage/app' => is_writable('storage/app'),
        'storage/framework' => is_writable('storage/framework'),
        'storage/logs' => is_writable('storage/logs'),
        'bootstrap/cache' => is_writable('bootstrap/cache'),
    ];

    foreach ($permissions as $path => $writable) {
        if ($writable) {
            echo "✅ $path is writable\n<br>";
        } else {
            echo "❌ $path is NOT writable - Please set permissions to 755 or 775\n<br>";
        }
    }

    // Display admin credentials
    echo "<h2>7. Admin Access Information</h2>\n";
    echo "<strong>Admin Login:</strong><br>";
    echo "Email: admin@barkahdates.com<br>";
    echo "Password: Admin123!<br><br>";

    echo "<strong>Dashboard URL:</strong><br>";
    echo "<a href='/dashboard' target='_blank'>Access Dashboard</a><br><br>";

    echo "<h2>✅ Setup Complete!</h2>\n";
    echo "<p><strong>IMPORTANT:</strong> Delete this setup.php file for security!</p>\n";
    echo "<p>Your Barakah Dates e-commerce platform is ready to use.</p>\n";

} catch (Exception $e) {
    echo "<h2>❌ Setup Failed</h2>\n";
    echo "<p>Error: " . $e->getMessage() . "</p>\n";
    echo "<p>Please check your database configuration in .env file.</p>\n";
}

// Show environment info
echo "<hr><h3>Environment Information</h3>\n";
echo "PHP Version: " . PHP_VERSION . "<br>\n";
echo "Laravel Version: " . app()->version() . "<br>\n";
echo "Environment: " . app()->environment() . "<br>\n";
echo "Database: " . config('database.default') . "<br>\n";
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
h1 { color: #2c3e50; }
h2 { color: #34495e; border-bottom: 1px solid #ecf0f1; padding-bottom: 5px; }
pre { background: #f8f9fa; padding: 10px; border-radius: 4px; }
.error { color: #e74c3c; }
.success { color: #27ae60; }
</style>
