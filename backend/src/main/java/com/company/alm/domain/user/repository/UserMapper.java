package com.company.alm.domain.user.repository;

import com.company.alm.domain.user.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {

    List<User> findAll();

    User findById(@Param("userId") Long userId);

    User findByUsername(@Param("username") String username);

    void insert(User user);

    void update(User user);

    void delete(@Param("userId") Long userId);
}
