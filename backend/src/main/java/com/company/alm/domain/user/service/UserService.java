package com.company.alm.domain.user.service;

import com.company.alm.domain.user.entity.User;
import com.company.alm.domain.user.repository.UserMapper;
import com.company.alm.global.exception.BusinessException;
import com.company.alm.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserMapper userMapper;

    public List<User> findAll() {
        return userMapper.findAll();
    }

    public User findById(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    public User findByUsername(String username) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    @Transactional
    public void insert(User user) {
        // 중복 체크
        User existingUser = userMapper.findByUsername(user.getUsername());
        if (existingUser != null) {
            throw new BusinessException(ErrorCode.DUPLICATE_USERNAME);
        }
        userMapper.insert(user);
    }

    @Transactional
    public void update(User user) {
        User existingUser = userMapper.findById(user.getUserId());
        if (existingUser == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        userMapper.update(user);
    }

    @Transactional
    public void delete(Long userId) {
        User existingUser = userMapper.findById(userId);
        if (existingUser == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        userMapper.delete(userId);
    }
}
