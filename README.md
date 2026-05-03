# 🐶 Proyecto Final DAM - Guardería Canina

Aplicación web desarrollada como proyecto final del ciclo **Desarrollo de Aplicaciones Multiplataforma (DAM)**.

Permite la gestión completa de una guardería canina: usuarios, mascotas y reservas.

---

## 📌 Descripción

La aplicación simula el funcionamiento de una guardería canina real situada en Navalcarnero, donde los clientes pueden:

- Registrarse en la plataforma
- Añadir sus mascotas
- Crear y gestionar reservas
- Consultar el estado de sus estancias

Además, dispone de un panel de administración para la gestión global del sistema.

---

## 🚀 Tecnologías utilizadas

### Backend
- Java 21
- Spring Boot
- Spring Data JPA (Hibernate)
- MySQL

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)

### Herramientas
- IntelliJ IDEA
- MySQL Workbench
- GitHub

---

## 🧱 Estructura del proyecto
src/
├── main/
│ ├── java/com/guarderia/canina/
│ │ ├── controller/
│ │ ├── model/
│ │ ├── repository/
│ │ └── config/
│ └── resources/
│ ├── static/
│ │ ├── css/
│ │ ├── js/
│ │ ├── cliente.html
│ │ ├── admin.html
│ │ └── index.html
│ └── application.properties


---

## ⚙️ Configuración y ejecución

### 1️⃣ Crear base de datos

```sql
CREATE DATABASE guarderia_canina;

2️⃣ **Configurar conexión**

En application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/guarderia_canina
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8081

3️⃣ **Ejecutar aplicación**

Desde IntelliJ:

Ejecutar la clase principal (GuarderiaCaninaApplication)
Abrir navegador en:

👉 http://localhost:8081

👤 **Funcionalidades principales**

Cliente
Registro y login
Gestión de perfil
CRUD de mascotas
Creación de reservas
Consulta de estado de reservas
Cálculo automático de precios
Administrador
Visualización de usuarios
Gestión de reservas
Control global del sistema

🔐 **Autenticación**

El sistema utiliza sesiones mediante HttpSession, permitiendo:

Login persistente
Protección básica de rutas
Diferenciación de roles (CLIENTE / ADMIN)

🔄** Actualización de datos**

La aplicación implementa actualización dinámica mediante JavaScript, lo que permite:

Refrescar datos automáticamente tras operaciones CRUD
Evitar recargas completas de página
Sincronización continua con el backend

🗃️ **Modelo de datos**
**Entidades principales:**
Usuario
Mascota
Reserva

**Relaciones:**
Un usuario → varias mascotas
Una mascota → varias reservas

🧪 **Estado del proyecto**

✔ Backend completo
✔ Frontend funcional
✔ CRUD completo
✔ Autenticación básica
✔ Panel administrador
✔ Diseño responsive
✔ Validaciones básicas

📅 **Planificación**

El proyecto se ha desarrollado entre el 28 de febrero y el 3 de mayo del 2026, siguiendo una planificación estructurada por fases:

Análisis
Diseño
Desarrollo backend
Desarrollo frontend
Integración
Testing
Documentación

📸 Capturas

landing
<img width="1366" height="2349" alt="Captura Landing" src="https://github.com/user-attachments/assets/b020c089-e8d9-4858-99a1-bd3fd3e1e890" />

login

<img width="1366" height="663" alt="Captura Login" src="https://github.com/user-attachments/assets/d2a502f2-efe2-4abb-9256-e99b7c5b94ce" />

Cliente (perfil usuario y registro de mascotas)
<img width="1034" height="409" alt="image" src="https://github.com/user-attachments/assets/a122f9e0-f94e-42f5-ab82-510323517c24" />

<img width="1034" height="409" alt="image" src="https://github.com/user-attachments/assets/3f2aea06-92b1-4d9c-982d-53ef5de8da03" />

Cliente (reserva)

<img width="1034" height="608" alt="image" src="https://github.com/user-attachments/assets/ce304d77-3689-4c90-b2c0-0690b4b4e7ca" />

Cliente (reserva_bis)

<img width="1034" height="614" alt="image" src="https://github.com/user-attachments/assets/9cd93550-f13b-44e9-914f-b4d6e6c98dfa" />

admin (página usuario gestor de reservas)

<img width="1366" height="1863" alt="Captura página_admin" src="https://github.com/user-attachments/assets/0357f695-63ea-4ae5-ad85-4bbcbbd34991" />

Admin (usuario gestor de reservas)

<img width="982" height="1339" alt="image" src="https://github.com/user-attachments/assets/abe86612-96f0-47d8-bb68-6a967ef97ba1" />


El usuario administrador dispone de unas tarjetas resumen, donde se indica: 
-	Nº de usuarios registrados
-	Nº de mascotas registradas
-	Nº de Reservas 
-	Nº de reservas pendientes de confirmar

Dichas tarjetas son clicables y llevan a apartado correspondiente,

 <img width="944" height="173" alt="image" src="https://github.com/user-attachments/assets/2c736c70-1a00-47c6-ba71-002ee1011c4e" />


Tanto los usuarios, mascotas disponen de un campo filtro para una búsqueda rápida y concisa

Filtro por nombre de usuario.
 <img width="1034" height="158" alt="image" src="https://github.com/user-attachments/assets/fc1cc0b8-8b15-4b93-8fd5-a6c2916f6f59" />


Filtro por nombre de mascota 
<img width="1034" height="158" alt="image" src="https://github.com/user-attachments/assets/4c1a4e28-d458-4813-b2b8-35e5fe330c9d" />

En las reservas existen dos tipos de filtros, pueden así filtrar por:

-	Nombre de la mascota 
-	Tipo de estancia
-	Tipo de estado de la reserva (pendiente, confirmada, cancelada, finalizada)

Filtro por tipo de estado
<img width="1034" height="333" alt="image" src="https://github.com/user-attachments/assets/c23a7099-173e-4da6-b21c-cecab7680b06" /> 

Filtro por estados de reserva
 <img width="1034" height="181" alt="image" src="https://github.com/user-attachments/assets/b0cef026-ba02-475b-8074-ae1ec5feab81" />
 
<img width="1034" height="347" alt="image" src="https://github.com/user-attachments/assets/2b86b022-3560-4768-8aed-d0466ecbeb82" />

Confirmación de Reserva

El administrador se encargará de confirmar las reservas de los usuarios-clientes-mascotas, una vez que según procedimientos de empresa se compruebe que está todo correcto, pago, confirmar disponibilidad o consulta en casos específicos, como alergias, cuidados especiales, etc…

<img width="625" height="415" alt="image" src="https://github.com/user-attachments/assets/af4cd6fb-2647-4475-a27d-79fd98aad4c5" />

 Una vez confirmada cambia el estado a “CONFIRMADA”
<img width="1034" height="105" alt="image" src="https://github.com/user-attachments/assets/b39f6657-a999-447f-873f-f4a5b1a09d76" />  

El Cliente será notificado por correo y wasap de la confirmación de su reserva.
Así mismo en el panel de clientes el usuario podrá ver el estado de su reserva actualizado.
Confirmado.

 <img width="508" height="506" alt="image" src="https://github.com/user-attachments/assets/94cc80d4-c12c-47db-8a18-4793ec8a3172" />

Nota: 

Actualización dinámica, recarga automática tras operaciones CRUD y sincronización con backend.
El panel cliente y el panel administrador incorporan actualización dinámica de datos mediante JavaScript y llamadas fetch a la API REST. Tras crear, modificar o eliminar registros, las listas se recargan automáticamente para mostrar la información actualizada sin necesidad de recargar toda la página.

Además, existen botones de actualización manual en secciones clave como mascotas, reservas y resumen, lo que permite sincronizar los datos visibles con la base de datos y reducir errores por información desactualizada.


📦 Entrega

El proyecto incluye:

Código fuente completo
README
Memoria del proyecto
Capturas
Base de datos (configurable)

José Luis Vázquez Matas

Proyecto final DAM – 2026
