package com.guarderia.canina;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.guarderia.canina", "config"})
public class GuarderiaCaninaApplication {

    public static void main(String[] args) {
        SpringApplication.run(GuarderiaCaninaApplication.class, args);
    }
}