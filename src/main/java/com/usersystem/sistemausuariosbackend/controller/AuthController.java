package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.Role;
import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.payload.LoginDto;
import com.usersystem.sistemausuariosbackend.payload.JWTAuthResponse; // ¡Asegúrate de que esta importación esté activa!
import com.usersystem.sistemausuariosbackend.repository.RoleRepository;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import com.usersystem.sistemausuariosbackend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors; // Necesario para procesar los roles

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    // ¡Cambiamos el tipo de retorno a ResponseEntity<JWTAuthResponse>!
    public ResponseEntity<JWTAuthResponse> authenticateUser(@RequestBody LoginDto loginDto) {
        if (loginDto.getEmail() == null || loginDto.getPassword() == null) {
            // En caso de BadRequest, devolvemos un ResponseEntity sin cuerpo o con un cuerpo de error genérico.
            // No podemos devolver JWTAuthResponse si no hay token ni rol.
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtUtil.generateToken((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal());

            // --- Lógica para obtener el rol y devolverlo ---
            // Asumimos que el usuario tendrá al menos un rol.
            // Obtenemos el primer rol, si necesitas manejar múltiples roles, ajusta JWTAuthResponse y esta lógica.
            String roleName = authentication.getAuthorities().stream()
                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                    .findFirst() // Toma el primer rol
                    .orElse("ROLE_USER"); // Rol por defecto si no se encuentra ninguno (esto no debería pasar si hay roles asignados)

            // Devolvemos el token y el rol en el JWTAuthResponse
            return ResponseEntity.ok(new JWTAuthResponse(token, roleName));

        } catch (Exception e) {
            System.err.println("Authentication failed for email: " + loginDto.getEmail() + " - Error: " + e.getMessage());
            // Para errores de autenticación, devolvemos un 401 Unauthorized sin cuerpo de JWTAuthResponse
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED); // O podrías crear un DTO de error específico.
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> registerRequest) {
        String username = registerRequest.get("username");
        String email = registerRequest.get("email");
        String password = registerRequest.get("password");
        String firstName = registerRequest.get("firstName");
        String lastName = registerRequest.get("lastName");

        if (username == null || email == null || password == null) {
            return new ResponseEntity<>("Username, email, and password are required!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return new ResponseEntity<>("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return new ResponseEntity<>("Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Asigna el rol por defecto (ej. ROLE_EMPLOYEE o ROLE_USER si lo creas)
        // NOTA: Asegúrate de que el rol "ROLE_EMPLOYEE" exista en tu tabla 'roles'.
        // Si no existe, lanza esta excepción.
        Role userRole = roleRepository.findByName("ROLE_EMPLOYEE")
                .orElseThrow(() -> new RuntimeException("Error: Role 'ROLE_EMPLOYEE' is not found. Please ensure it exists in your database."));
        user.setRoles(Collections.singleton(userRole));

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestParam boolean enabled) {
        return userRepository.findById(userId).map(user -> {
            user.setEnabled(enabled);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            return ResponseEntity.ok("User account " + (enabled ? "enabled" : "disabled") + " successfully.");
        }).orElse(new ResponseEntity<>("User not found.", HttpStatus.NOT_FOUND));
    }

    @GetMapping("/test-protected")
    public ResponseEntity<String> testProtected() {
        return ResponseEntity.ok("Acceso concedido! Estás autenticado.");
    }

    @GetMapping("/test-admin")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> testAdmin() {
        return ResponseEntity.ok("Acceso concedido! Eres un administrador.");
    }
}