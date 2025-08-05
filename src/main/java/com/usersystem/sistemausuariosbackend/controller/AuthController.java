package com.usersystem.sistemausuariosbackend.controller;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.model.Role;
import com.usersystem.sistemausuariosbackend.payload.LoginDto;
import com.usersystem.sistemausuariosbackend.payload.LoginResponseDto; // Importar el nuevo DTO
import com.usersystem.sistemausuariosbackend.payload.JWTAuthResponse;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import com.usersystem.sistemausuariosbackend.repository.RoleRepository;
import com.usersystem.sistemausuariosbackend.security.JwtUtil;
import com.usersystem.sistemausuariosbackend.service.LogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository; // Se necesita para el registro
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LogService logService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository, // Añadir al constructor
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          LogService logService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.logService = logService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> authenticateUser(@RequestBody LoginDto loginDto, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();

        if (loginDto.getEmail() == null || loginDto.getPassword() == null) {
            logService.log("LOGIN_ATTEMPT", loginDto.getEmail(), null, null, null,
                    "Intento de login con credenciales incompletas", "FAILURE", ipAddress);
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtUtil.generateToken((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal());

            User loggedInUser = userRepository.findByEmail(loginDto.getEmail()).orElse(null);

            if (loggedInUser == null) {
                return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
            }

            // --- CAMBIO CLAVE: Obtener el nombre del rol directamente del objeto Role ---
            String roleName = loggedInUser.getRole().getName();

            logService.log("USER_LOGIN", loggedInUser.getUsername(), loggedInUser.getId(), null, null,
                    "Inicio de sesión exitoso", "SUCCESS", ipAddress);

            // Devolvemos el DTO completo que incluye el token y los datos del usuario
            return ResponseEntity.ok(new LoginResponseDto(
                    token,
                    "Bearer",
                    loggedInUser.getId(),
                    loggedInUser.getFirstName(),
                    loggedInUser.getLastName(),
                    loggedInUser.getEmail(),
                    loggedInUser.getDni(),
                    roleName
            ));

        } catch (AuthenticationException e) {
            System.err.println("Authentication failed for email: " + loginDto.getEmail() + " - Error: " + e.getMessage());
            logService.log("LOGIN_ATTEMPT", loginDto.getEmail(), null, null, null,
                    "Intento de login fallido: " + e.getMessage(), "FAILURE", ipAddress);
            return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> registerRequest, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();

        String username = registerRequest.get("username");
        String email = registerRequest.get("email");
        String password = registerRequest.get("password");
        String firstName = registerRequest.get("firstName");
        String lastName = registerRequest.get("lastName");
        String dni = registerRequest.get("dni");
        String dateOfBirthStr = registerRequest.get("dateOfBirth");
        String phoneNumber = registerRequest.get("phoneNumber");

        if (username == null || email == null || password == null) {
            logService.log("USER_REGISTRATION", username, null, null, null,
                    "Intento de registro con datos incompletos", "FAILURE", ipAddress);
            return new ResponseEntity<>("Username, email, and password are required!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.findByUsername(username).isPresent()) {
            logService.log("USER_REGISTRATION", username, null, null, null,
                    "Intento de registro fallido: Username ya en uso", "FAILURE", ipAddress);
            return new ResponseEntity<>("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.findByEmail(email).isPresent()) {
            logService.log("USER_REGISTRATION", username, null, null, null,
                    "Intento de registro fallido: Email ya en uso", "FAILURE", ipAddress);
            return new ResponseEntity<>("Email is already in use!", HttpStatus.BAD_REQUEST);
        }

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

        // Asignar el rol por defecto 'ROLE_EMPLOYEE'
        Role userRole = roleRepository.findByName("Empleado")
                .orElseThrow(() -> new RuntimeException("Error: Role 'ROLE_EMPLOYEE' not found. Please ensure it exists in your database."));
        user.setRole(userRole);

        userRepository.save(user);

        logService.log("USER_CREATED", user.getUsername(), user.getId(), null, null,
                "Nuevo usuario registrado exitosamente", "SUCCESS", ipAddress);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
