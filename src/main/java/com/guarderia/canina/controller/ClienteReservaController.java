package com.guarderia.canina.controller;

import dto.ReservaRequest;
import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Reserva;
import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.ReservaRepository;
import com.guarderia.canina.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@RestController
@RequestMapping("/api/cliente-reservas")
@CrossOrigin(origins = "*")
public class ClienteReservaController {

    private final UsuarioRepository usuarioRepository;
    private final MascotaRepository mascotaRepository;
    private final ReservaRepository reservaRepository;

    public ClienteReservaController(UsuarioRepository usuarioRepository,
                                    MascotaRepository mascotaRepository,
                                    ReservaRepository reservaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.mascotaRepository = mascotaRepository;
        this.reservaRepository = reservaRepository;
    }

    @PostMapping
    public ResponseEntity<?> crearReserva(@RequestBody ReservaRequest request) {

        Usuario usuario;

        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(request.getEmail());

        if (usuarioExistente.isPresent()) {
            usuario = usuarioExistente.get();
        } else {
            usuario = new Usuario();
            usuario.setNombre(request.getNombreCliente());
            usuario.setApellidos(request.getApellidosCliente());
            usuario.setEmail(request.getEmail());
            usuario.setTelefono(request.getTelefono());
            usuario = usuarioRepository.save(usuario);
        }

        Mascota mascota = new Mascota();
        mascota.setNombre(request.getNombreMascota());
        mascota.setRaza(request.getRaza());
        mascota.setEdadAnios(request.getEdad());
        mascota.setPesoKg(request.getPeso());

        String extrasTexto = "";
        if (request.isBano()) extrasTexto += "Baño. ";
        if (request.isPeluqueria()) extrasTexto += "Peluquería. ";
        if (request.isRecogida()) extrasTexto += "Recogida a domicilio. ";
        if (request.isEntrega()) extrasTexto += "Entrega a domicilio. ";

        String observacionesFinal = "";
        if (request.getObservaciones() != null && !request.getObservaciones().isBlank()) {
            observacionesFinal = request.getObservaciones() + " ";
        }
        observacionesFinal += extrasTexto;

        mascota.setObservaciones(observacionesFinal.trim());
        mascota.setUsuario(usuario);
        mascota = mascotaRepository.save(mascota);

        LocalDate fechaInicio = LocalDate.parse(request.getFechaInicio());
        LocalDate fechaFin = LocalDate.parse(request.getFechaFin());

        long dias = ChronoUnit.DAYS.between(fechaInicio, fechaFin);
        if (dias <= 0) {
            dias = 1;
        }

        BigDecimal precioPorDia;
        if ("LARGA_ESTANCIA".equals(request.getTipoEstancia())) {
            precioPorDia = new BigDecimal("35.00");
        } else {
            precioPorDia = new BigDecimal("20.00");
        }

        BigDecimal extras = BigDecimal.ZERO;
        if (request.isBano()) extras = extras.add(new BigDecimal("8.00"));
        if (request.isPeluqueria()) extras = extras.add(new BigDecimal("12.00"));
        if (request.isRecogida()) extras = extras.add(new BigDecimal("10.00"));
        if (request.isEntrega()) extras = extras.add(new BigDecimal("10.00"));

        BigDecimal total = precioPorDia.multiply(BigDecimal.valueOf(dias)).add(extras);

        Reserva reserva = new Reserva();
        reserva.setMascota(mascota);
        reserva.setFechaInicio(fechaInicio);
        reserva.setFechaFin(fechaFin);
        reserva.setTipoEstancia(request.getTipoEstancia());
        reserva.setPrecioTotal(total);
        reserva.setEstadoReserva("PENDIENTE");

        reservaRepository.save(reserva);

        return ResponseEntity.ok("Reserva creada correctamente");
    }
}