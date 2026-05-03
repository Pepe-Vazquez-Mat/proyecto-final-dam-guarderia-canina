package com.guarderia.canina.controller;

import com.guarderia.canina.dto.OcupacionDTO;
import com.guarderia.canina.repository.ReservaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/ocupacion")
public class OcupacionController {

    private static final int CAPACIDAD_MAXIMA_PERROS = 40;

    private final ReservaRepository reservaRepository;

    public OcupacionController(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    @GetMapping
    public ResponseEntity<?> consultarOcupacion(@RequestParam LocalDate fechaEntrada,
                                                @RequestParam LocalDate fechaSalida) {
        if (fechaEntrada == null || fechaSalida == null) {
            return ResponseEntity.badRequest().body("Fecha de entrada y salida obligatorias");
        }

        if (fechaSalida.isBefore(fechaEntrada)) {
            return ResponseEntity.badRequest().body("La fecha de salida no puede ser anterior a la fecha de entrada");
        }

        LocalDate fechaActual = fechaEntrada;
        long ocupacionMaxima = 0;
        LocalDate fechaMasOcupada = fechaEntrada;

        while (!fechaActual.isAfter(fechaSalida)) {
            long ocupacionDia = reservaRepository.contarReservasOcupandoPlazaEnFecha(fechaActual);

            if (ocupacionDia > ocupacionMaxima) {
                ocupacionMaxima = ocupacionDia;
                fechaMasOcupada = fechaActual;
            }

            fechaActual = fechaActual.plusDays(1);
        }

        long plazasDisponibles = CAPACIDAD_MAXIMA_PERROS - ocupacionMaxima;

        if (plazasDisponibles < 0) {
            plazasDisponibles = 0;
        }

        boolean hayPlazas = plazasDisponibles > 0;

        String mensaje;

        if (hayPlazas) {
            mensaje = "Hay " + plazasDisponibles + " plaza(s) disponible(s) para las fechas seleccionadas.";
        } else {
            mensaje = "No hay plazas disponibles para las fechas seleccionadas.";
        }

        OcupacionDTO respuesta = new OcupacionDTO(
                CAPACIDAD_MAXIMA_PERROS,
                ocupacionMaxima,
                plazasDisponibles,
                fechaMasOcupada,
                hayPlazas,
                mensaje
        );

        return ResponseEntity.ok(respuesta);
    }
}