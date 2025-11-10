<?php
namespace App\Middlewares;
// Importa las dependencias necesarias
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Psr7\Response as SlimResponse;
use AuthJWT;

// Middleware para manejar la autenticación de usuarios
// y verificar roles de administrador
class AuthMiddleware {
    // Middleware para cualquier usuario autenticado (usuario o admin)
    public static function verificar(Request $request, RequestHandlerInterface $handler): Response {
        try {
            $user = AuthJWT::obtenerUsuario($request);
        } catch (\Exception $e) {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        // Agrega el usuario al request (accesible en controladores)
        $request = $request->withAttribute('user', $user);

        return $handler->handle($request);
    }

    // Middleware solo para admin
    public static function soloAdmin(Request $request, RequestHandlerInterface $handler): Response {
        // Busca el user agregado por el middleware verificar
        $user = $request->getAttribute('user');
        if (!$user || $user['tipo'] !== 'admin') {
            $response = new SlimResponse();
            $response->getBody()->write(json_encode(['error' => 'Acceso solo para administradores']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }

        return $handler->handle($request);
    }
}



