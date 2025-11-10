<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../db/conexion.php';
require_once __DIR__ . '/../AuthJWT.php';

class TurnoController {

    public function solicitar(Request $request, Response $response): Response {
        $data = json_decode($request->getBody()->getContents(), true);
        $usuario = AuthJWT::obtenerUsuario($request);

        $id_mascota = $data['id_mascota'];
        $id_turno_disponible = $data['id_turno_disponible'];

        $pdo = Conexion::get();

        // Verifica que el turno esté habilitado y disponible
        $stmt = $pdo->prepare("SELECT * FROM turnos_disponibles WHERE id = ? AND habilitado = 1 AND disponible = 1");
        $stmt->execute([$id_turno_disponible]);
        $turnoDisponible = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$turnoDisponible) {
            $response->getBody()->write(json_encode(['error' => 'Turno no disponible']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Marca como no disponible
        $pdo->prepare("UPDATE turnos_disponibles SET disponible = 0 WHERE id = ?")->execute([$id_turno_disponible]);

        // Crea turno
        $stmt = $pdo->prepare("INSERT INTO turnos (id_usuario, id_mascota, id_turno_disponible) VALUES (?, ?, ?)");
        $stmt->execute([$usuario['id'], $id_mascota, $id_turno_disponible]);

        $response->getBody()->write(json_encode(['mensaje' => 'Turno reservado correctamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function verMisTurnos(Request $request, Response $response): Response {
        $usuario = AuthJWT::obtenerUsuario($request);
        $pdo = Conexion::get();

        $stmt = $pdo->prepare("
            SELECT t.id, m.nombre AS mascota, td.fecha, td.hora, t.estado
            FROM turnos t
            JOIN mascotas m ON t.id_mascota = m.id
            JOIN turnos_disponibles td ON t.id_turno_disponible = td.id
            WHERE t.id_usuario = ?
        ");
        $stmt->execute([$usuario['id']]);

        $turnos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response->getBody()->write(json_encode($turnos));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function verDisponibles(Request $request, Response $response): Response {
        $pdo = Conexion::get();

        $stmt = $pdo->prepare("SELECT * FROM turnos_disponibles WHERE habilitado = 1 AND disponible = 1 ORDER BY fecha, hora");
        $stmt->execute();
        $turnos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($turnos));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // =========== NUEVO: Listar todos los turnos (admin) ==========
    // GET /api/admin/turnos
    public function listarTodos(Request $request, Response $response, $args = []) {
        $pdo = Conexion::get();
        $stmt = $pdo->query("
            SELECT t.id, u.email as usuario_email, m.nombre as mascota, td.fecha, td.hora, t.estado, t.costo, t.descripcion
            FROM turnos t
            JOIN usuarios u ON t.id_usuario = u.id
            JOIN mascotas m ON t.id_mascota = m.id
            JOIN turnos_disponibles td ON t.id_turno_disponible = td.id
            ORDER BY td.fecha DESC, td.hora DESC
        ");
        $turnos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $response->getBody()->write(json_encode($turnos));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // =========== NUEVO: Cancelar turno (usuario) ==========
    // PUT /api/turnos/{id}
    public function cancelar(Request $request, Response $response, $args) {
        $usuario = AuthJWT::obtenerUsuario($request);
        $turnoId = $args['id'];
        $pdo = Conexion::get();

        // Verificar que el turno sea del usuario y esté pendiente
        $stmt = $pdo->prepare("SELECT * FROM turnos WHERE id = ? AND id_usuario = ?");
        $stmt->execute([$turnoId, $usuario['id']]);
        $turno = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$turno) {
            $response->getBody()->write(json_encode(['error' => 'Turno no encontrado o no autorizado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        if ($turno['estado'] !== 'pendiente') {
            $response->getBody()->write(json_encode(['error' => 'Solo se pueden cancelar turnos pendientes']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Liberar el turno disponible asociado
        $pdo->prepare("UPDATE turnos_disponibles SET disponible = 1 WHERE id = ?")->execute([$turno['id_turno_disponible']]);
        // Cancelar el turno
        $pdo->prepare("UPDATE turnos SET estado = 'cancelado' WHERE id = ?")->execute([$turnoId]);

        $response->getBody()->write(json_encode(['mensaje' => 'Turno cancelado']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // =========== NUEVO: Cambiar estado del turno (admin) ==========
    // PATCH /api/admin/turnos/{id}
    public function cambiarEstado(Request $request, Response $response, $args) {
        $turnoId = $args['id'];
        $data = $request->getParsedBody();
        $estado = $data['estado'] ?? null; // 'asistido', 'ausente', 'cancelado'
        $costo = $data['costo'] ?? null;
        $descripcion = $data['descripcion'] ?? null;

        $pdo = Conexion::get();

        // Validar estado
        $estadosValidos = ['asistido', 'ausente', 'cancelado', 'pendiente'];
        if (!$estado || !in_array($estado, $estadosValidos)) {
            $response->getBody()->write(json_encode(['error' => 'Estado no válido']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Actualizar estado, costo y descripción
        $stmt = $pdo->prepare("UPDATE turnos SET estado = ?, costo = ?, descripcion = ? WHERE id = ?");
        $stmt->execute([$estado, $costo, $descripcion, $turnoId]);

        $response->getBody()->write(json_encode(['mensaje' => 'Estado del turno actualizado']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}



