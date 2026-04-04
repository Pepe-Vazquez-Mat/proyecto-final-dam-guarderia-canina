package com.guarderia.canina.repository;

import com.guarderia.canina.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {

    List<Mascota> findByUsuarioId(Long usuarioId);

    Optional<Mascota> findByIdAndUsuarioId(Long id, Long usuarioId);
}