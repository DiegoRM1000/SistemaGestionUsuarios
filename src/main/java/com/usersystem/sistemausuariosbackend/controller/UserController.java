// src/main/java/com/usersystem/sistemausuariosbackend/controller/UserController.java
package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.payload.UserResponseDto;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime; // Necesario para setUpdatedAt
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus; // ¡AÑADE ESTA LÍNEA!

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Usar hasRole() sin el prefijo "ROLE_" si tu UserDetailsServiceImpl ya lo añade
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponseDto> userDtos = users.stream()
                .map(user -> new UserResponseDto(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getDni(),
                        user.getDateOfBirth(),
                        user.getPhoneNumber(),
                        user.isEnabled(),
                        user.getRole())) // Accede directamente a user.getRole()
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(u -> new UserResponseDto(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getDni(),
                        u.getDateOfBirth(),
                        u.getPhoneNumber(),
                        u.isEnabled(),
                        u.getRole())) // Accede directamente a u.getRole()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> user = userRepository.findByEmail(email);

        return user.map(u -> new UserResponseDto(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getDni(),
                        u.getDateOfBirth(),
                        u.getPhoneNumber(),
                        u.isEnabled(),
                        u.getRole())) // Accede directamente a u.getRole()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // --- MÉTODO MOVIDO DESDE AuthController ---
    @PutMapping("/{userId}/status") // Ruta más RESTful para una acción específica sobre un recurso
    @PreAuthorize("hasRole('ADMIN')") // Solo un ADMIN puede cambiar el estado de la cuenta
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestParam boolean enabled) {
        return userRepository.findById(userId).map(user -> {
            user.setEnabled(enabled);
            user.setUpdatedAt(LocalDateTime.now()); // Asegúrate de actualizar el timestamp
            userRepository.save(user);
            return ResponseEntity.ok("User account " + (enabled ? "enabled" : "disabled") + " successfully.");
        }).orElse(new ResponseEntity<>("User not found.", HttpStatus.NOT_FOUND));
    }
    // --- FIN MÉTODO MOVIDO ---
}