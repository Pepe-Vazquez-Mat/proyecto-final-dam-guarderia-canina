package com.guarderia.canina.repository;

import com.guarderia.canina.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByMascotaId(Long mascotaId);
    List<Reserva> findByFechaInicioBetween(LocalDate inicio, LocalDate fin);
}