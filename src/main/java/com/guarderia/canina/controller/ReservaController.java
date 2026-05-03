package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Reserva;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.ReservaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;

    public ReservaController(ReservaRepository reservaRepository,
                             MascotaRepository mascotaRepository) {
        this.reservaRepository = reservaRepository;
        this.mascotaRepository = mascotaRepository;
    }

    @GetMapping
    public ResponseEntity<List<Reserva>> obtenerTodasLasReservas() {
        List<Reserva> reservas = reservaRepository.findAll();
        return ResponseEntity.ok(reservas);
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

        validarReserva(reserva);
        normalizarExtras(reserva);

        reserva.setId(null);
        reserva.setMascota(mascota);
        reserva.setEstadoReserva("PENDIENTE");
        reserva.setPrecioTotal(calcularPrecioTotal(reserva));

        Reserva nuevaReserva = reservaRepository.save(reserva);
        return ResponseEntity.ok(nuevaReserva);
    }

    @PutMapping("/{reservaId}")
    public ResponseEntity<?> actualizarReserva(@PathVariable Long reservaId, @RequestBody Reserva datosActualizados) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        validarReserva(datosActualizados);
        normalizarExtras(datosActualizados);

        reserva.setFechaEntrada(datosActualizados.getFechaEntrada());
        reserva.setFechaSalida(datosActualizados.getFechaSalida());
        reserva.setTipoEstancia(datosActualizados.getTipoEstancia());
        reserva.setServicioRecogida(datosActualizados.getServicioRecogida());
        reserva.setServicioPeluqueria(datosActualizados.getServicioPeluqueria());
        reserva.setObservaciones(datosActualizados.getObservaciones());

        if (datosActualizados.getEstadoReserva() == null || datosActualizados.getEstadoReserva().isBlank()) {
            reserva.setEstadoReserva("PENDIENTE");
        } else {
            reserva.setEstadoReserva(datosActualizados.getEstadoReserva());
        }

        reserva.setPrecioTotal(calcularPrecioTotal(reserva));

        Reserva reservaActualizada = reservaRepository.save(reserva);
        return ResponseEntity.ok(reservaActualizada);
    }

    @DeleteMapping("/{reservaId}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        reservaRepository.delete(reserva);
        return ResponseEntity.ok("Reserva eliminada correctamente.");
    }

    private void validarReserva(Reserva reserva) {
        if (reserva.getFechaEntrada() == null || reserva.getFechaSalida() == null) {
            throw new RuntimeException("Las fechas de entrada y salida son obligatorias.");
        }

        if (reserva.getFechaSalida().isBefore(reserva.getFechaEntrada())) {
            throw new RuntimeException("La fecha de salida no puede ser anterior a la fecha de entrada.");
        }

        if (reserva.getTipoEstancia() == null || reserva.getTipoEstancia().isBlank()) {
            throw new RuntimeException("El tipo de estancia es obligatorio.");
        }

        String tipo = reserva.getTipoEstancia().toUpperCase().trim();

        if (tipo.equals("GUARDERIA_DIA") || tipo.equals("GUARDERIA") || tipo.equals("DIA")) {
            reserva.setTipoEstancia("GUARDERIA_DIA");
        } else if (
                tipo.equals("ESTANCIA") ||
                        tipo.equals("LARGA_ESTANCIA") ||
                        tipo.equals("ESTANCIA_LARGA")
        ) {
            reserva.setTipoEstancia("ESTANCIA");
        } else {
            throw new RuntimeException("Tipo de estancia no válido.");
        }
    }

    private void normalizarExtras(Reserva reserva) {
        if (reserva.getServicioRecogida() == null) {
            reserva.setServicioRecogida(false);
        }

        if (reserva.getServicioPeluqueria() == null) {
            reserva.setServicioPeluqueria(false);
        }
    }

    private BigDecimal calcularPrecioTotal(Reserva reserva) {
        long dias = ChronoUnit.DAYS.between(reserva.getFechaEntrada(), reserva.getFechaSalida()) + 1;

        if (dias < 1) {
            dias = 1;
        }

        BigDecimal precioPorDia;

        switch (reserva.getTipoEstancia()) {
            case "GUARDERIA_DIA":
                precioPorDia = BigDecimal.valueOf(18);
                break;
            case "ESTANCIA":
                precioPorDia = BigDecimal.valueOf(25);
                break;
            default:
                throw new RuntimeException("Tipo de estancia no válido.");
        }

        BigDecimal total = precioPorDia.multiply(BigDecimal.valueOf(dias));

        if (Boolean.TRUE.equals(reserva.getServicioRecogida())) {
            total = total.add(BigDecimal.valueOf(10));
        }

        if (Boolean.TRUE.equals(reserva.getServicioPeluqueria())) {
            total = total.add(BigDecimal.valueOf(15));
        }

        return total;
    }
}