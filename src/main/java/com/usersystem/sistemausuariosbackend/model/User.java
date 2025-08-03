// src/main/java/com/usersystem/sistemausuariosbackend/model/User.java
package com.usersystem.sistemausuariosbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
// import java.util.HashSet; // Ya no necesitamos Set
// import java.util.Set;     // Ya no necesitamos Set

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "username")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(name = "dni", unique = true, length = 15)
    private String dni;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "phone_number", length = 9)
    private String phoneNumber;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    @Column(name = "two_factor_enabled", nullable = false)
    private boolean twoFactorEnabled = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- CAMBIO CLAVE: Relación Many-to-One con Role ---
    @ManyToOne(fetch = FetchType.EAGER, optional = false) // FetchType.EAGER para cargar el rol inmediatamente
    @JoinColumn(name = "role_id", nullable = false) // Columna 'role_id' en la tabla 'users', no puede ser nula
    private Role role; // Un solo objeto Role, no un Set
    // --- FIN CAMBIO CLAVE ---

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}