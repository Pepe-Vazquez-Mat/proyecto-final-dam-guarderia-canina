package com.guarderia.canina.repository;

import com.guarderia.canina.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByMascotaId(Long mascotaId);

    List<Reserva> findByFechaInicioBetween(LocalDate inicio, LocalDate fin);

    @Query("""
        SELECT r FROM Reserva r
        WHERE r.mascota.id = :mascotaId
        AND r.fechaInicio <= :fechaFin
        AND r.fechaFin >= :fechaInicio
    """)
    List<Reserva> buscarReservasSolapadas(@Param("mascotaId") Long mascotaId,
                                          @Param("fechaInicio") LocalDate fechaInicio,
                                          @Param("fechaFin") LocalDate fechaFin);
}