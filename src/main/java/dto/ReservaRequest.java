package dto;

public class ReservaRequest {

    private String nombreCliente;
    private String apellidosCliente;
    private String email;
    private String telefono;

    private String nombreMascota;
    private String raza;
    private Integer edad;
    private Double peso;

    private String fechaInicio;
    private String fechaFin;
    private String tipoEstancia;

    private boolean bano;
    private boolean peluqueria;
    private boolean recogida;
    private boolean entrega;

    private String observaciones;

    public ReservaRequest() {
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public String getApellidosCliente() {
        return apellidosCliente;
    }

    public void setApellidosCliente(String apellidosCliente) {
        this.apellidosCliente = apellidosCliente;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getNombreMascota() {
        return nombreMascota;
    }

    public void setNombreMascota(String nombreMascota) {
        this.nombreMascota = nombreMascota;
    }

    public String getRaza() {
        return raza;
    }

    public void setRaza(String raza) {
        this.raza = raza;
    }

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) {
        this.edad = edad;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public String getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(String fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public String getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(String fechaFin) {
        this.fechaFin = fechaFin;
    }

    public String getTipoEstancia() {
        return tipoEstancia;
    }

    public void setTipoEstancia(String tipoEstancia) {
        this.tipoEstancia = tipoEstancia;
    }

    public boolean isBano() {
        return bano;
    }

    public void setBano(boolean bano) {
        this.bano = bano;
    }

    public boolean isPeluqueria() {
        return peluqueria;
    }

    public void setPeluqueria(boolean peluqueria) {
        this.peluqueria = peluqueria;
    }

    public boolean isRecogida() {
        return recogida;
    }

    public void setRecogida(boolean recogida) {
        this.recogida = recogida;
    }

    public boolean isEntrega() {
        return entrega;
    }

    public void setEntrega(boolean entrega) {
        this.entrega = entrega;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}