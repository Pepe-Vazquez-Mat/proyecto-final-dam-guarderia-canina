package com.guarderia.canina.controller;

import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.UsuarioRepository;
import com.guarderia.canina.security.SecurityUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody RegistroRequest request) {
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre es obligatorio"));
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email es obligatorio"));
        }

        if (request.getPassword() == null || request.getPassword().length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 4 caracteres"));
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un usuario con ese email"));
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellidos(request.getApellidos() != null ? request.getApellidos().trim() : "");
        usuario.setEmail(request.getEmail().trim().toLowerCase());
        usuario.setTelefono(request.getTelefono() != null ? request.getTelefono().trim() : "");
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol("CLIENTE");

        usuarioRepository.save(usuario);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Usuario registrado correctamente");
        respuesta.put("usuarioId", usuario.getId());
        respuesta.put("email", usuario.getEmail());
        respuesta.put("rol", usuario.getRol());

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityUser securityUser = (SecurityUser) authentication.getPrincipal();

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Login correcto");
            respuesta.put("id", securityUser.getUsuario().getId());
            respuesta.put("nombre", securityUser.getUsuario().getNombre());
            respuesta.put("email", securityUser.getUsuario().getEmail());
            respuesta.put("rol", securityUser.getUsuario().getRol());

            return ResponseEntity.ok(respuesta);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Email o contraseña incorrectos"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> usuarioActual(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUser securityUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No autenticado"));
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("id", securityUser.getUsuario().getId());
        respuesta.put("nombre", securityUser.getUsuario().getNombre());
        respuesta.put("apellidos", securityUser.getUsuario().getApellidos());
        respuesta.put("email", securityUser.getUsuario().getEmail());
        respuesta.put("telefono", securityUser.getUsuario().getTelefono());
        respuesta.put("rol", securityUser.getUsuario().getRol());

        return ResponseEntity.ok(respuesta);
    }

    public static class RegistroRequest {
        @NotBlank
        private String nombre;
        private String apellidos;

        @Email
        @NotBlank
        private String email;

        private String telefono;

        @NotBlank
        private String password;

        public String getNombre() {
            return nombre;
        }

        public String getApellidos() {
            return apellidos;
        }

        public String getEmail() {
            return email;
        }

        public String getTelefono() {
            return telefono;
        }

        public String getPassword() {
            return password;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public void setApellidos(String apellidos) {
            this.apellidos = apellidos;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setTelefono(String telefono) {
            this.telefono = telefono;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class LoginRequest {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String password;

        public String getEmail() {
            return email;
        }

        public String getPassword() {
            return password;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}