package com.usersystem.sistemausuariosbackend.config;

import com.usersystem.sistemausuariosbackend.security.CustomAccessDeniedHandler;
import com.usersystem.sistemausuariosbackend.security.JwtAuthFilter;
import com.usersystem.sistemausuariosbackend.security.JwtAuthEntryPoint;
// Importa UserDetailsServiceImpl si lo usas directamente en algún otro bean de seguridad,
// aunque no lo veo inyectado en este constructor de WebSecurityConfig.
// import com.usersystem.sistemausuariosbackend.security.UserDetailsServiceImpl;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// --- Importaciones para CORS ---
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;
// --- Fin Importaciones para CORS ---


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {

    private final JwtAuthEntryPoint unauthorizedHandler;
    private final JwtAuthFilter jwtAuthFilter;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    // Constructor para inyección de dependencias
    public WebSecurityConfig(JwtAuthEntryPoint unauthorizedHandler,
                             JwtAuthFilter jwtAuthFilter,
                             CustomAccessDeniedHandler customAccessDeniedHandler) {
        this.unauthorizedHandler = unauthorizedHandler;
        this.jwtAuthFilter = jwtAuthFilter;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // --- Bean para la configuración de CORS ---
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // ¡IMPORTANTE! Aquí debes especificar los orígenes de tu frontend.
        // Si tu frontend corre en http://localhost:5173, añádelo aquí.
        // Puedes añadir múltiples orígenes si tu frontend se despliega en diferentes lugares.
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // <-- ¡Ajusta este origen!
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")); // Métodos HTTP permitidos, PATCH es común
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With")); // Cabeceras permitidas
        configuration.setAllowCredentials(true); // Permite el envío de cookies, cabeceras de autorización, etc.
        configuration.setMaxAge(3600L); // Tiempo máximo de pre-vuelo (en segundos)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Aplica esta configuración CORS a todas las rutas (/**)
        return source;
    }
    // --- Fin Bean para la configuración de CORS ---


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Deshabilita CSRF para APIs RESTful con JWT
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler) // Para 401 (no autenticado)
                        .accessDeniedHandler(customAccessDeniedHandler) // Para 403 (autenticado pero sin permiso)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Configura la sesión como stateless
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/auth/**").permitAll() // Permite acceso público a todas las rutas de autenticación
                        .requestMatchers("/api/users/me").authenticated() // /api/users/me requiere autenticación
                        .requestMatchers("/api/users/**").hasRole("ADMIN") // /api/users/** requiere rol ADMIN
                        // Aquí puedes añadir más reglas de autorización basadas en roles
                        // .requestMatchers("/api/supervisors/**").hasRole("SUPERVISOR")
                        .anyRequest().authenticated() // Cualquier otra petición requiere autenticación
                );

        // Agrega el filtro JWT antes del filtro de autenticación de usuario y contraseña
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // --- Aplica la configuración CORS ---
        http.cors(cors -> cors.configurationSource(corsConfigurationSource())); // ¡Añade esta línea!
        // --- Fin Aplicación de CORS ---

        return http.build();
    }
}