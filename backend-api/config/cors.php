<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', '*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://albarakadates.com',
        'https://www.albarakadates.com',
        'http://localhost',
    ],
    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.albarakadates\.com$/',
        '/^https:\/\/.*\.vercel\.app$/',
        '/^https:\/\/.*\.netlify\.app$/'
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
