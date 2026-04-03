package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente-mascotas")
@CrossOrigin(origins = "*")
public class MascotaController {

    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;

    public MascotaController(MascotaRepository mascotaRepository,
                             UsuarioRepository usuarioRepository) {
        this.mascotaRepository = mascotaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Mascota>> obtenerMascotasPorUsuario(@PathVariable Long usuarioId) {
        List<Mascota> mascotas = mascotaRepository.findByUsuarioId(usuarioId);
        return ResponseEntity.ok(mascotas);
    }

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> crearMascota(@PathVariable Long usuarioId, @RequestBody Mascota mascota) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        mascota.setId(null);
        mascota.setUsuario(usuario);

        Mascota nuevaMascota = mascotaRepository.save(mascota);
        return ResponseEntity.ok(nuevaMascota);
    }

    @PutMapping("/{mascotaId}")
    public ResponseEntity<?> actualizarMascota(@PathVariable Long mascotaId, @RequestBody Mascota datosActualizados) {
        Mascota mascota = mascotaRepository.findById(mascotaId)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        mascota.setNombre(datosActualizados.getNombre());
        mascota.setRaza(datosActualizados.getRaza());
        mascota.setPesoKg(datosActualizados.getPesoKg());
        mascota.setEdadAnios(datosActualizados.getEdadAnios());
        mascota.setObservaciones(datosActualizados.getObservaciones());

        Mascota mascotaActualizada = mascotaRepository.save(mascota);
        return ResponseEntity.ok(mascotaActualizada);
    }

    @DeleteMapping("/{mascotaId}")
    public ResponseEntity<?> eliminarMascota(@PathVariable Long mascotaId) {
        Mascota mascota = mascotaRepository.findById(mascotaId)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        if (mascota.getReservas() != null && !mascota.getReservas().isEmpty()) {
            return ResponseEntity.badRequest().body("No se puede eliminar la mascota porque tiene reservas asociadas.");
        }

        mascotaRepository.delete(mascota);
        return ResponseEntity.ok("Mascota eliminada correctamente.");
    }
}