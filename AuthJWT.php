<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Clase para manejar la autenticación JWT
// Esta clase se encarga de generar y verificar tokens JWT para usuarios
class AuthJWT {
    private static $clave = ''; // Se setea en constructor estático

    // Inicializar la clave al cargar la clase
    public static function init() {
        self::$clave = getenv('JWT_SECRET') ?: 'CLAVE_SECRETA_1234';
    }

    // Generar el token
    public static function generarToken($usuario) {
        $payload = [
            "id" => $usuario['id'],
            "tipo" => $usuario['tipo'],
            "exp" => time() + (60 * 60) // 1 hora
        ];
        return JWT::encode($payload, self::$clave, 'HS256');
    }

    // Verificar y decodificar token
    public static function verificarToken($token) {
        return JWT::decode($token, new Key(self::$clave, 'HS256'));
    }

    // Obtener usuario desde el token del request
    public static function obtenerUsuario($request) {
        $header = $request->getHeaderLine('Authorization');
        if (!$header || !str_starts_with($header, 'Bearer ')) {
            throw new Exception('Token no proporcionado');
        }
        $token = trim(str_replace('Bearer', '', $header));
        try {
            $decoded = self::verificarToken($token);
            return [
                'id' => $decoded->id,
                'tipo' => $decoded->tipo
            ];
        } catch (\Firebase\JWT\ExpiredException $e) {
            throw new Exception('Token expirado');
        } catch (\Exception $e) {
            throw new Exception('Token inválido');
        }
    }
}

// Importante: inicializar la clave al cargar la clase
AuthJWT::init();


