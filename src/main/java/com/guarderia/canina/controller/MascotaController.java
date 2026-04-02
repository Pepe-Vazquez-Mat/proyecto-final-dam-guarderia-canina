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

    @PostMapping("/usuario/{usuarioId}")
    public Mascota crearMascota(@PathVariable Long usuarioId,
                                @RequestBody Mascota mascota) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        mascota.setUsuario(usuario);

        return mascotaRepository.save(mascota);
    }

    @GetMapping
    public List<Mascota> listarMascotas() {
        return mascotaRepository.findAll();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Mascota> mascotasPorUsuario(@PathVariable Long usuarioId) {
        return mascotaRepository.findByUsuarioId(usuarioId);
    }

    @DeleteMapping("/{id}")
    public void eliminarMascota(@PathVariable Long id) {
        mascotaRepository.deleteById(id);
    }
}