package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.UsuarioRepository;
import com.guarderia.canina.security.SecurityUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cliente-mascotas")
public class ClienteMascotaController {

    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;

    public ClienteMascotaController(MascotaRepository mascotaRepository,
                                    UsuarioRepository usuarioRepository) {
        this.mascotaRepository = mascotaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<?> listarMisMascotas(Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        List<Mascota> mascotas = mascotaRepository.findByUsuarioId(usuario.getId());
        return ResponseEntity.ok(mascotas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerMiMascota(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        return mascotaRepository.findByIdAndUsuarioId(id, usuario.getId())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No puedes acceder a una mascota que no es tuya")));
    }

    @PostMapping
    public ResponseEntity<?> crearMascota(@RequestBody Mascota mascota, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        if (mascota.getNombre() == null || mascota.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El nombre de la mascota es obligatorio"));
        }

        mascota.setId(null);
        mascota.setUsuario(usuario);
        mascota.setReservas(null);

        Mascota guardada = mascotaRepository.save(mascota);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarMascota(@PathVariable Long id,
                                               @RequestBody Mascota datosMascota,
                                               Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        Mascota mascotaExistente = mascotaRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElse(null);

        if (mascotaExistente == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "No puedes modificar una mascota que no es tuya"));
        }

        if (datosMascota.getNombre() == null || datosMascota.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El nombre de la mascota es obligatorio"));
        }

        mascotaExistente.setNombre(datosMascota.getNombre());
        mascotaExistente.setRaza(datosMascota.getRaza());
        mascotaExistente.setPesoKg(datosMascota.getPesoKg());
        mascotaExistente.setEdadAnios(datosMascota.getEdadAnios());
        mascotaExistente.setObservaciones(datosMascota.getObservaciones());

        Mascota actualizada = mascotaRepository.save(mascotaExistente);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMascota(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        Mascota mascota = mascotaRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElse(null);

        if (mascota == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "No puedes eliminar una mascota que no es tuya"));
        }

        mascotaRepository.delete(mascota);
        return ResponseEntity.ok(Map.of("mensaje", "Mascota eliminada correctamente"));
    }

    private Usuario obtenerUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUser securityUser)) {
            throw new RuntimeException("Usuario no autenticado");
        }

        Long usuarioId = securityUser.getUsuario().getId();

        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado en base de datos"));
    }
}