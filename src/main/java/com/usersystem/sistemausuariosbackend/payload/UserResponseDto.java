// src/main/java/com/usersystem/sistemausuariosbackend/payload/UserResponseDto.java
package com.usersystem.sistemausuariosbackend.payload;

import com.usersystem.sistemausuariosbackend.model.Role; // Todavía necesitamos Role para el constructor
import lombok.Data;
import java.time.LocalDate;
// import java.util.Set; // Ya no necesitamos Set
// import java.util.stream.Collectors; // Ya no necesitamos Collectors

@Data
public class UserResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String dni;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private boolean enabled;
    private String role; // --- CAMBIO CLAVE: Ahora es un String, no un Set<String> ---

    public UserResponseDto(
            Long id,
            String firstName,
            String lastName,
            String email,
            String dni,
            LocalDate dateOfBirth,
            String phoneNumber,
            boolean enabled,
            // --- CAMBIO CLAVE: Ahora acepta un solo objeto Role ---
            Role role) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.dni = dni;
        this.dateOfBirth = dateOfBirth;
        this.phoneNumber = phoneNumber;
        this.enabled = enabled;
        // --- CAMBIO CLAVE: Mapea directamente el nombre del rol ---
        this.role = (role != null) ? role.getName() : null; // Si el rol es nulo (no debería serlo por @ManyToOne optional=false), se puede poner a null o un default
    }
}