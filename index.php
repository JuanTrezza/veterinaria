<?php
require 'vendor/autoload.php';
require_once __DIR__ . '/db/conexion.php';
require_once 'AuthJWT.php';
require_once 'middlewares/AuthMiddleware.php';

require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/MascotaController.php';
require_once __DIR__ . '/controllers/TurnoController.php';
require_once __DIR__ . '/controllers/DisponibilidadController.php';

use Slim\Factory\AppFactory;
use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Middlewares\AuthMiddleware;

$app = AppFactory::create();
$app->setBasePath('/veterinaria');
$app->addBodyParsingMiddleware();

// Middleware CORS
$app->add(function (Request $request, $handler): Response {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*') // ⚠️ en producción usar tu dominio
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
});

// Manejo de OPTIONS
$app->options('/{routes:.+}', function (Request $request, Response $response) {
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
});

// Controladores
$userController = new UserController();
$mascotaController = new MascotaController();
$turnoController = new TurnoController();
$disponibilidadController = new DisponibilidadController();

// Rutas públicas
$app->post('/api/usuarios/registro', [$userController, 'registrar']);
$app->post('/api/usuarios/login', [$userController, 'login']);

// Rutas protegidas (usuario logueado)
$app->group('/api', function (RouteCollectorProxy $group) use ($mascotaController, $turnoController, $disponibilidadController) {
    // 🐾 Mascotas
    $group->post('/mascotas', [$mascotaController, 'registrar']);
    $group->get('/mascotas', [$mascotaController, 'listar']);
    $group->delete('/mascotas/{id}', [$mascotaController, 'eliminar']); // ✅ Nueva ruta eliminar mascota

    // 📅 Turnos
    $group->get('/turnos/disponibles', [$turnoController, 'verDisponibles']);
    $group->post('/turnos', [$turnoController, 'solicitar']);
    $group->get('/turnos/mis-turnos', [$turnoController, 'verMisTurnos']);
    $group->put('/turnos/{id}', [$turnoController, 'cancelar']);
    $group->post('/turnos-disponibles/fecha', [$disponibilidadController, 'verPorFecha']);
})->add([AuthMiddleware::class, 'verificar']);

// Rutas de administrador
$app->group('/api/admin', function (RouteCollectorProxy $group) use ($userController, $mascotaController, $turnoController, $disponibilidadController) {
    $group->post('/registro', [$userController, 'registrarAdmin']);
    $group->get('/usuarios', [$userController, 'listarUsuarios']);
    $group->get('/mascotas', [$mascotaController, 'listarTodas']);
    $group->get('/turnos', [$turnoController, 'listarTodos']);
    $group->post('/turnos-disponibles/generar', [$disponibilidadController, 'generar']);
    $group->put('/turnos-disponibles/desactivar-dia', [$disponibilidadController, 'desactivarDia']);
    $group->patch('/turnos/{id}', [$turnoController, 'cambiarEstado']);
})->add([AuthMiddleware::class, 'soloAdmin'])->add([AuthMiddleware::class, 'verificar']);

// Ping (para probar API)
$app->get('/ping', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['pong' => true]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Servir archivos
$app->get('/{file}', function ($request, $response, $args) {
    $file = __DIR__ . '/' . $args['file'];
    if (file_exists($file)) {
        $response->getBody()->write(file_get_contents($file));
        return $response->withHeader('Content-Type', 'text/html');
    }
    return $response->withStatus(404);
});

$app->run();




