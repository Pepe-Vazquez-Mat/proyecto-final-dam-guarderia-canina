package com.guarderia.canina.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fechaEntrada;

    @Column(nullable = false)
    private LocalDate fechaSalida;

    @Column(nullable = false)
    private String tipoEstancia;

    private Boolean servicioRecogida = false;

    private Boolean servicioPeluqueria = false;

    @Column(length = 1000)
    private String observaciones;

    @Column(nullable = false)
    private String estadoReserva = "PENDIENTE";

    @Column(precision = 10, scale = 2)
    private BigDecimal precioTotal;

    @ManyToOne
    @JoinColumn(name = "mascota_id", nullable = false)
    private Mascota mascota;

    public Reserva() {
    }

    public Reserva(Long id, LocalDate fechaEntrada, LocalDate fechaSalida, String tipoEstancia,
                   Boolean servicioRecogida, Boolean servicioPeluqueria, String observaciones,
                   String estadoReserva, BigDecimal precioTotal, Mascota mascota) {
        this.id = id;
        this.fechaEntrada = fechaEntrada;
        this.fechaSalida = fechaSalida;
        this.tipoEstancia = tipoEstancia;
        this.servicioRecogida = servicioRecogida;
        this.servicioPeluqueria = servicioPeluqueria;
        this.observaciones = observaciones;
        this.estadoReserva = estadoReserva;
        this.precioTotal = precioTotal;
        this.mascota = mascota;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getFechaEntrada() {
        return fechaEntrada;
    }

    public LocalDate getFechaSalida() {
        return fechaSalida;
    }

    public String getTipoEstancia() {
        return tipoEstancia;
    }

    public Boolean getServicioRecogida() {
        return servicioRecogida;
    }

    public Boolean getServicioPeluqueria() {
        return servicioPeluqueria;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public String getEstadoReserva() {
        return estadoReserva;
    }

    public BigDecimal getPrecioTotal() {
        return precioTotal;
    }

    public Mascota getMascota() {
        return mascota;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setFechaEntrada(LocalDate fechaEntrada) {
        this.fechaEntrada = fechaEntrada;
    }

    public void setFechaSalida(LocalDate fechaSalida) {
        this.fechaSalida = fechaSalida;
    }

    public void setTipoEstancia(String tipoEstancia) {
        this.tipoEstancia = tipoEstancia;
    }

    public void setServicioRecogida(Boolean servicioRecogida) {
        this.servicioRecogida = servicioRecogida;
    }

    public void setServicioPeluqueria(Boolean servicioPeluqueria) {
        this.servicioPeluqueria = servicioPeluqueria;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public void setEstadoReserva(String estadoReserva) {
        this.estadoReserva = estadoReserva;
    }

    public void setPrecioTotal(BigDecimal precioTotal) {
        this.precioTotal = precioTotal;
    }

    public void setMascota(Mascota mascota) {
        this.mascota = mascota;
    }
}