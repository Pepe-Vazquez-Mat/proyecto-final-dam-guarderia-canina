package com.guarderia.canina.repository;

import com.guarderia.canina.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByMascotaUsuarioId(Long usuarioId);

    Optional<Reserva> findByIdAndMascotaUsuarioId(Long id, Long usuarioId);

    List<Reserva> findByMascotaId(Long mascotaId);

    List<Reserva> findByMascotaIdAndFechaEntradaLessThanEqualAndFechaSalidaGreaterThanEqual(
            Long mascotaId,
            LocalDate fechaSalida,
            LocalDate fechaEntrada
    );

    List<Reserva> findByMascotaIdAndIdNotAndFechaEntradaLessThanEqualAndFechaSalidaGreaterThanEqual(
            Long mascotaId,
            Long reservaId,
            LocalDate fechaSalida,
            LocalDate fechaEntrada
    );
}