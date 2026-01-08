package com.company.alm.domain.user.controller;

import com.company.alm.domain.user.entity.User;
import com.company.alm.domain.user.service.UserService;
import com.company.alm.global.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ApiResponse.success(users);
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        return ApiResponse.success(user);
    }

    @PostMapping
    public ApiResponse<User> createUser(@RequestBody User user) {
        userService.insert(user);
        return ApiResponse.success(user);
    }

    @PutMapping("/{id}")
    public ApiResponse<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setUserId(id);
        userService.update(user);
        return ApiResponse.success(user);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ApiResponse.success(null);
    }
}
