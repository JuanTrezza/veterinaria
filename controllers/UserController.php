<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../db/conexion.php';
require_once __DIR__ . '/../AuthJWT.php';

// Controlador para manejar las operaciones de usuario
// Incluye registro, login, y operaciones administrativas
class UserController {
    public function registrar(Request $request, Response $response): Response {
        $data = $request->getParsedBody();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $tipo = $data['tipo'] ?? 'usuario';//CAMBIE POR TIPO

        if (!$email || !$password) {
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json')
                ->write(json_encode(['error' => 'Email y contraseña requeridos.']));
        }

        $pdo = Conexion::get();
        $stmt = $pdo->prepare("INSERT INTO usuarios (email, password, tipo) VALUES (?, ?, ?)");
        $stmt->execute([$email, password_hash($password, PASSWORD_DEFAULT), $tipo]);

        $response->getBody()->write(json_encode(['mensaje' => 'Usuario registrado con éxito.']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Método para manejar el login de usuarios
    // POST /api/usuarios/login
    public function login($request, $response) {
        $data = json_decode($request->getBody()->getContents(), true);
        $email = $data['email'];
        $password = $data['password'];

        $pdo = Conexion::get();
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && password_verify($password, $usuario['password'])) {
            $token = AuthJWT::generarToken([
                'id' => $usuario['id'],
                'tipo' => $usuario['tipo']
            ]);

            $response->getBody()->write(json_encode([
                'token' => $token,
                'usuario' => [
                    'id' => $usuario['id'],
                    'tipo' => $usuario['tipo']
                ]
            ]));

            return $response->withHeader('Content-Type', 'application/json');
        } else {
            $response->getBody()->write(json_encode([
                'error' => 'Credenciales inválidas'
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    }

    // ============ NUEVO: Registrar un administrador ===============
    // POST /api/admin/registro
    public function registrarAdmin(Request $request, Response $response, $args = []) {
        $data = $request->getParsedBody();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $tipo = 'admin';

        if (!$email || !$password) {
            $response->getBody()->write(json_encode(['error' => 'Email y contraseña requeridos.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $pdo = Conexion::get();

        // Verificar si ya existe
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $response->getBody()->write(json_encode(['error' => 'El email ya está registrado.']));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }

        $stmt = $pdo->prepare("INSERT INTO usuarios (email, password, tipo) VALUES (?, ?, ?)");
        $stmt->execute([$email, password_hash($password, PASSWORD_DEFAULT), $tipo]);

        $response->getBody()->write(json_encode(['mensaje' => 'Administrador registrado con éxito.']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // =========== NUEVO: Listar todos los usuarios ===============
    // GET /api/admin/usuarios
    public function listarUsuarios(Request $request, Response $response, $args = []) {
        $pdo = Conexion::get();
        $stmt = $pdo->query("SELECT id, email, tipo, fecha_registro FROM usuarios ORDER BY id DESC");
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($usuarios));
        return $response->withHeader('Content-Type', 'application/json');
    }
}

