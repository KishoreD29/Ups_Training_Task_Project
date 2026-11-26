package com.shop.task.dto;

import com.shop.task.entity.Role;
import com.shop.task.entity.User;

public record UserResponse(Long id, String name, String email, Role role) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
