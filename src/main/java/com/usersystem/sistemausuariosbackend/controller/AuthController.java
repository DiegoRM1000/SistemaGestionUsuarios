// src/main/java/com/usersystem/sistemausuariosbackend/controller/AuthController.java
package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.Role;
import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.payload.LoginDto;
import com.usersystem.sistemausuariosbackend.payload.JWTAuthResponse;
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
import java.util.Collections; // Necesario para Collections.singletonList
import java.util.HashMap;
import java.util.Map;
// import java.util.stream.Collectors; // Ya no necesario para roles aquí

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
    public ResponseEntity<JWTAuthResponse> authenticateUser(@RequestBody LoginDto loginDto) {
        if (loginDto.getEmail() == null || loginDto.getPassword() == null) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtUtil.generateToken((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal());

            // --- Lógica para obtener el rol y devolverlo (asumiendo UN solo rol) ---
            String roleName = authentication.getAuthorities().stream()
                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                    .findFirst() // Toma el primer (y único) rol
                    .orElse("ROLE_EMPLOYEE"); // Rol por defecto si no se encuentra ninguno (esto no debería pasar)

            return ResponseEntity.ok(new JWTAuthResponse(token, roleName));

        } catch (Exception e) {
            System.err.println("Authentication failed for email: " + loginDto.getEmail() + " - Error: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> registerRequest) {
        String username = registerRequest.get("username");
        String email = registerRequest.get("email");
        String password = registerRequest.get("password");
        String firstName = registerRequest.get("firstName");
        String lastName = registerRequest.get("lastName");
        // Agrega la captura de DNI, fecha de nacimiento y teléfono si son enviados en el request de registro
        String dni = registerRequest.get("dni");
        String dateOfBirthStr = registerRequest.get("dateOfBirth");
        String phoneNumber = registerRequest.get("phoneNumber");


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
        user.setDni(dni);
        // Convierte la fecha de nacimiento de String a LocalDate si es necesario
        if (dateOfBirthStr != null && !dateOfBirthStr.isEmpty()) {
            user.setDateOfBirth(java.time.LocalDate.parse(dateOfBirthStr));
        }
        user.setPhoneNumber(phoneNumber);
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Asigna el rol por defecto (ROLE_EMPLOYEE), asegurando que exista
        Role userRole = roleRepository.findByName("ROLE_EMPLOYEE")
                .orElseThrow(() -> new RuntimeException("Error: Role 'ROLE_EMPLOYEE' not found. Please ensure it exists in your database."));
        // --- CAMBIO CLAVE: Asigna un solo rol ---
        user.setRole(userRole);
        // --- FIN CAMBIO CLAVE ---

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    // NOTA: El método updateUserStatus ha sido movido a UserController.
}