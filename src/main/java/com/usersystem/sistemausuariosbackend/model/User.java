package com.usersystem.sistemausuariosbackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
        // La restricción de unicidad para 'email' ya está correctamente definida.
        // Esto asegura que no haya dos usuarios con el mismo correo electrónico.
        @UniqueConstraint(columnNames = "email"),
        // Si 'username' también debe ser único (aunque no lo usemos para login principal),
        // esta restricción es correcta. Si no se requiere unicidad para username,
        // podrías quitar esta línea:
        @UniqueConstraint(columnNames = "username")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mantenemos 'username' ya que tu estructura lo incluye.
    // Aunque el login se hará por email, 'username' puede ser usado para otros propósitos.
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    // ¡Este campo 'email' es el CRÍTICO para el login por correo!
    // Ya lo tienes con 'unique = true' y 'nullable = false', lo cual es perfecto.
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

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

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

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