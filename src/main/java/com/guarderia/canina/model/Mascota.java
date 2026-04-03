package com.guarderia.canina.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mascotas")
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String raza;

    private Double pesoKg;

    private Integer edadAnios;

    @Column(length = 800)
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonBackReference("usuario-mascotas")
    private Usuario usuario;

    @OneToMany(mappedBy = "mascota", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("mascota-reservas")
    private List<Reserva> reservas = new ArrayList<>();

    public Mascota() {
    }

    public Mascota(Long id, String nombre, String raza, Double pesoKg, Integer edadAnios, String observaciones, Usuario usuario) {
        this.id = id;
        this.nombre = nombre;
        this.raza = raza;
        this.pesoKg = pesoKg;
        this.edadAnios = edadAnios;
        this.observaciones = observaciones;
        this.usuario = usuario;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getRaza() {
        return raza;
    }

    public Double getPesoKg() {
        return pesoKg;
    }

    public Integer getEdadAnios() {
        return edadAnios;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public List<Reserva> getReservas() {
        return reservas;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setRaza(String raza) {
        this.raza = raza;
    }

    public void setPesoKg(Double pesoKg) {
        this.pesoKg = pesoKg;
    }

    public void setEdadAnios(Integer edadAnios) {
        this.edadAnios = edadAnios;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public void setReservas(List<Reserva> reservas) {
        this.reservas = reservas;
    }
}