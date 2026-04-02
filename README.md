# 🐶  Proyecto Final DAM – Guardería Canina

## 📖 Descripción

Aplicación web desarrollada como proyecto final del ciclo Desarrollo de Aplicaciones Multiplataforma (DAM).
El sistema permite gestionar de forma eficiente una guardería canina mediante el registro de usuarios, la administración de mascotas y la creación de reservas.

## ⚙️ Funcionalidades

👤 Gestión de usuarios (alta, consulta y eliminación)
🐕 Gestión de mascotas asociadas a usuarios
📅 Creación y consulta de reservas
🔗 Relación entre entidades: Usuario → Mascota → Reserva
🛠️ API REST funcional
🖥️ Interfaz web básica
⚠️ Validación básica de datos
🧪 Control de solapamiento de reservas

## 🛠️ Tecnologías

☕ Java
🚀 Spring Boot
🗄️ JPA / Hibernate
🐬 MySQL
🌐 HTML, CSS, JavaScript
📦 Maven
🐙 Git & GitHub

## 🚀 Puesta en marcha

### 1. Base de datos

Crear base de datos en MySQL:

```sql
CREATE DATABASE guarderia_canina;
```

### 2. Configuración

Editar `application.properties`:

```
spring.datasource.url=jdbc:mysql://localhost:3306/guarderia_canina
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

### 3. Ejecutar backend

Desde IntelliJ:

Run → GuarderiaCaninaApplication

Servidor disponible en:

http://localhost:8080

### 4. Abrir frontend

Abrir `index.html` en el navegador

🔗 Endpoints principales
👤 Usuarios
GET /api/usuarios
POST /api/usuarios
DELETE /api/usuarios/{id}
🐕 Mascotas
GET /api/mascotas
POST /api/mascotas
DELETE /api/mascotas/{id}
📅 Reservas
GET /api/reservas
POST /api/reservas/mascota/{id}

## 📁 Estructura

backend/
 ├── controller
 ├── model
 ├── repository

frontend/
 ├── index.html
 ├── css/
 ├── js/

docs/
 ├── memoria.pdf
 ├── capturas/

