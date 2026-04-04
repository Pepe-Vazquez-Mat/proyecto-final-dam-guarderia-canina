package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Reserva;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.ReservaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;

    public ReservaController(ReservaRepository reservaRepository,
                             MascotaRepository mascotaRepository) {
        this.reservaRepository = reservaRepository;
        this.mascotaRepository = mascotaRepository;
    }

    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<List<Reserva>> obtenerReservasPorMascota(@PathVariable Long mascotaId) {
        List<Reserva> reservas = reservaRepository.findByMascotaId(mascotaId);
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Reserva>> obtenerReservasPorUsuario(@PathVariable Long usuarioId) {
        List<Reserva> reservas = reservaRepository.findByMascotaUsuarioId(usuarioId);
        return ResponseEntity.ok(reservas);
    }

    @PostMapping("/mascota/{mascotaId}")
    public ResponseEntity<?> crearReserva(@PathVariable Long mascotaId, @RequestBody Reserva reserva) {
        Mascota mascota = mascotaRepository.findById(mascotaId)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        reserva.setId(null);
        reserva.setMascota(mascota);

        if (reserva.getEstadoReserva() == null || reserva.getEstadoReserva().isBlank()) {
            reserva.setEstadoReserva("PENDIENTE");
        }

        Reserva nuevaReserva = reservaRepository.save(reserva);
        return ResponseEntity.ok(nuevaReserva);
    }

    @DeleteMapping("/{reservaId}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        reservaRepository.delete(reserva);
        return ResponseEntity.ok("Reserva eliminada correctamente.");
    }
}