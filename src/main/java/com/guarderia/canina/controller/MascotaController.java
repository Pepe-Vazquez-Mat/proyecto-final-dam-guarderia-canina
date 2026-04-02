package com.guarderia.canina.controller;

import com.guarderia.canina.model.Mascota;
import com.guarderia.canina.model.Usuario;
import com.guarderia.canina.repository.MascotaRepository;
import com.guarderia.canina.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {

    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;

    public MascotaController(MascotaRepository mascotaRepository,
                             UsuarioRepository usuarioRepository) {
        this.mascotaRepository = mascotaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // 🔹 Crear mascota asociada a un usuario
    @PostMapping("/usuario/{usuarioId}")
    public Mascota crearMascota(@PathVariable Long usuarioId,
                                @RequestBody Mascota mascota) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        mascota.setUsuario(usuario);

        return mascotaRepository.save(mascota);
    }

    // 🔹 Listar todas las mascotas
    @GetMapping
    public List<Mascota> listarMascotas() {
        return mascotaRepository.findAll();
    }

    // 🔹 Listar mascotas de un usuario
    @GetMapping("/usuario/{usuarioId}")
    public List<Mascota> mascotasPorUsuario(@PathVariable Long usuarioId) {
        return mascotaRepository.findByUsuarioId(usuarioId);
    }
}