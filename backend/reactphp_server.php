<?php
/**
 * =====================================================
 * BACKEND REACTPHP UNTUK PEMILU MAHASISWA
 * Production Ready untuk api.jdrive.web.id
 * (Diperbaiki: DSN aman, error logging ke file, forced DB check via SELECT 1)
 * =====================================================
 */

// Debug bootstrap marker (membantu mengetahui apakah file dieksekusi)
echo "BOOT: starting reactphp_server.php\n";
flush();

require __DIR__ . '/vendor/autoload.php';

use React\EventLoop\Loop;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\MySQL\Factory as MySQLFactory;
use React\MySQL\ConnectionInterface;
use Psr\Http\Message\ServerRequestInterface;

// =====================================================
// DEBUG / LOGGING (sementara — matikan display_errors di production)
// =====================================================
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/reactphp_error.log');
error_reporting(E_ALL);

// =====================================================
// KONFIGURASI (pisahkan kredensial sensitif jika memungkinkan)
// =====================================================
$dbUser = 'pemirap1_atmin';
$dbPass = 't&psHAIQE[a(];*R'; // ganti sesuai real password
$dbHost = 'localhost';
$dbPort = '3306';
$dbName = 'pemirap1_pemilu_mahasiswa';

$config = [
    // db akan dibentuk di bawah dengan rawurlencode untuk password
    'port' => getenv('PORT') ?: 8080,
    'host' => '0.0.0.0',
    'allowed_origins' => [
        'https://jdrive.web.id',
        'https://www.jdrive.web.id',
        'https://api.jdrive.web.id'
    ]
];

// bangun DSN aman (encode password agar karakter spesial tidak merusak DSN)
$config['db'] = sprintf('%s:%s@%s:%s/%s',
    $dbUser,
    rawurlencode($dbPass),
    $dbHost,
    $dbPort,
    $dbName
);

// =====================================================
// INISIALISASI
// =====================================================
$mysql = new MySQLFactory();
$db = $mysql->createLazyConnection($config['db']);

// Force a simple query once to verify connection (LazyConnection doesn't have connect())
$db->query('SELECT 1')->then(function ($result) {
    error_log("MySQL: connected successfully");
}, function ($e) {
    error_log("MySQL connect failed: " . ($e instanceof \Throwable ? $e->getMessage() : json_encode($e)));
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================
function jsonResponse($data, $status = 200, $origin = null) {
    global $config;

    $allowedOrigin = '*';
    if ($origin && in_array($origin, $config['allowed_origins'], true)) {
        $allowedOrigin = $origin;
    }

    return new Response(
        $status,
        [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => $allowedOrigin,
            'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials' => 'true',
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'X-XSS-Protection' => '1; mode=block'
        ],
        json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );
}

function handleCORS($origin = null) {
    global $config;

    $allowedOrigin = '*';
    if ($origin && in_array($origin, $config['allowed_origins'], true)) {
        $allowedOrigin = $origin;
    }

    return new Response(200, [
        'Access-Control-Allow-Origin' => $allowedOrigin,
        'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials' => 'true'
    ]);
}

function logRequest($method, $path, $ip) {
    $timestamp = date('Y-m-d H:i:s');
    echo "[{$timestamp}] {$method} {$path} - {$ip}\n";
}

// =====================================================
// ENDPOINT HANDLERS
// =====================================================
function handleVoterLogin(ServerRequestInterface $request, ConnectionInterface $db, $origin) {
    return \React\Promise\resolve($request->getBody()->getContents())
        ->then(function ($body) use ($db, $origin) {
            $data = json_decode($body, true);
            $nim = trim($data['nim'] ?? '');
            $token = trim($data['token'] ?? '');

            if (empty($nim) || empty($token)) {
                return jsonResponse(['success' => false, 'message' => 'NIM dan Token wajib diisi'], 400, $origin);
            }

            return $db->query(
                'SELECT id, nim, nama, sudah_memilih FROM pemilih WHERE nim = ? AND token = ?',
                [$nim, $token]
            )->then(function ($result) use ($origin) {
                if (empty($result->resultRows)) {
                    return jsonResponse(['success' => false, 'message' => 'NIM atau Token salah'], 401, $origin);
                }

                $voter = $result->resultRows[0];

                if (!empty($voter['sudah_memilih']) && $voter['sudah_memilih'] == 1) {
                    return jsonResponse(['success' => false, 'message' => 'Token sudah digunakan'], 403, $origin);
                }

                return jsonResponse([
                    'success' => true,
                    'voter_id' => $voter['id'],
                    'voter_name' => $voter['nama']
                ], 200, $origin);
            });
        })
        ->otherwise(function ($error) use ($origin) {
            error_log("Login error: " . ($error instanceof \Throwable ? $error->getMessage() : json_encode($error)));
            return jsonResponse(['success' => false, 'message' => 'Terjadi kesalahan server'], 500, $origin);
        });
}

function handleVote(ServerRequestInterface $request, ConnectionInterface $db, $origin) {
    return \React\Promise\resolve($request->getBody()->getContents())
        ->then(function ($body) use ($db, $origin) {
            $data = json_decode($body, true);
            $voterId = (int)($data['voter_id'] ?? 0);
            $candidateId = (int)($data['candidate_id'] ?? 0);

            if (!$voterId || !$candidateId) {
                return jsonResponse(['success' => false, 'message' => 'Data tidak lengkap'], 400, $origin);
            }

            return $db->query(
                'SELECT id, nim, nama, fakultas, program_studi, sudah_memilih FROM pemilih WHERE id = ?',
                [$voterId]
            )->then(function ($result) use ($db, $voterId, $candidateId, $origin) {
                if (empty($result->resultRows)) {
                    return jsonResponse(['success' => false, 'message' => 'Pemilih tidak ditemukan'], 404, $origin);
                }

                $pemilih = $result->resultRows[0];

                if ($pemilih['sudah_memilih'] == 1) {
                    return jsonResponse(['success' => false, 'message' => 'Anda sudah memilih'], 403, $origin);
                }

                $nim       = $pemilih['nim'];
                $nama      = $pemilih['nama'];
                $fakultas  = $pemilih['fakultas'];
                $program   = $pemilih['program_studi'];

                // Insert ke tabel suara sesuai struktur yang kamu pakai
                return $db->query(
                    'INSERT INTO suara (pemilih_id, nim, nama, fakultas, program_studi, kandidat_id, waktu_vote)
                     VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [$voterId, $nim, $nama, $fakultas, $program, $candidateId]
                )->then(function () use ($db, $voterId, $origin) {

                    return $db->query(
                        'UPDATE pemilih SET sudah_memilih = TRUE, waktu_memilih = NOW() WHERE id = ?',
                        [$voterId]
                    )->then(function () use ($origin) {
                        return jsonResponse(['success' => true, 'message' => 'Suara berhasil disimpan'], 200, $origin);
                    });

                });
            });
        })
        ->otherwise(function ($error) use ($origin) {
            error_log("Vote error: " . ($error instanceof \Throwable ? $error->getMessage() : json_encode($error)));
            return jsonResponse(['success' => false, 'message' => 'Terjadi kesalahan server'], 500, $origin);
        });
}


function handleAdminLogin(ServerRequestInterface $request, ConnectionInterface $db, $origin) {
    return \React\Promise\resolve($request->getBody()->getContents())
        ->then(function ($body) use ($db, $origin) {
            $data = json_decode($body, true);
            $username = trim($data['username'] ?? '');
            $password = $data['password'] ?? '';

            return $db->query(
                'SELECT id, username, password FROM admin WHERE username = ?',
                [$username]
            )->then(function ($result) use ($password, $origin) {
                if (empty($result->resultRows)) {
                    return jsonResponse(['success' => false, 'message' => 'Username salah'], 401, $origin);
                }

                $admin = $result->resultRows[0];

                if ($admin['password'] !== $password) {
                    return jsonResponse(['success' => false, 'message' => 'Password salah'], 401, $origin);
                }

                $token = bin2hex(random_bytes(16));

                return jsonResponse([
                    'success' => true,
                    'token' => $token,
                    'username' => $admin['username']
                ], 200, $origin);
            });
        })
        ->otherwise(function ($error) use ($origin) {
            error_log("Admin login error: " . ($error instanceof \Throwable ? $error->getMessage() : json_encode($error)));
            return jsonResponse(['success' => false, 'message' => 'Terjadi kesalahan server'], 500, $origin);
        });
}

function handleAdminStats(ConnectionInterface $db, $origin) {
    return \React\Promise\all([
        $db->query('SELECT kandidat_id, COUNT(*) as total FROM suara GROUP BY kandidat_id'),
        $db->query('SELECT 
            SUM(CASE WHEN sudah_memilih = TRUE THEN 1 ELSE 0 END) as voted,
            SUM(CASE WHEN sudah_memilih = FALSE THEN 1 ELSE 0 END) as not_voted
            FROM pemilih'),
        $db->query('SELECT 
            fakultas as name,
            SUM(CASE WHEN sudah_memilih = TRUE THEN 1 ELSE 0 END) as voted,
            SUM(CASE WHEN sudah_memilih = FALSE THEN 1 ELSE 0 END) as notVoted
            FROM pemilih GROUP BY fakultas')
    ])->then(function (array $results) use ($origin) {
        $candidateVotes = isset($results[0]) ? $results[0]->resultRows : [];
        $participation = isset($results[1]) && !empty($results[1]->resultRows) ? $results[1]->resultRows[0] : ['voted' => 0, 'not_voted' => 0];
        $facultyStats = isset($results[2]) ? $results[2]->resultRows : [];

        $candidate1 = 0;
        $candidate2 = 0;

        foreach ($candidateVotes as $vote) {
            if ($vote['kandidat_id'] == 1) $candidate1 = (int)$vote['total'];
            if ($vote['kandidat_id'] == 2) $candidate2 = (int)$vote['total'];
        }

        return jsonResponse([
            'success' => true,
            'stats' => [
                'candidate1' => $candidate1,
                'candidate2' => $candidate2,
                'totalVoted' => (int)($participation['voted'] ?? 0),
                'totalNotVoted' => (int)($participation['not_voted'] ?? 0),
                'facultyStats' => $facultyStats
            ]
        ], 200, $origin);
    })->otherwise(function ($error) use ($origin) {
        error_log("Stats error: " . ($error instanceof \Throwable ? $error->getMessage() : json_encode($error)));
        return jsonResponse(['success' => false, 'message' => 'Terjadi kesalahan server'], 500, $origin);
    });
}

function handleAdminVoters(ConnectionInterface $db, $origin) {
    return $db->query('SELECT nim, nama as name, fakultas as faculty, program_studi as program, 
                       sudah_memilih as hasVoted, waktu_memilih as votedAt 
                       FROM pemilih ORDER BY nim')
        ->then(function ($result) use ($origin) {
            $voters = array_map(function($row) {
                return [
                    'nim' => $row['nim'],
                    'name' => $row['name'],
                    'faculty' => $row['faculty'],
                    'program' => $row['program'],
                    'hasVoted' => (bool)$row['hasVoted'],
                    'votedAt' => $row['votedAt']
                ];
            }, $result->resultRows);

            return jsonResponse([
                'success' => true,
                'voters' => $voters
            ], 200, $origin);
        })
        ->otherwise(function ($error) use ($origin) {
            error_log("Voters error: " . ($error instanceof \Throwable ? $error->getMessage() : json_encode($error)));
            return jsonResponse(['success' => false, 'message' => 'Terjadi kesalahan server'], 500, $origin);
        });
}

// Health check endpoint
function handleHealthCheck($origin) {
    return jsonResponse([
        'status' => 'ok',
        'timestamp' => date('Y-m-d H:i:s'),
        'service' => 'Pemilu Mahasiswa API'
    ], 200, $origin);
}

// =====================================================
// ROUTER
// =====================================================
$server = new HttpServer(function (ServerRequestInterface $request) use ($db) {
    $method = $request->getMethod();
    $path = $request->getUri()->getPath();
    $origin = $request->getHeaderLine('Origin');

    // Get client IP
    $ip = $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown';
    logRequest($method, $path, $ip);

    // Handle CORS preflight
    if ($method === 'OPTIONS') {
        return handleCORS($origin);
    }

    // Routes
    switch (true) {
        case $method === 'GET' && $path === '/':
        case $method === 'GET' && $path === '/health':
            return handleHealthCheck($origin);

        case $method === 'POST' && $path === '/api/voter/login':
            return handleVoterLogin($request, $db, $origin);

        case $method === 'POST' && $path === '/api/vote':
            return handleVote($request, $db, $origin);

        case $method === 'POST' && $path === '/api/admin/login':
            return handleAdminLogin($request, $db, $origin);

        case $method === 'GET' && $path === '/api/admin/stats':
            return handleAdminStats($db, $origin);

        case $method === 'GET' && $path === '/api/admin/voters':
            return handleAdminVoters($db, $origin);

        default:
            return jsonResponse(['error' => 'Endpoint not found'], 404, $origin);
    }
});

// =====================================================
// START SERVER
// =====================================================
$socket = new React\Socket\SocketServer($config['host'] . ':' . $config['port']);
$server->listen($socket);

echo "🚀 ReactPHP Server berjalan di http://{$config['host']}:{$config['port']}\n";
echo "📊 Domain: api.jdrive.web.id\n";
echo "🔐 Endpoints tersedia:\n";
echo "   GET  /health\n";
echo "   POST /api/voter/login\n";
echo "   POST /api/vote\n";
echo "   POST /api/admin/login\n";
echo "   GET  /api/admin/stats\n";
echo "   GET  /api/admin/voters\n";
echo "\nTekan Ctrl+C untuk berhenti.\n";