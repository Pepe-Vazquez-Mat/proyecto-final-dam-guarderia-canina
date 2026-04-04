package com.guarderia.canina.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/test")
    public ResponseEntity<?> testAdmin() {
        return ResponseEntity.ok(Map.of(
                "mensaje", "Acceso concedido al administrador"
        ));
    }
}