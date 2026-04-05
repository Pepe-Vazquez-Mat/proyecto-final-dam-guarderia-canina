package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Reserva;
import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.ReservaRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/cliente-reservas")
public class ClienteReservaController {

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;

    public ClienteReservaController(ReservaRepository reservaRepository,
                                    MascotaRepository mascotaRepository) {
        this.reservaRepository = reservaRepository;
        this.mascotaRepository = mascotaRepository;
    }

    @GetMapping
    public ResponseEntity<?> listarReservasDelCliente(HttpSession session) {
        Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioLogueado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        List<Reserva> reservas = reservaRepository.findByMascotaUsuarioId(usuarioLogueado.getId());
        return ResponseEntity.ok(reservas);
    }

    @PostMapping("/mascota/{mascotaId}")
    public ResponseEntity<?> crearReserva(@PathVariable Long mascotaId,
                                          @RequestBody Reserva reserva,
                                          HttpSession session) {
        Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioLogueado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        Mascota mascota = mascotaRepository.findById(mascotaId).orElse(null);

        if (mascota == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Mascota no encontrada");
        }

        if (mascota.getUsuario() == null || !mascota.getUsuario().getId().equals(usuarioLogueado.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No puedes reservar para esta mascota");
        }

        if (reserva.getFechaEntrada() == null || reserva.getFechaSalida() == null) {
            return ResponseEntity.badRequest().body("Fecha de entrada y salida obligatorias");
        }

        if (reserva.getFechaSalida().isBefore(reserva.getFechaEntrada())) {
            return ResponseEntity.badRequest().body("La fecha de salida no puede ser anterior a la de entrada");
        }

        if (reserva.getTipoEstancia() == null || reserva.getTipoEstancia().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El tipo de estancia es obligatorio");
        }

        if (reserva.getServicioRecogida() == null) {
            reserva.setServicioRecogida(false);
        }

        if (reserva.getServicioPeluqueria() == null) {
            reserva.setServicioPeluqueria(false);
        }

        reserva.setMascota(mascota);
        reserva.setEstadoReserva("PENDIENTE");
        reserva.setPrecioTotal(calcularPrecio(reserva));

        Reserva guardada = reservaRepository.save(reserva);
        return ResponseEntity.ok(guardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editarReserva(@PathVariable Long id,
                                           @RequestBody Reserva datosReserva,
                                           HttpSession session) {
        Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioLogueado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        Reserva reserva = reservaRepository.findById(id).orElse(null);

        if (reserva == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reserva no encontrada");
        }

        if (reserva.getMascota() == null ||
                reserva.getMascota().getUsuario() == null ||
                !reserva.getMascota().getUsuario().getId().equals(usuarioLogueado.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No puedes editar esta reserva");
        }

        if (datosReserva.getFechaEntrada() == null || datosReserva.getFechaSalida() == null) {
            return ResponseEntity.badRequest().body("Fecha de entrada y salida obligatorias");
        }

        if (datosReserva.getFechaSalida().isBefore(datosReserva.getFechaEntrada())) {
            return ResponseEntity.badRequest().body("La fecha de salida no puede ser anterior a la de entrada");
        }

        if (datosReserva.getTipoEstancia() == null || datosReserva.getTipoEstancia().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El tipo de estancia es obligatorio");
        }

        reserva.setFechaEntrada(datosReserva.getFechaEntrada());
        reserva.setFechaSalida(datosReserva.getFechaSalida());
        reserva.setObservaciones(datosReserva.getObservaciones());
        reserva.setTipoEstancia(datosReserva.getTipoEstancia());
        reserva.setServicioRecogida(datosReserva.getServicioRecogida() != null ? datosReserva.getServicioRecogida() : false);
        reserva.setServicioPeluqueria(datosReserva.getServicioPeluqueria() != null ? datosReserva.getServicioPeluqueria() : false);
        reserva.setEstadoReserva("PENDIENTE");
        reserva.setPrecioTotal(calcularPrecio(reserva));

        Reserva actualizada = reservaRepository.save(reserva);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long id, HttpSession session) {
        Usuario usuarioLogueado = (Usuario) session.getAttribute("usuarioLogueado");

        if (usuarioLogueado == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        Reserva reserva = reservaRepository.findById(id).orElse(null);

        if (reserva == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Reserva no encontrada");
        }

        if (reserva.getMascota() == null ||
                reserva.getMascota().getUsuario() == null ||
                !reserva.getMascota().getUsuario().getId().equals(usuarioLogueado.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No puedes eliminar esta reserva");
        }

        reservaRepository.delete(reserva);
        return ResponseEntity.ok("Reserva eliminada correctamente");
    }

    private BigDecimal calcularPrecio(Reserva reserva) {
        long dias = ChronoUnit.DAYS.between(reserva.getFechaEntrada(), reserva.getFechaSalida());

        if (dias <= 0) {
            dias = 1;
        }

        BigDecimal precioPorDia = BigDecimal.valueOf(20.0);
        BigDecimal total = precioPorDia.multiply(BigDecimal.valueOf(dias));

        if ("LARGA_ESTANCIA".equalsIgnoreCase(reserva.getTipoEstancia())) {
            total = total.multiply(BigDecimal.valueOf(0.90));
        }

        if (Boolean.TRUE.equals(reserva.getServicioRecogida())) {
            total = total.add(BigDecimal.valueOf(10.0));
        }

        if (Boolean.TRUE.equals(reserva.getServicioPeluqueria())) {
            total = total.add(BigDecimal.valueOf(15.0));
        }

        return total;
    }
}