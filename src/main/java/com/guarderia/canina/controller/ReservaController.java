package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Reserva;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.ReservaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente-reservas")
public class ReservaController {

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;

    public ReservaController(ReservaRepository reservaRepository,
                             MascotaRepository mascotaRepository) {
        this.reservaRepository = reservaRepository;
        this.mascotaRepository = mascotaRepository;
    }

    @PostMapping("/mascota/{mascotaId}")
    public Reserva crearReserva(@PathVariable Long mascotaId, @RequestBody Reserva reserva) {
        Mascota mascota = mascotaRepository.findById(mascotaId)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        if (reserva.getFechaInicio() == null || reserva.getFechaFin() == null) {
            throw new RuntimeException("Las fechas son obligatorias");
        }

        if (reserva.getFechaInicio().isAfter(reserva.getFechaFin())) {
            throw new RuntimeException("La fecha de inicio no puede ser posterior a la fecha de fin");
        }

        List<Reserva> solapadas = reservaRepository.buscarReservasSolapadas(
                mascotaId,
                reserva.getFechaInicio(),
                reserva.getFechaFin()
        );

        if (!solapadas.isEmpty()) {
            throw new RuntimeException("Ya existe una reserva para esa mascota en esas fechas");
        }

        reserva.setMascota(mascota);
        return reservaRepository.save(reserva);
    }

    @GetMapping
    public List<Reserva> listarReservas() {
        return reservaRepository.findAll();
    }

    @GetMapping("/mascota/{mascotaId}")
    public List<Reserva> reservasPorMascota(@PathVariable Long mascotaId) {
        return reservaRepository.findByMascotaId(mascotaId);
    }

    @GetMapping("/{id}")
    public Reserva obtenerReservaPorId(@PathVariable Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    }

    @DeleteMapping("/{id}")
    public void eliminarReserva(@PathVariable Long id) {
        reservaRepository.deleteById(id);
    }
}