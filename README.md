# Proyecto Final DAM – Guardería Canina

## 🐶 Descripción

Aplicación web desarrollada como proyecto final del ciclo DAM para la gestión de una guardería canina.
Permite registrar usuarios, gestionar mascotas y realizar reservas desde una interfaz web sencilla.

## ⚙️ Funcionalidades

* Gestión de usuarios
* Gestión de mascotas
* Creación y consulta de reservas
* Relación entre usuarios, mascotas y reservas
* Panel de administración (en desarrollo)

## 🛠️ Tecnologías

* Java
* Spring Boot
* JPA / Hibernate
* MySQL
* HTML
* CSS
* JavaScript

## 🚀 Cómo ejecutar el proyecto

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

Desde IntelliJ → Run

### 4. Abrir frontend

Abrir `index.html` en el navegador

## 📁 Estructura

* backend → aplicación Spring Boot
* frontend → HTML, CSS y JS
* docs → documentación y capturas

## 📸 Capturas

(Se añadirán capturas de la aplicación)

## 👤 Autor

José Luis Vázquez Matas

## 📌 Estado

Versión entregable para evaluación del Proyecto Final DAM
