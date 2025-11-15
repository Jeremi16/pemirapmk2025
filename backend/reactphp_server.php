<?php
/**
 * =====================================================
 * CONTOH BACKEND REACTPHP UNTUK PEMILU MAHASISWA
 * =====================================================
 * 
 * Install dependencies:
 * composer require react/http react/mysql react/promise
 * 
 * Jalankan server:
 * php reactphp_server.php
 * 
 * Server akan berjalan di: http://localhost:8080
 */

require __DIR__ . '/vendor/autoload.php';

use React\EventLoop\Loop;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\MySQL\Factory as MySQLFactory;
use React\MySQL\ConnectionInterface;
use Psr\Http\Message\ServerRequestInterface;

// =====================================================
// KONFIGURASI DATABASE
// =====================================================
$dbConfig = 'root:@localhost:3306/pemilu_mahasiswa'; // user:password@host/database

// =====================================================
// INISIALISASI EVENT LOOP & DATABASE CONNECTION
// =====================================================
$mysql = new MySQLFactory();
$db = $mysql->createLazyConnection($dbConfig);

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function jsonResponse($data, $status = 200) {
    return new Response(
        $status,
        [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => '*', // CORS untuk frontend
            'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
        ],
        json_encode($data)
    );
}

function handleCORS() {
    return new Response(200, [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization'
    ]);
}

// =====================================================
// ENDPOINT HANDLERS
// =====================================================

/**
 * ENDPOINT: POST /api/voter/login
 * Login pemilih dengan NIM dan Token
 */
function handleVoterLogin(ServerRequestInterface $request, ConnectionInterface $db) {
    return \React\Promise\resolve($request->getBody()->getContents())
        ->then(function ($body) use ($db) {
            $data = json_decode($body, true);
            $nim = $data['nim'] ?? '';
            $token = $data['token'] ?? '';

            if (empty($nim) || empty($token)) {
                return jsonResponse(['success' => false, 'message' => 'NIM dan Token wajib diisi'], 400);
            }

            // Query async: cek pemilih
            return $db->query(
                'SELECT id, nim, nama, sudah_memilih FROM pemilih WHERE nim = ? AND token = ?',
                [$nim, $token]
            )->then(function ($result) {
                if (empty($result->resultRows)) {
                    return jsonResponse(['success' => false, 'message' => 'NIM atau Token salah'], 401);
                }

                $voter = $result->resultRows[0];

                if ($voter['sudah_memilih'] == 1) {
                    return jsonResponse(['success' => false, 'message' => 'Token sudah digunakan'], 403);
                }

                return jsonResponse([
                    'success' => true,
                    'voter_id' => $voter['id'],
                    'voter_name' => $voter['nama']
                ]);
            });
        })
        ->otherwise(function ($error) {
            return jsonResponse(['success' => false, 'message' => 'Database error: ' . $error->getMessage()], 500);
        });
}

/**
 * ENDPOINT: POST /api/vote
 * Simpan suara pemilih
 */
function handleVote(ServerRequestInterface $request, ConnectionInterface $db) {
    return \React\Promise\resolve($request->getBody()->getContents())
        ->then(function ($body) use ($db) {
            $data = json_decode($body, true);
            $voterId = $data['voter_id'] ?? 0;
            $candidateId = $data['candidate_id'] ?? 0;

            if (!$voterId || !$candidateId) {
                return jsonResponse(['success' => false, 'message' => 'Data tidak lengkap'], 400);
            }

            // Cek apakah sudah memilih
            return $db->query(
                'SELECT sudah_memilih FROM pemilih WHERE id = ?',
                [$voterId]
            )->then(function ($result) use ($db, $voterId, $candidateId) {
                if (empty($result->resultRows) || $result->resultRows[0]['sudah_memilih'] == 1) {
                    return jsonResponse(['success' => false, 'message' => 'Anda sudah memilih'], 403);
                }

                // Insert vote
                return $db->query(
                    'INSERT INTO suara (pemilih_id, kandidat_id) VALUES (?, ?)',
                    [$voterId, $candidateId]
                )->then(function () use ($db, $voterId) {
                    // Update status pemilih
                    return $db->query(
                        'UPDATE pemilih SET sudah_memilih = TRUE, waktu_memilih = NOW() WHERE id = ?',
                        [$voterId]
                    )->then(function () {
                        return jsonResponse(['success' => true, 'message' => 'Suara berhasil disimpan']);
                    });
                });
            });
        })
        ->otherwise(function ($error) {
            return jsonResponse(['success' => false, 'message' => 'Database error: ' . $error->getMessage()], 500);
        });
}

/**
 * ENDPOINT: POST /api/admin/login
 * Login admin
 */
function handleAdminLogin(ServerRequestInterface $request, ConnectionInterface $db) {
    return \React\Promise\resolve($request->getBody()->getContents())
        ->then(function ($body) use ($db) {
            $data = json_decode($body, true);
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';

            if ($username === '' || $password === '') {
                return jsonResponse(['success' => false, 'message' => 'Username dan password wajib diisi'], 400);
            }

            return $db->query(
                'SELECT id, username, password FROM admin WHERE username = ?',
                [$username]
            )->then(function ($result) use ($password) {
                if (empty($result->resultRows)) {
                    return jsonResponse(['success' => false, 'message' => 'Username salah'], 401);
                }

                $admin = $result->resultRows[0];
                $stored = $admin['password'];

                // Determine stored scheme and verify
                $isBcryptOrArgon = str_starts_with($stored, '$2y$') || str_starts_with($stored, '$2a$') || str_starts_with($stored, '$argon2');
                $isSha256Hex = preg_match('/^[a-f0-9]{64}$/i', $stored) === 1;

                $valid = false;
                if ($isBcryptOrArgon) {
                    // Modern hash (bcrypt/argon2)
                    $valid = password_verify($password, $stored);
                } elseif ($isSha256Hex) {
                    // Legacy SHA-256 hex stored in DB
                    $valid = hash_equals($stored, hash('sha256', $password)) || hash_equals($stored, $password);
                } else {
                    // Legacy plaintext in DB
                    $valid = hash_equals($stored, $password);
                }

                if (!$valid) {
                    return jsonResponse(['success' => false, 'message' => 'Password salah'], 401);
                }

                // Generate token sederhana
                $token = bin2hex(random_bytes(16));

                return jsonResponse([
                    'success' => true,
                    'token' => $token,
                    'username' => $admin['username']
                ]);
            });
        })
        ->otherwise(function ($error) {
            return jsonResponse(['success' => false, 'message' => 'Database error'], 500);
        });
}
/**
 * ENDPOINT: GET /api/admin/stats
 * Statistik untuk admin dashboard
 */
function handleAdminStats(ConnectionInterface $db) {
    // Query multiple menggunakan Promise::all untuk parallel execution
    return \React\Promise\all([
        // Total suara per kandidat
        $db->query('SELECT kandidat_id, COUNT(*) as total FROM suara GROUP BY kandidat_id'),
        // Total pemilih
        $db->query('SELECT 
            SUM(CASE WHEN sudah_memilih = TRUE THEN 1 ELSE 0 END) as voted,
            SUM(CASE WHEN sudah_memilih = FALSE THEN 1 ELSE 0 END) as not_voted
            FROM pemilih'),
        // Partisipasi per fakultas
        $db->query('SELECT 
            fakultas as name,
            SUM(CASE WHEN sudah_memilih = TRUE THEN 1 ELSE 0 END) as voted,
            SUM(CASE WHEN sudah_memilih = FALSE THEN 1 ELSE 0 END) as notVoted
            FROM pemilih GROUP BY fakultas')
    ])->then(function ($results) {
        $candidateVotes = $results[0]->resultRows;
        $participation = $results[1]->resultRows[0];
        $facultyStats = $results[2]->resultRows;

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
                'totalVoted' => (int)$participation['voted'],
                'totalNotVoted' => (int)$participation['not_voted'],
                'facultyStats' => $facultyStats
            ]
        ]);
    })->otherwise(function ($error) {
        return jsonResponse(['success' => false, 'message' => 'Database error'], 500);
    });
}

/**
 * ENDPOINT: GET /api/admin/voters
 * Daftar pemilih untuk admin
 */
function handleAdminVoters(ConnectionInterface $db) {
    return $db->query('SELECT nim, nama as name, fakultas as faculty, program_studi as program, 
                       sudah_memilih as hasVoted, waktu_memilih as votedAt 
                       FROM pemilih ORDER BY nim')
        ->then(function ($result) {
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
            ]);
        })
        ->otherwise(function ($error) {
            return jsonResponse(['success' => false, 'message' => 'Database error'], 500);
        });
}

// =====================================================
// ROUTER UTAMA
// =====================================================
$server = new HttpServer(function (ServerRequestInterface $request) use ($db) {
    $method = $request->getMethod();
    $path = $request->getUri()->getPath();

    // Handle CORS preflight
    if ($method === 'OPTIONS') {
        return handleCORS();
    }

    // Route handling
    if ($method === 'POST' && $path === '/api/voter/login') {
        return handleVoterLogin($request, $db);
    }
    
    if ($method === 'POST' && $path === '/api/vote') {
        return handleVote($request, $db);
    }
    
    if ($method === 'POST' && $path === '/api/admin/login') {
        return handleAdminLogin($request, $db);
    }
    
    if ($method === 'GET' && $path === '/api/admin/stats') {
        return handleAdminStats($db);
    }
    
    if ($method === 'GET' && $path === '/api/admin/voters') {
        return handleAdminVoters($db);
    }

    // 404 Not Found
    return jsonResponse(['error' => 'Endpoint not found'], 404);
});

// =====================================================
// START SERVER
// =====================================================
$socket = new React\Socket\SocketServer('0.0.0.0:8080');
$server->listen($socket);

echo "🚀 ReactPHP Server berjalan di http://localhost:8080\n";
echo "📊 Endpoints tersedia:\n";
echo "   POST /api/voter/login\n";
echo "   POST /api/vote\n";
echo "   POST /api/admin/login\n";
echo "   GET  /api/admin/stats\n";
echo "   GET  /api/admin/voters\n";
echo "\nTekan Ctrl+C untuk berhenti.\n";
