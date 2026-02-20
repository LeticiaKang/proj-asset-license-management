package com.assetmanagement.software.repository;

import com.assetmanagement.software.entity.Software;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface SoftwareRepository extends JpaRepository<Software, Long>, JpaSpecificationExecutor<Software> {

    List<Software> findByIsDeletedFalse();

    Optional<Software> findBySoftwareIdAndIsDeletedFalse(Long softwareId);
}
