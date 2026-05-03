package com.guarderia.canina.controller;

import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre es obligatorio");
        }

        if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El email es obligatorio");
        }

        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La contraseña es obligatoria");
        }

        Optional<Usuario> existente = usuarioRepository.findByEmail(usuario.getEmail());

        if (existente.isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe un usuario con ese email");
        }

        usuario.setEmail(usuario.getEmail().trim().toLowerCase());
        usuario.setNombre(usuario.getNombre().trim());

        if (usuario.getApellidos() != null) {
            usuario.setApellidos(usuario.getApellidos().trim());
        }

        if (usuario.getTelefono() != null) {
            usuario.setTelefono(usuario.getTelefono().trim());
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        if (usuario.getRol() == null || usuario.getRol().trim().isEmpty()) {
            usuario.setRol("CLIENTE");
        }

        Usuario guardado = usuarioRepository.save(usuario);

        return ResponseEntity.ok(crearRespuestaUsuario(guardado, "Usuario registrado correctamente"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> datos, HttpSession session) {
        String email = datos.get("email");
        String password = datos.get("password");

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email y contraseña son obligatorios");
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email.trim().toLowerCase());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
        }

        Usuario usuario = usuarioOpt.get();

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
        }

        session.setAttribute("usuarioLogueado", usuario);

        return ResponseEntity.ok(crearRespuestaUsuario(usuario, "Login correcto"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {
        Usuario usuarioSesion = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioSesion == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No hay usuario autenticado");
        }

        Usuario usuarioActualizado = usuarioRepository.findById(usuarioSesion.getId()).orElse(null);

        if (usuarioActualizado == null) {
            session.invalidate();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
        }

        session.setAttribute("usuarioLogueado", usuarioActualizado);

        return ResponseEntity.ok(crearRespuestaUsuario(usuarioActualizado, null));
    }

    @PutMapping("/me")
    public ResponseEntity<?> actualizarPerfil(@RequestBody Usuario datosUsuario, HttpSession session) {
        Usuario usuarioSesion = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioSesion == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No hay usuario autenticado");
        }

        Usuario usuario = usuarioRepository.findById(usuarioSesion.getId()).orElse(null);

        if (usuario == null) {
            session.invalidate();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
        }

        if (datosUsuario.getNombre() == null || datosUsuario.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre es obligatorio");
        }

        usuario.setNombre(datosUsuario.getNombre().trim());

        if (datosUsuario.getApellidos() != null) {
            usuario.setApellidos(datosUsuario.getApellidos().trim());
        } else {
            usuario.setApellidos(null);
        }

        if (datosUsuario.getTelefono() != null) {
            usuario.setTelefono(datosUsuario.getTelefono().trim());
        } else {
            usuario.setTelefono(null);
        }

        Usuario actualizado = usuarioRepository.save(usuario);

        session.setAttribute("usuarioLogueado", actualizado);

        return ResponseEntity.ok(crearRespuestaUsuario(actualizado, "Perfil actualizado correctamente"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logout correcto");
    }

    private Map<String, Object> crearRespuestaUsuario(Usuario usuario, String mensaje) {
        Map<String, Object> respuesta = new HashMap<>();

        if (mensaje != null) {
            respuesta.put("mensaje", mensaje);
        }

        respuesta.put("id", usuario.getId());
        respuesta.put("nombre", usuario.getNombre());
        respuesta.put("apellidos", usuario.getApellidos());
        respuesta.put("email", usuario.getEmail());
        respuesta.put("telefono", usuario.getTelefono());
        respuesta.put("rol", usuario.getRol());

        return respuesta;
    }
}