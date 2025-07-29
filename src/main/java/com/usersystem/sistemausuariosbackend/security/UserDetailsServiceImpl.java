package com.usersystem.sistemausuariosbackend.security;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.model.Role; // Importar la entidad Role para mapRolesToAuthorities
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collection;
import java.util.Set; // Importar Set
import java.util.stream.Collectors;

@Service // Indica que esta clase es un servicio de Spring
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    // Inyección de dependencias para el UserRepository
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException { // Renombramos el parámetro a 'email' para mayor claridad
        // Busca el usuario en la base de datos EXCLUSIVAMENTE por su email.
        // Si no se encuentra un usuario con ese email, lanza una excepción.
        User user = userRepository.findByEmail(email) // ¡CRÍTICO: Usamos findByEmail directamente!
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        // Convierte los roles del usuario a una colección de GrantedAuthority para Spring Security
        Collection<? extends GrantedAuthority> authorities = mapRolesToAuthorities(user.getRoles()); // Usamos un método auxiliar para mantenerlo limpio

        // Retorna un objeto UserDetails de Spring Security
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), // ¡CRÍTICO: El principal de autenticación ahora es el email!
                user.getPassword(),
                user.isEnabled(), // Estado de habilitación del usuario
                true, // Account non expired
                true, // Credentials non expired
                true, // Account non locked
                authorities // Roles/Permisos del usuario
        );
    }

    // Metodo auxiliar para mapear los roles del usuario a GrantedAuthority de Spring Security
    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(Set<Role> roles){
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }
}