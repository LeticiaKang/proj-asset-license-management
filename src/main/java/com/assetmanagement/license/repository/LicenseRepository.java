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

    @Query(value = """
        SELECT
            s.software_id   AS softwareId,
            s.software_name AS softwareName,
            l.license_id    AS licenseId,
            l.license_type  AS licenseType,
            l.license_version AS licenseVersion,
            l.total_qty     AS totalQty,
            l.used_qty      AS usedQty,
            (l.total_qty - l.used_qty) AS remainQty,
            l.expiry_date   AS expiryDate,
            CASE
                WHEN l.expiry_date IS NOT NULL AND l.expiry_date < CURRENT_DATE THEN 'EXPIRED'
                WHEN l.expiry_date IS NOT NULL AND l.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'EXPIRING_SOON'
                ELSE 'ACTIVE'
            END AS expiryStatus
        FROM license l
        JOIN software s ON s.software_id = l.software_id
        WHERE l.is_deleted = false AND l.is_active = true
        ORDER BY s.software_name, l.license_version
        """, nativeQuery = true)
    List<LicenseSummaryProjection> getLicenseSummary();
}
