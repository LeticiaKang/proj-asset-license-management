package com.assetmanagement.license.repository;

import com.assetmanagement.license.entity.LicenseHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LicenseHistoryRepository extends JpaRepository<LicenseHistory, Long> {

    List<LicenseHistory> findByLicenseIdOrderByActionDateDesc(Long licenseId);

    List<LicenseHistory> findByMemberIdOrderByActionDateDesc(Long memberId);
}
