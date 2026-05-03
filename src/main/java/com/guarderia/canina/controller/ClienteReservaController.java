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
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/cliente-reservas")
public class ClienteReservaController {

    private static final int CAPACIDAD_MAXIMA_PERROS = 40;

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

        String error = validarReserva(reserva);
        if (error != null) {
            return ResponseEntity.badRequest().body(error);
        }

        String errorOcupacion = validarOcupacionDisponible(
                reserva.getFechaEntrada(),
                reserva.getFechaSalida(),
                null
        );

        if (errorOcupacion != null) {
            return ResponseEntity.badRequest().body(errorOcupacion);
        }

        normalizarExtras(reserva);

        reserva.setId(null);
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

        String error = validarReserva(datosReserva);
        if (error != null) {
            return ResponseEntity.badRequest().body(error);
        }

        String errorOcupacion = validarOcupacionDisponible(
                datosReserva.getFechaEntrada(),
                datosReserva.getFechaSalida(),
                reserva.getId()
        );

        if (errorOcupacion != null) {
            return ResponseEntity.badRequest().body(errorOcupacion);
        }

        normalizarExtras(datosReserva);

        reserva.setFechaEntrada(datosReserva.getFechaEntrada());
        reserva.setFechaSalida(datosReserva.getFechaSalida());
        reserva.setObservaciones(datosReserva.getObservaciones());
        reserva.setTipoEstancia(datosReserva.getTipoEstancia());
        reserva.setServicioRecogida(datosReserva.getServicioRecogida());
        reserva.setServicioPeluqueria(datosReserva.getServicioPeluqueria());
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

    private String validarReserva(Reserva reserva) {
        if (reserva.getFechaEntrada() == null || reserva.getFechaSalida() == null) {
            return "Fecha de entrada y salida obligatorias";
        }

        if (reserva.getFechaSalida().isBefore(reserva.getFechaEntrada())) {
            return "La fecha de salida no puede ser anterior a la de entrada";
        }

        if (reserva.getTipoEstancia() == null || reserva.getTipoEstancia().trim().isEmpty()) {
            return "El tipo de estancia es obligatorio";
        }

        String tipo = reserva.getTipoEstancia().toUpperCase().trim();

        if (tipo.equals("GUARDERIA_DIA") || tipo.equals("GUARDERIA") || tipo.equals("DIA")) {
            reserva.setTipoEstancia("GUARDERIA_DIA");
            return null;
        }

        if (tipo.equals("ESTANCIA") || tipo.equals("LARGA_ESTANCIA") || tipo.equals("ESTANCIA_LARGA")) {
            reserva.setTipoEstancia("ESTANCIA");
            return null;
        }

        return "Tipo de estancia no válido. Usa GUARDERIA_DIA o ESTANCIA.";
    }

    private String validarOcupacionDisponible(LocalDate fechaEntrada,
                                              LocalDate fechaSalida,
                                              Long reservaIdExcluida) {
        LocalDate fechaActual = fechaEntrada;

        while (!fechaActual.isAfter(fechaSalida)) {
            long reservasActivas;

            if (reservaIdExcluida == null) {
                reservasActivas = reservaRepository.contarReservasOcupandoPlazaEnFecha(fechaActual);
            } else {
                reservasActivas = reservaRepository.contarReservasOcupandoPlazaEnFechaExcluyendoReserva(
                        fechaActual,
                        reservaIdExcluida
                );
            }

            if (reservasActivas >= CAPACIDAD_MAXIMA_PERROS) {
                LocalDate primeraFechaLibre = buscarPrimeraFechaLibre(fechaActual, reservaIdExcluida);

                return "No hay plazas disponibles para el día "
                        + fechaActual
                        + ". La primera fecha libre aproximada es "
                        + primeraFechaLibre
                        + ".";
            }

            fechaActual = fechaActual.plusDays(1);
        }

        return null;
    }

    private LocalDate buscarPrimeraFechaLibre(LocalDate desdeFecha, Long reservaIdExcluida) {
        LocalDate fecha = desdeFecha;

        for (int i = 0; i < 90; i++) {
            long reservasActivas;

            if (reservaIdExcluida == null) {
                reservasActivas = reservaRepository.contarReservasOcupandoPlazaEnFecha(fecha);
            } else {
                reservasActivas = reservaRepository.contarReservasOcupandoPlazaEnFechaExcluyendoReserva(
                        fecha,
                        reservaIdExcluida
                );
            }

            if (reservasActivas < CAPACIDAD_MAXIMA_PERROS) {
                return fecha;
            }

            fecha = fecha.plusDays(1);
        }

        return fecha;
    }

    private void normalizarExtras(Reserva reserva) {
        if (reserva.getServicioRecogida() == null) {
            reserva.setServicioRecogida(false);
        }

        if (reserva.getServicioPeluqueria() == null) {
            reserva.setServicioPeluqueria(false);
        }
    }

    private BigDecimal calcularPrecio(Reserva reserva) {
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
                precioPorDia = BigDecimal.ZERO;
                break;
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