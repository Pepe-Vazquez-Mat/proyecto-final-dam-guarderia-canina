# 🐶 Sistema de Gestión para Guardería Canina

Aplicación web full stack desarrollada como **Proyecto Final del Grado Superior en Desarrollo de Aplicaciones Multiplataforma (DAM)**.

El proyecto implementa un sistema completo para gestionar una guardería canina: **usuarios, mascotas, reservas, autenticación, área privada de cliente y panel de administración**.

> Proyecto desarrollado entre febrero y mayo de 2026.

---

## 🚀 Tecnologías

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- REST API
- MySQL

### Frontend
- HTML5
- CSS3
- JavaScript
- Fetch API

### Herramientas
- IntelliJ IDEA
- MySQL Workbench
- Git
- GitHub

---

## ✨ Funcionalidades principales

### 👤 Área de cliente

- Registro e inicio de sesión
- Gestión del perfil
- CRUD de mascotas
- Creación y gestión de reservas
- Consulta del estado de las reservas
- Cálculo automático de precios
- Actualización dinámica de información

### 🛠️ Panel de administración

- Gestión de usuarios
- Gestión de mascotas
- Gestión y confirmación de reservas
- Cambio de estados:
  - `PENDIENTE`
  - `CONFIRMADA`
  - `CANCELADA`
  - `FINALIZADA`
- Tarjetas resumen con indicadores del sistema
- Filtros de búsqueda para usuarios, mascotas y reservas
- Actualización dinámica de datos

---

## 🧠 Reglas de negocio

La lógica de negocio se gestiona desde el backend e incluye, entre otras:

- Validación de fechas de entrada y salida
- Control de solapamiento de reservas por mascota
- Cálculo del precio de la estancia
- Gestión del estado de las reservas
- Control de acceso según el rol del usuario

---

## 🔐 Seguridad y autenticación

La aplicación utiliza **Spring Security** y autenticación basada en sesión.

El sistema diferencia dos perfiles:

- `CLIENTE`
- `ADMIN`

Los clientes acceden únicamente a sus mascotas y reservas, mientras que el administrador dispone de acceso al panel de gestión.

---

## 🔄 Comunicación Frontend - Backend

El frontend utiliza JavaScript y `fetch()` para comunicarse con la API REST.

Después de operaciones CRUD, las vistas actualizan los datos automáticamente sin necesidad de recargar completamente la página.

También existen controles de actualización manual en determinadas secciones para sincronizar la información mostrada con el backend.

---

## 🗃️ Modelo de datos

### Entidades principales

**Usuario**

Un usuario puede registrar varias mascotas.

**Mascota**

Cada mascota pertenece a un usuario y puede tener múltiples reservas.

**Reserva**

Representa una estancia asociada a una mascota.

### Relaciones

```text
Usuario
   │
   └── 1:N ── Mascota
                  │
                  └── 1:N ── Reserva
```

---

## 🧱 Arquitectura del proyecto

```text
src/
└── main/
    ├── java/
    │   └── com/guarderia/canina/
    │       ├── controller/
    │       ├── model/
    │       ├── repository/
    │       └── config/
    │
    └── resources/
        ├── static/
        │   ├── css/
        │   ├── js/
        │   ├── index.html
        │   ├── cliente.html
        │   └── admin.html
        │
        └── application.properties
```

---

# ⚙️ Instalación y ejecución

## 1. Requisitos

Para ejecutar el proyecto es necesario disponer de:

- Java 21
- MySQL
- Maven

---

## 2. Crear la base de datos

```sql
CREATE DATABASE guarderia_canina;
```

---

## 3. Configurar la conexión

La aplicación permite utilizar variables de entorno para evitar almacenar credenciales en el repositorio.

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/guarderia_canina}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}

spring.jpa.hibernate.ddl-auto=update

server.port=8081
```

Configura `DB_USERNAME` y `DB_PASSWORD` con las credenciales correspondientes a tu instalación de MySQL.

---

## 4. Ejecutar la aplicación

Desde IntelliJ IDEA puede ejecutarse la clase principal:

```text
GuarderiaCaninaApplication
```

Después, acceder desde el navegador a:

```text
http://localhost:8081
```

---

# 📸 Capturas de la aplicación

## Landing

<img width="1366" alt="Landing" src="https://github.com/user-attachments/assets/b020c089-e8d9-4858-99a1-bd3fd3e1e890" />

---

## Login

<img width="1366" alt="Login" src="https://github.com/user-attachments/assets/d2a502f2-efe2-4abb-9256-e99b7c5b94ce" />

---

## 👤 Área de cliente

### Perfil y gestión de mascotas

<img width="1034" alt="Perfil cliente" src="https://github.com/user-attachments/assets/a122f9e0-f94e-42f5-ab82-510323517c24" />

<img width="1034" alt="Gestión mascotas" src="https://github.com/user-attachments/assets/3f2aea06-92b1-4d9c-982d-53ef5de8da03" />

### Gestión de reservas

<img width="1034" alt="Reserva cliente" src="https://github.com/user-attachments/assets/ce304d77-3689-4c90-b2c0-0690b4b4e7ca" />

<img width="1034" alt="Reserva cliente" src="https://github.com/user-attachments/assets/9cd93550-f13b-44e9-914f-b4d6e6c98dfa" />

---

## 🛠️ Panel de administración

<img width="1366" alt="Panel administración" src="https://github.com/user-attachments/assets/0357f695-63ea-4ae5-ad85-4bbcbbd34991" />

<img width="982" alt="Gestión administración" src="https://github.com/user-attachments/assets/abe86612-96f0-47d8-bb68-6a967ef97ba1" />

### Dashboard

El panel muestra indicadores de:

- Usuarios registrados
- Mascotas registradas
- Reservas
- Reservas pendientes de confirmar

Las tarjetas permiten acceder directamente a cada área de gestión.

<img width="944" alt="Dashboard administrador" src="https://github.com/user-attachments/assets/2c736c70-1a00-47c6-ba71-002ee1011c4e" />

---

## 🔎 Filtros y búsqueda

### Usuarios

<img width="1034" alt="Filtro usuarios" src="https://github.com/user-attachments/assets/fc1cc0b8-8b15-4b93-8fd5-a6c2916f6f59" />

### Mascotas

<img width="1034" alt="Filtro mascotas" src="https://github.com/user-attachments/assets/4c1a4e28-d458-4813-b2b8-35e5fe330c9d" />

### Reservas

Las reservas pueden filtrarse por:

- Nombre de mascota
- Tipo de estancia
- Estado de la reserva

<img width="1034" alt="Filtro reservas" src="https://github.com/user-attachments/assets/c23a7099-173e-4da6-b21c-cecab7680b06" />

<img width="1034" alt="Estados reservas" src="https://github.com/user-attachments/assets/b0cef026-ba02-475b-8074-ae1ec5feab81" />

---

## ✅ Confirmación de reservas

Las reservas se crean inicialmente con estado `PENDIENTE`.

Desde el panel de administración pueden revisarse y posteriormente cambiar su estado a `CONFIRMADA`.

<img width="625" alt="Confirmación reserva" src="https://github.com/user-attachments/assets/af4cd6fb-2647-4475-a27d-79fd98aad4c5" />

Una vez confirmada:

<img width="1034" alt="Reserva confirmada" src="https://github.com/user-attachments/assets/b39f6657-a999-447f-873f-f4a5b1a09d76" />

El cliente puede consultar el estado actualizado desde su panel:

<img width="508" alt="Estado reserva cliente" src="https://github.com/user-attachments/assets/94cc80d4-c12c-47db-8a18-4793ec8a3172" />

---

## 🧪 Estado del proyecto

- ✅ Backend funcional
- ✅ Frontend funcional
- ✅ API REST
- ✅ CRUD de usuarios, mascotas y reservas
- ✅ Autenticación mediante Spring Security
- ✅ Roles CLIENTE / ADMIN
- ✅ Validaciones de negocio
- ✅ Cálculo de precios
- ✅ Panel de administración
- ✅ Actualización dinámica mediante JavaScript
- ✅ Diseño responsive

---

## 📚 Contexto académico

Proyecto desarrollado como trabajo final del ciclo:

**Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (DAM)**

Desarrollado entre:

**28 de febrero de 2026 - 3 de mayo de 2026**

El proyecto incluye código fuente, documentación técnica, memoria y capturas de funcionamiento.

---

## 👨‍💻 Autor

**José Luis Vázquez Matas**

Proyecto Final DAM · 2026
