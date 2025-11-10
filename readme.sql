CREATE DATABASE veterinaria;
USE veterinaria;
CREATE TABLE IF NOT EXISTS usuarios (
id INT AUTO_INCREMENT PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
tipo ENUM('admin', 'usuario') DEFAULT 'usuario',
fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS mascotas (
id INT AUTO_INCREMENT PRIMARY KEY,
id_usuario INT NOT NULL,
nombre VARCHAR(100) NOT NULL,
especie VARCHAR(50),
edad INT,
fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);
CREATE TABLE IF NOT EXISTS turnos_disponibles (
id INT AUTO_INCREMENT PRIMARY KEY,
fecha DATE NOT NULL,
hora TIME NOT NULL,
habilitado BOOLEAN DEFAULT TRUE,
disponible BOOLEAN DEFAULT FALSE,
UNIQUE (fecha, hora)
);
CREATE TABLE IF NOT EXISTS turnos (
id INT AUTO_INCREMENT PRIMARY KEY,
id_usuario INT NOT NULL,
id_mascota INT NOT NULL,
id_turno_disponible INT NOT NULL,
estado ENUM('pendiente', 'asistido', 'ausente', 'cancelado') DEFAULT 'pendiente',
costo DECIMAL(8,2),
descripcion TEXT,
fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
FOREIGN KEY (id_mascota) REFERENCES mascotas(id),
FOREIGN KEY (id_turno_disponible) REFERENCES turnos_disponibles(id)
);


 