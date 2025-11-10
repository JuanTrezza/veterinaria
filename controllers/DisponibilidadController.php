<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../db/conexion.php';

class DisponibilidadController {
    public function generar(Request $request, Response $response): Response {
        $data = json_decode($request->getBody()->getContents(), true);
        $dias = $data['dias'] ?? 7;

        $inicio = new DateTime();
        $pdo = Conexion::get();

        $horas = [
            '09:00:00', '10:00:00', '11:00:00', '12:00:00',
            '13:00:00', '14:00:00', '15:00:00', '16:00:00',
            '17:00:00', '18:00:00'
        ];

        for ($i = 0; $i < $dias; $i++) {
            $fecha = (clone $inicio)->modify("+$i days");

            // Solo lunes a viernes
            if (in_array($fecha->format('N'), [1, 2, 3, 4, 5])) {
                foreach ($horas as $hora) {
                    try {
                        $stmt = $pdo->prepare("
                            INSERT INTO turnos_disponibles (fecha, hora, habilitado, disponible)
                            VALUES (?, ?, 1, 1)
                        ");
                        $stmt->execute([$fecha->format('Y-m-d'), $hora]);
                    } catch (PDOException $e) {
                        // Ignorar duplicados por UNIQUE(fecha, hora)
                        continue;
                    }
                }
            }
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Turnos generados correctamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function verPorFecha(Request $request, Response $response): Response {
        $data = $request->getParsedBody();
        $fecha = $data['fecha'] ?? null;

        if (!$fecha) {
            $response->getBody()->write(json_encode(['error' => 'Debe proporcionar una fecha']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $pdo = Conexion::get();
        $stmt = $pdo->prepare("SELECT * FROM turnos_disponibles WHERE fecha = ? AND habilitado = 1 AND disponible = 1 ORDER BY hora");
        $stmt->execute([$fecha]);

        $turnos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $response->getBody()->write(json_encode($turnos));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // =========== Mejorado: Desactivar uno o varios días ===========
    // PUT /api/admin/turnos-disponibles/desactivar-dia
    // Body: {"fechas": ["2024-07-10", "2024-07-11"]}
    public function desactivarDia(Request $request, Response $response): Response {
        $data = json_decode($request->getBody()->getContents(), true);

        // Permite desactivar uno o varios días
        $fechas = $data['fechas'] ?? null;
        if (!$fechas) {
            // Para compatibilidad, también acepta {"fecha": "..."}
            if (isset($data['fecha'])) {
                $fechas = [$data['fecha']];
            } else {
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json')
                    ->write(json_encode(['error' => 'Debes proporcionar una o más fechas']));
            }
        }

        $pdo = Conexion::get();
        $count = 0;
        foreach ($fechas as $fecha) {
            $stmt = $pdo->prepare("UPDATE turnos_disponibles SET habilitado = 0, disponible = 0 WHERE fecha = ?");
            $stmt->execute([$fecha]);
            $count += $stmt->rowCount();
        }

        $response->getBody()->write(json_encode(['mensaje' => "Día(s) desactivado(s) correctamente", 'fechas' => $fechas, 'afectados' => $count]));
        return $response->withHeader('Content-Type', 'application/json');
    }
}


