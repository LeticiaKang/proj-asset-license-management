package com.assetmanagement.dept.repository;

import com.assetmanagement.dept.entity.Dept;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeptRepository extends JpaRepository<Dept, Long> {

    List<Dept> findByIsDeletedFalseOrderByDeptOrderAsc();

    Optional<Dept> findByDeptIdAndIsDeletedFalse(Long deptId);

    boolean existsByParentDeptIdAndIsDeletedFalse(Long parentDeptId);

    List<Dept> findByDeptPathStartingWithAndIsDeletedFalse(String pathPrefix);
}
