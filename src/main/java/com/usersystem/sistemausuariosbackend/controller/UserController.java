package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.payload.UserResponseDto;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import com.usersystem.sistemausuariosbackend.service.LogService;
import com.usersystem.sistemausuariosbackend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final LogService logService;
    private final UserService userService;

    public UserController(UserRepository userRepository, LogService logService, UserService userService) {
        this.userRepository = userRepository;
        this.logService = logService;
        this.userService = userService;
    }

    @GetMapping("/all")
    // CORRECCIÓN: Se usa hasAnyAuthority para validar el rol sin el prefijo 'ROLE_'
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByEmail(username)
                .map(UserResponseDto::fromUser)
                .map(ResponseEntity::ok)
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{userId}")
    // CORRECCIÓN: Se usa hasAuthority para validar el rol sin el prefijo 'ROLE_'
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId, Authentication authentication, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String currentUsername = authentication.getName();
        Long currentUserId = userRepository.findByEmail(currentUsername).map(User::getId).orElse(null);

        Optional<User> userToDelete = userRepository.findById(userId);
        if (userToDelete.isPresent()) {
            userService.deleteUser(userId);

            String description = String.format("El usuario '%s' (ID: %d) ha sido eliminado.", userToDelete.get().getUsername(), userToDelete.get().getId());
            logService.log("USER_DELETED", currentUsername, currentUserId, userToDelete.get().getUsername(), userToDelete.get().getId(), description, "SUCCESS", ipAddress);

            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{userId}/toggle-status")
    // CORRECCIÓN: Se usa hasAuthority para validar el rol sin el prefijo 'ROLE_'
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long userId, Authentication authentication, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String currentUsername = authentication.getName();
        Long currentUserId = userRepository.findByEmail(currentUsername).map(User::getId).orElse(null);

        Optional<User> updatedUserOptional = userService.toggleUserStatus(userId);

        if (updatedUserOptional.isPresent()) {
            User updatedUser = updatedUserOptional.get();
            String description = String.format("Cambio de estado de la cuenta de '%s' (ID: %d) a %s.",
                    updatedUser.getUsername(), updatedUser.getId(), updatedUser.isEnabled() ? "Activo" : "Inactivo");
            logService.log("USER_STATUS_CHANGE", currentUsername, currentUserId,
                    updatedUser.getUsername(), updatedUser.getId(),
                    description, "SUCCESS", ipAddress);
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }
}