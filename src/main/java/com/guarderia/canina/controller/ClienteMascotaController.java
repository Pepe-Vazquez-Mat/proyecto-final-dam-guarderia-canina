package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<?> listarMascotasDelCliente(HttpSession session) {
        Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioLogueado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        List<Mascota> mascotas = mascotaRepository.findByUsuarioId(usuarioLogueado.getId());
        return ResponseEntity.ok(mascotas);
    }

    @PostMapping
    public ResponseEntity<?> crearMascota(@RequestBody Mascota mascota, HttpSession session) {
        Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioLogueado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        if (mascota.getNombre() == null || mascota.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre de la mascota es obligatorio");
        }

        Usuario usuario = usuarioRepository.findById(usuarioLogueado.getId()).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
        }

        mascota.setUsuario(usuario);
        Mascota guardada = mascotaRepository.save(mascota);

        return ResponseEntity.ok(guardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarMascota(@PathVariable Long id,
                                           @RequestBody Mascota datosMascota,
                                           HttpSession session) {
        Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioLogueado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        Mascota mascota = mascotaRepository.findById(id).orElse(null);

        if (mascota == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Mascota no encontrada");
        }

        if (mascota.getUsuario() == null || !mascota.getUsuario().getId().equals(usuarioLogueado.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No puedes editar esta mascota");
        }

        if (datosMascota.getNombre() == null || datosMascota.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre de la mascota es obligatorio");
        }

        mascota.setNombre(datosMascota.getNombre());
        mascota.setRaza(datosMascota.getRaza());
        mascota.setPesoKg(datosMascota.getPesoKg());
        mascota.setEdadAnios(datosMascota.getEdadAnios());
        mascota.setObservaciones(datosMascota.getObservaciones());

        Mascota actualizada = mascotaRepository.save(mascota);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMascota(@PathVariable Long id, HttpSession session) {
        Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioLogueado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        Mascota mascota = mascotaRepository.findById(id).orElse(null);

        if (mascota == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Mascota no encontrada");
        }

        if (mascota.getUsuario() == null || !mascota.getUsuario().getId().equals(usuarioLogueado.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No puedes eliminar esta mascota");
        }

        mascotaRepository.delete(mascota);
        return ResponseEntity.ok("Mascota eliminada correctamente");
    }
}