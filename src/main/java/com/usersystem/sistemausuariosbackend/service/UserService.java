package com.usersystem.sistemausuariosbackend.service;

import com.usersystem.sistemausuariosbackend.model.User;
import com.usersystem.sistemausuariosbackend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import com.usersystem.sistemausuariosbackend.repository.RoleRepository;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository; // Agrega esto
    // ... (constructor)

    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }


    /**
     * Obtiene una lista de todos los usuarios del sistema.
     *
     * @return Una lista de todos los usuarios.
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Busca un usuario por su ID.
     *
     * @param id El ID del usuario.
     * @return Un Optional que contiene el usuario si se encuentra, o un Optional vacío.
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Elimina un usuario por su ID.
     *
     * @param id El ID del usuario a eliminar.
     * @return Verdadero si se elimina, falso si no existe.
     */
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Activa o desactiva la cuenta de un usuario.
     *
     * @param id El ID del usuario.
     * @return Un Optional que contiene el usuario actualizado, o un Optional vacío si no se encuentra.
     */
    public Optional<User> toggleUserStatus(Long id) {
        return userRepository.findById(id).map(user -> {
            user.setEnabled(!user.isEnabled());
            return userRepository.save(user);
        });
    }

    /**
     * Actualiza los datos de un usuario existente.
     *
     * @param userId El ID del usuario a actualizar.
     * @param updateRequest Un mapa con los nuevos datos del usuario.
     * @return Un Optional que contiene el usuario actualizado, o un Optional vacío si no se encuentra.
     */
    public Optional<User> updateUser(Long userId, Map<String, String> updateRequest) {
        return userRepository.findById(userId).map(user -> {
            user.setFirstName(updateRequest.getOrDefault("firstName", user.getFirstName()));
            user.setLastName(updateRequest.getOrDefault("lastName", user.getLastName()));
            user.setUsername(updateRequest.getOrDefault("username", user.getUsername()));
            user.setEmail(updateRequest.getOrDefault("email", user.getEmail()));
            user.setDni(updateRequest.getOrDefault("dni", user.getDni()));
            String dateOfBirthStr = updateRequest.get("dateOfBirth");
            if (dateOfBirthStr != null && !dateOfBirthStr.isEmpty()) {
                user.setDateOfBirth(LocalDate.parse(dateOfBirthStr));
            }
            user.setPhoneNumber(updateRequest.getOrDefault("phoneNumber", user.getPhoneNumber()));

            String roleName = updateRequest.get("role");
            if (roleName != null) {
                roleRepository.findByName(roleName).ifPresent(user::setRole);
            }

            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        });
    }



}
