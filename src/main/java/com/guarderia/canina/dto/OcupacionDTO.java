package com.guarderia.canina.dto;

import java.time.LocalDate;

public class OcupacionDTO {

    private int capacidadMaxima;
    private long ocupacionMaxima;
    private long plazasDisponibles;
    private LocalDate fechaMasOcupada;
    private boolean hayPlazas;
    private String mensaje;

    public OcupacionDTO() {
    }

    public OcupacionDTO(int capacidadMaxima,
                        long ocupacionMaxima,
                        long plazasDisponibles,
                        LocalDate fechaMasOcupada,
                        boolean hayPlazas,
                        String mensaje) {
        this.capacidadMaxima = capacidadMaxima;
        this.ocupacionMaxima = ocupacionMaxima;
        this.plazasDisponibles = plazasDisponibles;
        this.fechaMasOcupada = fechaMasOcupada;
        this.hayPlazas = hayPlazas;
        this.mensaje = mensaje;
    }

    public int getCapacidadMaxima() {
        return capacidadMaxima;
    }

    public void setCapacidadMaxima(int capacidadMaxima) {
        this.capacidadMaxima = capacidadMaxima;
    }

    public long getOcupacionMaxima() {
        return ocupacionMaxima;
    }

    public void setOcupacionMaxima(long ocupacionMaxima) {
        this.ocupacionMaxima = ocupacionMaxima;
    }

    public long getPlazasDisponibles() {
        return plazasDisponibles;
    }

    public void setPlazasDisponibles(long plazasDisponibles) {
        this.plazasDisponibles = plazasDisponibles;
    }

    public LocalDate getFechaMasOcupada() {
        return fechaMasOcupada;
    }

    public void setFechaMasOcupada(LocalDate fechaMasOcupada) {
        this.fechaMasOcupada = fechaMasOcupada;
    }

    public boolean isHayPlazas() {
        return hayPlazas;
    }

    public void setHayPlazas(boolean hayPlazas) {
        this.hayPlazas = hayPlazas;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}