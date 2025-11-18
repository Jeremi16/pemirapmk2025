<?php
// public_html/index.php
// API router (PDO) — gunakan bersama .htaccess

// Load config (ubah path sesuai struktur)
$configPath = __DIR__ . '/../pemilu/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Config missing']);
    exit;
}
$config = require $configPath;

// error/log
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', $config['error_log'] ?? __DIR__ . '/error.log');
error_reporting(E_ALL);

// CORS: hanya origin yang ada di allowed_origins
$allowed_origins = $config['allowed_origins'] ?? [];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header("Access-Control-Allow-Origin: null");
    header('Access-Control-Allow-Credentials: false');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// helper
function json_response($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
$input = json_decode(file_get_contents('php://input'), true) ?: [];

// PDO connection
try {
    $dbCfg = $config['db'];
    $dsn = "mysql:host={$dbCfg['host']};dbname={$dbCfg['name']};charset={$dbCfg['charset']}";
    $pdo = new PDO($dsn, $dbCfg['user'], $dbCfg['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (Throwable $e) {
    error_log("DB conn failed: " . $e->getMessage());
    json_response(['success' => false, 'message' => 'DB connection failed'], 500);
}

// routing
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

/* HEALTH */
if ($method === 'GET' && $path === '/health') {
    json_response(['status'=>'ok','service'=>'Pemilu Mahasiswa API','timestamp'=>date('Y-m-d H:i:s')]);
}


/* VOTER LOGIN */
if ($method === 'POST' && $path === '/api/voter/login') {
    $nim = trim($input['nim'] ?? '');
    $token = trim($input['token'] ?? '');
    if ($nim === '' || $token === '') json_response(['success' => false, 'message' => 'NIM dan Token wajib diisi'], 400);

    $stmt = $pdo->prepare('SELECT id, nim, nama, sudah_memilih FROM pemilih WHERE nim = ? AND token = ? LIMIT 1');
    $stmt->execute([$nim, $token]);
    $row = $stmt->fetch();
    if (!$row) json_response(['success' => false, 'message' => 'NIM atau Token salah'], 401);
    if ((int)$row['sudah_memilih'] === 1) json_response(['success' => false, 'message' => 'Token sudah digunakan'], 403);

    json_response(['success' => true, 'voter_id' => $row['id'], 'voter_name' => $row['nama']]);
}

/* VOTE */
if ($method === 'POST' && $path === '/api/vote') {
    $voterId = (int)($input['voter_id'] ?? 0);
    $candidateId = (int)($input['candidate_id'] ?? 0);
    if (!$voterId || !$candidateId) json_response(['success' => false, 'message' => 'Data tidak lengkap'], 400);

    $stmt = $pdo->prepare('SELECT id, nim, nama, fakultas, program_studi, sudah_memilih FROM pemilih WHERE id = ? LIMIT 1');
    $stmt->execute([$voterId]);
    $pemilih = $stmt->fetch();
    if (!$pemilih) json_response(['success' => false, 'message' => 'Pemilih tidak ditemukan'], 404);
    if ((int)$pemilih['sudah_memilih'] === 1) json_response(['success' => false, 'message' => 'Anda sudah memilih'], 403);

    $pdo->beginTransaction();
    try {
        $ins = $pdo->prepare('INSERT INTO suara (pemilih_id, nim, nama, fakultas, program_studi, kandidat_id, waktu_vote) VALUES (?, ?, ?, ?, ?, ?, NOW())');
        $ins->execute([$voterId, $pemilih['nim'], $pemilih['nama'], $pemilih['fakultas'], $pemilih['program_studi'], $candidateId]);

        $upd = $pdo->prepare('UPDATE pemilih SET sudah_memilih = 1, waktu_memilih = NOW() WHERE id = ?');
        $upd->execute([$voterId]);

        $pdo->commit();
        json_response(['success' => true, 'message' => 'Suara berhasil disimpan']);
    } catch (Throwable $e) {
        $pdo->rollBack();
        error_log("Vote error: " . $e->getMessage());
        json_response(['success' => false, 'message' => 'Terjadi kesalahan saat menyimpan suara'], 500);
    }
}

/* ADMIN LOGIN */
if ($method === 'POST' && $path === '/api/admin/login') {
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';
    if ($username === '' || $password === '') json_response(['success'=>false,'message'=>'Username & password perlu diisi'],400);

    $stmt = $pdo->prepare('SELECT id, username, password FROM admin WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    if (!$admin) json_response(['success' => false, 'message' => 'Username salah'], 401);

    // Jika password di DB belum di-hash (plain), pertimbangkan migrasi ke password_hash.
    if (password_verify($password, $admin['password'])) {
        // hashed password in DB
    } else if ($admin['password'] === $password) {
        // legacy plain text match — sebaiknya segera ubah ke hash
        // lakukan nothing, pass
    } else {
        json_response(['success' => false, 'message' => 'Password salah'], 401);
    }

    // Buat token dan simpan ke table admin_tokens (opsional)
    $token = bin2hex(random_bytes(16));
    $pdo->prepare('INSERT INTO admin_tokens (admin_id, token, created_at) VALUES (?, ?, NOW())')->execute([$admin['id'], $token]);

    json_response(['success' => true, 'token' => $token, 'username' => $admin['username']]);
}

/* ADMIN STATS */
if ($method === 'GET' && $path === '/api/admin/stats') {
    try {
        $cand = $pdo->query('SELECT kandidat_id, COUNT(*) as total FROM suara GROUP BY kandidat_id')->fetchAll();
        $part = $pdo->query("SELECT SUM(CASE WHEN sudah_memilih = 1 THEN 1 ELSE 0 END) as voted, SUM(CASE WHEN sudah_memilih = 0 THEN 1 ELSE 0 END) as not_voted FROM pemilih")->fetch();
        $fac = $pdo->query("SELECT fakultas as name, SUM(CASE WHEN sudah_memilih = 1 THEN 1 ELSE 0 END) as voted, SUM(CASE WHEN sudah_memilih = 0 THEN 1 ELSE 0 END) as notVoted FROM pemilih GROUP BY fakultas")->fetchAll();

        $candidate1 = 0; $candidate2 = 0;
        foreach ($cand as $v) {
            if ($v['kandidat_id'] == 1) $candidate1 = (int)$v['total'];
            if ($v['kandidat_id'] == 2) $candidate2 = (int)$v['total'];
        }

        json_response(['success'=>true,'stats'=>[
            'candidate1'=>$candidate1,
            'candidate2'=>$candidate2,
            'totalVoted'=>(int)($part['voted'] ?? 0),
            'totalNotVoted'=>(int)($part['not_voted'] ?? 0),
            'facultyStats'=>$fac
        ]]);
    } catch (Throwable $e) {
        error_log("Stats error: ".$e->getMessage());
        json_response(['success'=>false,'message'=>'Terjadi kesalahan server'],500);
    }
}

/* ADMIN VOTERS */
if ($method === 'GET' && $path === '/api/admin/voters') {
    try {
        $rows = $pdo->query('SELECT nim, nama as name, fakultas as faculty, program_studi as program, sudah_memilih as hasVoted, waktu_memilih as votedAt FROM pemilih ORDER BY nim')->fetchAll();
        $voters = array_map(function($r){
            return [
                'nim'=>$r['nim'],
                'name'=>$r['name'],
                'faculty'=>$r['faculty'],
                'program'=>$r['program'],
                'hasVoted'=> (bool)$r['hasVoted'],
                'votedAt'=> $r['votedAt']
            ];
        }, $rows);
        json_response(['success'=>true,'voters'=>$voters]);
    } catch (Throwable $e) {
        error_log("Voters error: " . $e->getMessage());
        json_response(['success'=>false,'message'=>'Terjadi kesalahan server'],500);
    }
}

// fallback
json_response(['error' => 'Endpoint not found'], 404);
