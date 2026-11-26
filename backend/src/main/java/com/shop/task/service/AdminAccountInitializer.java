package com.shop.task.service;

import com.shop.task.entity.Role;
import com.shop.task.entity.User;
import com.shop.task.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class AdminAccountInitializer implements ApplicationRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    public AdminAccountInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${library.admin.email:}") String email,
            @Value("${library.admin.password:}") String password
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() && password.isBlank()) {
            return;
        }
        if (email.isBlank() || password.isBlank()) {
            throw new IllegalStateException("Set both LIBRARY_ADMIN_EMAIL and LIBRARY_ADMIN_PASSWORD");
        }
        var existingAccount = userRepository.findByEmailIgnoreCase(email);
        if (existingAccount.isPresent()) {
            if (existingAccount.get().getRole() != Role.ADMIN) {
                throw new IllegalStateException(
                        "The configured admin email is already assigned to a non-admin account"
                );
            }
            return;
        }

        try {
            userRepository.saveAndFlush(new User(
                    "Library Admin",
                    email,
                    passwordEncoder.encode(password),
                    Role.ADMIN
            ));
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException("Unable to create the configured admin account", exception);
        }
    }
}
