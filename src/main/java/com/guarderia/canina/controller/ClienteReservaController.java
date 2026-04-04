package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Reserva;
import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.ReservaRepository;
import com.guarderia.canina.repository.UsuarioRepository;
import com.guarderia.canina.security.SecurityUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cliente-reservas")
public class ClienteReservaController {

    private final ReservaRepository reservaRepository;
    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;

    public ClienteReservaController(ReservaRepository reservaRepository,
                                    MascotaRepository mascotaRepository,
                                    UsuarioRepository usuarioRepository) {
        this.reservaRepository = reservaRepository;
        this.mascotaRepository = mascotaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<?> listarMisReservas(Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        List<Reserva> reservas = reservaRepository.findByMascotaUsuarioId(usuario.getId());
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerMiReserva(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        return reservaRepository.findByIdAndMascotaUsuarioId(id, usuario.getId())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "No puedes acceder a una reserva que no es tuya")));
    }

    @PostMapping("/mascota/{mascotaId}")
    public ResponseEntity<?> crearReserva(@PathVariable Long mascotaId,
                                          @RequestBody Reserva reserva,
                                          Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        Mascota mascota = mascotaRepository.findByIdAndUsuarioId(mascotaId, usuario.getId())
                .orElse(null);

        if (mascota == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "No puedes crear una reserva para una mascota que no es tuya"));
        }

        ResponseEntity<?> validacion = validarReserva(reserva);
        if (validacion != null) {
            return validacion;
        }

        boolean solapa = !reservaRepository
                .findByMascotaIdAndFechaEntradaLessThanEqualAndFechaSalidaGreaterThanEqual(
                        mascotaId,
                        reserva.getFechaSalida(),
                        reserva.getFechaEntrada()
                ).isEmpty();

        if (solapa) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ya existe una reserva para esa mascota en esas fechas"));
        }

        reserva.setId(null);
        reserva.setMascota(mascota);

        if (reserva.getEstadoReserva() == null || reserva.getEstadoReserva().trim().isEmpty()) {
            reserva.setEstadoReserva("PENDIENTE");
        }

        if (reserva.getServicioRecogida() == null) {
            reserva.setServicioRecogida(false);
        }

        if (reserva.getServicioPeluqueria() == null) {
            reserva.setServicioPeluqueria(false);
        }

        reserva.setPrecioTotal(calcularPrecio(reserva));

        Reserva guardada = reservaRepository.save(reserva);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarReserva(@PathVariable Long id,
                                               @RequestBody Reserva datosReserva,
                                               Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        Reserva reservaExistente = reservaRepository.findByIdAndMascotaUsuarioId(id, usuario.getId())
                .orElse(null);

        if (reservaExistente == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "No puedes modificar una reserva que no es tuya"));
        }

        ResponseEntity<?> validacion = validarReserva(datosReserva);
        if (validacion != null) {
            return validacion;
        }

        Long mascotaIdActual = reservaExistente.getMascota().getId();

        boolean solapa = !reservaRepository
                .findByMascotaIdAndIdNotAndFechaEntradaLessThanEqualAndFechaSalidaGreaterThanEqual(
                        mascotaIdActual,
                        id,
                        datosReserva.getFechaSalida(),
                        datosReserva.getFechaEntrada()
                ).isEmpty();

        if (solapa) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Ya existe otra reserva para esa mascota en esas fechas"));
        }

        reservaExistente.setFechaEntrada(datosReserva.getFechaEntrada());
        reservaExistente.setFechaSalida(datosReserva.getFechaSalida());
        reservaExistente.setTipoEstancia(datosReserva.getTipoEstancia());
        reservaExistente.setServicioRecogida(
                datosReserva.getServicioRecogida() != null ? datosReserva.getServicioRecogida() : false
        );
        reservaExistente.setServicioPeluqueria(
                datosReserva.getServicioPeluqueria() != null ? datosReserva.getServicioPeluqueria() : false
        );
        reservaExistente.setObservaciones(datosReserva.getObservaciones());

        if (datosReserva.getEstadoReserva() != null && !datosReserva.getEstadoReserva().trim().isEmpty()) {
            reservaExistente.setEstadoReserva(datosReserva.getEstadoReserva());
        }

        reservaExistente.setPrecioTotal(calcularPrecio(reservaExistente));

        Reserva actualizada = reservaRepository.save(reservaExistente);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReserva(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);

        Reserva reserva = reservaRepository.findByIdAndMascotaUsuarioId(id, usuario.getId())
                .orElse(null);

        if (reserva == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "No puedes eliminar una reserva que no es tuya"));
        }

        reservaRepository.delete(reserva);
        return ResponseEntity.ok(Map.of("mensaje", "Reserva eliminada correctamente"));
    }

    private ResponseEntity<?> validarReserva(Reserva reserva) {
        if (reserva.getFechaEntrada() == null || reserva.getFechaSalida() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "La fecha de entrada y la fecha de salida son obligatorias"));
        }

        if (reserva.getFechaSalida().isBefore(reserva.getFechaEntrada())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "La fecha de salida no puede ser anterior a la fecha de entrada"));
        }

        if (reserva.getTipoEstancia() == null || reserva.getTipoEstancia().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El tipo de estancia es obligatorio"));
        }

        return null;
    }

    private BigDecimal calcularPrecio(Reserva reserva) {
        long dias = ChronoUnit.DAYS.between(reserva.getFechaEntrada(), reserva.getFechaSalida());

        if (dias <= 0) {
            dias = 1;
        }

        String tipo = reserva.getTipoEstancia() != null
                ? reserva.getTipoEstancia().trim().toUpperCase()
                : "";

        BigDecimal precioPorDia;

        switch (tipo) {
            case "LARGA_ESTANCIA":
                precioPorDia = BigDecimal.valueOf(18.00);
                break;
            case "GUARDERIA_DIA":
            default:
                precioPorDia = BigDecimal.valueOf(12.00);
                break;
        }

        BigDecimal total = precioPorDia.multiply(BigDecimal.valueOf(dias));

        if (Boolean.TRUE.equals(reserva.getServicioRecogida())) {
            total = total.add(BigDecimal.valueOf(5.00));
        }

        if (Boolean.TRUE.equals(reserva.getServicioPeluqueria())) {
            total = total.add(BigDecimal.valueOf(12.00));
        }

        return total;
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