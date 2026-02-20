package com.assetmanagement.license.repository;

import com.assetmanagement.license.entity.LicenseKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LicenseKeyRepository extends JpaRepository<LicenseKey, Long> {

    List<LicenseKey> findByLicense_LicenseIdAndIsDeletedFalse(Long licenseId);
}
