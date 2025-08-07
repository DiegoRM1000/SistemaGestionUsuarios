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
import com.usersystem.sistemausuariosbackend.model.Role;
import com.usersystem.sistemausuariosbackend.repository.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final LogService logService;
    private final UserService userService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          LogService logService,
                          UserService userService,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.logService = logService;
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
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

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> registerRequest,
                                        Authentication authentication,
                                        HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String adminUsername = authentication.getName();
        Long adminUserId = userRepository.findByEmail(adminUsername).map(User::getId).orElse(null);

        String username = registerRequest.get("username");
        String email = registerRequest.get("email");
        String password = registerRequest.get("password");
        String firstName = registerRequest.get("firstName");
        String lastName = registerRequest.get("lastName");
        String dni = registerRequest.get("dni");
        String dateOfBirthStr = registerRequest.get("dateOfBirth");
        String phoneNumber = registerRequest.get("phoneNumber");
        String roleName = registerRequest.get("role"); // Recibimos el nombre del rol

        if (username == null || email == null || password == null || roleName == null) {
            logService.log("USER_CREATION_ATTEMPT", adminUsername, adminUserId, null, null,
                    "Intento de creación de usuario fallido: datos incompletos.", "FAILURE", ipAddress);
            return new ResponseEntity<>("Username, email, password, and role are required!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.findByUsername(username).isPresent() || userRepository.findByEmail(email).isPresent()) {
            logService.log("USER_CREATION_ATTEMPT", adminUsername, adminUserId, null, null,
                    "Intento de creación de usuario fallido: Username o Email ya en uso.", "FAILURE", ipAddress);
            return new ResponseEntity<>("Username or Email is already taken!", HttpStatus.BAD_REQUEST);
        }

        Role assignedRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> {
                    logService.log("USER_CREATION_ATTEMPT", adminUsername, adminUserId, null, null,
                            "Intento de creación de usuario fallido: Rol '" + roleName + "' no encontrado.", "FAILURE", ipAddress);
                    return new RuntimeException("Error: Role '" + roleName + "' not found.");
                });

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setDni(dni);
        if (dateOfBirthStr != null && !dateOfBirthStr.isEmpty()) {
            user.setDateOfBirth(LocalDate.parse(dateOfBirthStr));
        }
        user.setPhoneNumber(phoneNumber);
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setRole(assignedRole);

        userRepository.save(user);

        logService.log("USER_CREATED", adminUsername, adminUserId, user.getUsername(), user.getId(),
                "Nuevo usuario creado por administrador con rol " + assignedRole.getName(), "SUCCESS", ipAddress);

        return new ResponseEntity<>("User created successfully with role " + assignedRole.getName() + "!", HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> userOptional = userService.getUserById(id);
        return userOptional.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @RequestBody Map<String, String> updateRequest) {
        Optional<User> updatedUserOptional = userService.updateUser(userId, updateRequest);
        return updatedUserOptional.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}