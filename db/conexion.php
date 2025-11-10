<?php  
// Clase para manejar la conexión a la base de datos
class Conexion {
    // Atributo estático para almacenar la instancia de PDO
    private static $pdo;

    // Método estático para obtener la instancia de PDO
    // Si no existe, la crea y la configura
    public static function get() {
        if (!self::$pdo) {
            try {
                $dsn = 'mysql:host=localhost;dbname=veterinaria;charset=utf8';
                self::$pdo = new PDO($dsn, 'root', '', [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]);
            } catch (PDOException $e) {
                die(json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]));
            }
        }
        return self::$pdo;
    }
}
?>
