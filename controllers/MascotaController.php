<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../db/conexion.php';
require_once __DIR__ . '/../AuthJWT.php';

class MascotaController {

    // ✅ Registrar mascota (con soporte de imagen)
    public function registrar(Request $request, Response $response): Response {
        $usuario = AuthJWT::obtenerUsuario($request);
        $pdo = Conexion::get();

        $contentType = $request->getHeaderLine('Content-Type');
        $data = [];

        // 📦 Soporte para JSON o multipart/form-data
        if (strstr($contentType, 'application/json')) {
            $data = json_decode($request->getBody()->getContents(), true);
        } else {
            $parsedBody = $request->getParsedBody();
            $data['nombre'] = $parsedBody['nombre'] ?? '';
            $data['especie'] = $parsedBody['especie'] ?? '';
            $data['edad'] = $parsedBody['edad'] ?? null;
        }

        // 📸 Subida de imagen
        $fotoPath = null;
        $uploadedFiles = $request->getUploadedFiles();

        if (isset($uploadedFiles['foto'])) {
            $foto = $uploadedFiles['foto'];
            if ($foto->getError() === UPLOAD_ERR_OK) {
                $uploadDir = __DIR__ . '/../uploads';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $filename = uniqid('mascota_') . '_' . preg_replace('/[^a-zA-Z0-9\._-]/', '', $foto->getClientFilename());
                $foto->moveTo($uploadDir . DIRECTORY_SEPARATOR . $filename);
                $fotoPath = 'uploads/' . $filename;
            }
        }

        // Guardar en DB
        $stmt = $pdo->prepare("INSERT INTO mascotas (id_usuario, nombre, especie, edad, foto) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $usuario['id'],
            $data['nombre'],
            $data['especie'],
            $data['edad'],
            $fotoPath
        ]);

        $response->getBody()->write(json_encode([
            'mensaje' => 'Mascota registrada correctamente',
            'foto' => $fotoPath
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // ✅ Listar mascotas del usuario o todas si es admin
    public function listar(Request $request, Response $response): Response {
        $usuario = AuthJWT::obtenerUsuario($request);
        $pdo = Conexion::get();

        if ($usuario['tipo'] === 'admin') {
            $stmt = $pdo->query("SELECT * FROM mascotas");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM mascotas WHERE id_usuario = ?");
            $stmt->execute([$usuario['id']]);
        }

        $mascotas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response->getBody()->write(json_encode($mascotas));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // ✅ Listar todas las mascotas (solo para admin)
    public function listarTodas(Request $request, Response $response, $args = []): Response {
        $pdo = Conexion::get();
        $stmt = $pdo->query("SELECT * FROM mascotas");
        $mascotas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response->getBody()->write(json_encode($mascotas));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // 🗑️ Eliminar mascota (borra registro y su foto del servidor)
    public function eliminar(Request $request, Response $response, $args): Response {
        $usuario = AuthJWT::obtenerUsuario($request);
        $idMascota = $args['id'];
        $pdo = Conexion::get();

        // Buscar mascota (propia o de cualquier usuario si es admin)
        if ($usuario['tipo'] === 'admin') {
            $stmt = $pdo->prepare("SELECT * FROM mascotas WHERE id = ?");
            $stmt->execute([$idMascota]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM mascotas WHERE id = ? AND id_usuario = ?");
            $stmt->execute([$idMascota, $usuario['id']]);
        }

        $mascota = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$mascota) {
            $response->getBody()->write(json_encode(['error' => 'Mascota no encontrada o no autorizada.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Borrar imagen si existe
        if (!empty($mascota['foto'])) {
            $rutaFoto = __DIR__ . '/../' . $mascota['foto'];
            if (file_exists($rutaFoto)) {
                unlink($rutaFoto);
            }
        }

        // Eliminar mascota
        $stmt = $pdo->prepare("DELETE FROM mascotas WHERE id = ?");
        $stmt->execute([$idMascota]);

        $response->getBody()->write(json_encode(['mensaje' => 'Mascota eliminada correctamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}



