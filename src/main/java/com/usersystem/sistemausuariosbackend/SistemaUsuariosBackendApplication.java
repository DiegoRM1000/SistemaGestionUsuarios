// src/main/java/com/usersystem/sistemausuariosbackend/SistemaUsuariosBackendApplication.java
package com.usersystem.sistemausuariosbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import com.usersystem.sistemausuariosbackend.model.Role;
import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.repository.RoleRepository;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate; // Importar LocalDate
import java.time.LocalDateTime;
// Ya no necesitamos HashSet ni Set ni Collections
// import java.util.Collections;
// import java.util.HashSet;
// import java.util.Set;


@SpringBootApplication
public class SistemaUsuariosBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaUsuariosBackendApplication.class, args);
	}


	@Bean
	public CommandLineRunner run(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Crear los roles si no existen
			Role adminRole = roleRepository.findByName("ROLE_ADMIN")
					.orElseGet(() -> {
						Role newRole = new Role();
						newRole.setName("ROLE_ADMIN");
						System.out.println("Rol ROLE_ADMIN creado.");
						return roleRepository.save(newRole);
					});

			Role employeeRole = roleRepository.findByName("ROLE_EMPLOYEE")
					.orElseGet(() -> {
						Role newRole = new Role();
						newRole.setName("ROLE_EMPLOYEE");
						System.out.println("Rol ROLE_EMPLOYEE creado.");
						return roleRepository.save(newRole);
					});

			Role supervisorRole = roleRepository.findByName("ROLE_SUPERVISOR")
					.orElseGet(() -> {
						Role newRole = new Role();
						newRole.setName("ROLE_SUPERVISOR");
						System.out.println("Rol ROLE_SUPERVISOR creado.");
						return roleRepository.save(newRole);
					});


			// 3. Crear usuarios de prueba si no existen con todos los datos
			if (userRepository.findByUsername("admin").isEmpty()) {
				User adminUser = new User();
				adminUser.setUsername("admin");
				adminUser.setEmail("admin@example.com");
				adminUser.setPassword(passwordEncoder.encode("adminpassword"));
				adminUser.setFirstName("Super");
				adminUser.setLastName("Admin");
				adminUser.setDni("12345678"); // DNI de 8 caracteres
				adminUser.setDateOfBirth(LocalDate.of(1985, 5, 15)); // Fecha de nacimiento
				adminUser.setPhoneNumber("987654321"); // Teléfono de 9 caracteres
				adminUser.setEnabled(true);
				adminUser.setCreatedAt(LocalDateTime.now());
				adminUser.setUpdatedAt(LocalDateTime.now());
				adminUser.setRole(adminRole);
				userRepository.save(adminUser);
				System.out.println("Usuario 'admin' creado con rol ROLE_ADMIN.");
			}

			if (userRepository.findByUsername("empleado").isEmpty()) {
				User employeeUser = new User();
				employeeUser.setUsername("empleado");
				employeeUser.setEmail("empleado@example.com");
				employeeUser.setPassword(passwordEncoder.encode("password"));
				employeeUser.setFirstName("Juan");
				employeeUser.setLastName("Perez");
				employeeUser.setDni("87654321"); // DNI de 8 caracteres
				employeeUser.setDateOfBirth(LocalDate.of(1990, 10, 20)); // Fecha de nacimiento
				employeeUser.setPhoneNumber("912345678"); // Teléfono de 9 caracteres
				employeeUser.setEnabled(true);
				employeeUser.setCreatedAt(LocalDateTime.now());
				employeeUser.setUpdatedAt(LocalDateTime.now());
				employeeUser.setRole(employeeRole);
				userRepository.save(employeeUser);
				System.out.println("Usuario 'empleado' creado con rol ROLE_EMPLOYEE.");
			}

			if (userRepository.findByUsername("supervisor").isEmpty()) {
				User supervisorUser = new User();
				supervisorUser.setUsername("supervisor");
				supervisorUser.setEmail("supervisor@example.com");
				supervisorUser.setPassword(passwordEncoder.encode("password"));
				supervisorUser.setFirstName("Ana");
				supervisorUser.setLastName("Gomez");
				supervisorUser.setDni("45678901"); // DNI de 8 caracteres
				supervisorUser.setDateOfBirth(LocalDate.of(1988, 7, 25)); // Fecha de nacimiento
				supervisorUser.setPhoneNumber("954321098"); // Teléfono de 9 caracteres
				supervisorUser.setEnabled(true);
				supervisorUser.setCreatedAt(LocalDateTime.now());
				supervisorUser.setUpdatedAt(LocalDateTime.now());
				supervisorUser.setRole(supervisorRole);
				userRepository.save(supervisorUser);
				System.out.println("Usuario 'supervisor' creado con rol ROLE_SUPERVISOR.");
			}
		};
	}
}