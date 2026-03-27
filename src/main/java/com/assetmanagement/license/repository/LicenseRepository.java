package com.assetmanagement.license.repository;

import com.assetmanagement.license.entity.License;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LicenseRepository extends JpaRepository<License, Long>, JpaSpecificationExecutor<License> {

    Optional<License> findByLicenseIdAndIsDeletedFalse(Long licenseId);

    List<License> findByExpiryDateBeforeAndIsActiveTrueAndIsDeletedFalse(LocalDate date);

    @Query("""
        SELECT l
        FROM License l
        JOIN FETCH l.software s
        WHERE l.isDeleted = false
            AND l.isActive = true
        ORDER BY s.softwareName, l.licenseVersion
        """)
    List<License> findAllActiveLicenses();
}
