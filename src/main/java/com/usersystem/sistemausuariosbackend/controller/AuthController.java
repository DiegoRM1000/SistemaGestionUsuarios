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
    private final JwtUtil jwtUtil;
    private final LogService logService;

    // Se eliminó RoleRepository y PasswordEncoder del constructor porque ya no son necesarios aquí
    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          JwtUtil jwtUtil,
                          LogService logService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
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


}
