package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cliente-mascotas")
@CrossOrigin(origins = "*")
public class ClienteMascotaController {

    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;

    public ClienteMascotaController(MascotaRepository mascotaRepository,
                                    UsuarioRepository usuarioRepository) {
        this.mascotaRepository = mascotaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> listarMascotasPorUsuario(@PathVariable Long usuarioId) {
        if (!usuarioRepository.existsById(usuarioId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Usuario no encontrado"));
        }

        List<Mascota> mascotas = mascotaRepository.findByUsuarioId(usuarioId);
        return ResponseEntity.ok(mascotas);
    }

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> crearMascota(@PathVariable Long usuarioId, @RequestBody Mascota mascota) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Usuario no encontrado"));
        }

        if (mascota.getNombre() == null || mascota.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El nombre de la mascota es obligatorio"));
        }

        mascota.setNombre(mascota.getNombre().trim());

        if (mascota.getRaza() != null) {
            mascota.setRaza(mascota.getRaza().trim());
        }

        if (mascota.getObservaciones() != null) {
            mascota.setObservaciones(mascota.getObservaciones().trim());
        }

        mascota.setUsuario(usuario);

        Mascota mascotaGuardada = mascotaRepository.save(mascota);
        return ResponseEntity.status(HttpStatus.CREATED).body(mascotaGuardada);
    }
}