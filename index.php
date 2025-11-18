<?php
// public_html/index.php - Dispatcher: jika request ke /api atau /health -> jalankan api.php
// otherwise serve index.html

// normalize path
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = $uri ?: '/';

// If request is for API or health -> include api.php
if (strpos($uri, '/api') === 0 || $uri === '/health') {
    // ensure api.php exists
    $apiFile = __DIR__ . '/api.php';
    if (is_file($apiFile)) {
        // Let api.php handle everything (it reads REQUEST_URI to route)
        require $apiFile;
        exit;
    } else {
        // fallback JSON error
        header('Content-Type: application/json; charset=utf-8', true, 500);
        echo json_encode(['success' => false, 'message' => 'API file missing']);
        exit;
    }
}

// Otherwise serve static index.html for SPA
$index = __DIR__ . '/index.html';
if (is_file($index)) {
    // Serve index.html (do not redirect)
    header('Content-Type: text/html; charset=utf-8');
    readfile($index);
    exit;
}

// If we get here nothing was found
http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo "Not Found";
exit;
