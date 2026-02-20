package com.assetmanagement.license.repository;

import com.assetmanagement.license.dto.LicenseSearchCondition;
import com.assetmanagement.license.entity.License;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class LicenseSpecification {

    public static Specification<License> search(LicenseSearchCondition cond) {
        return Specification.where(notDeleted())
            .and(activeOnly())
            .and(keywordContains(cond.getKeyword()))
            .and(typeEquals(cond.getLicenseType()))
            .and(softwareEquals(cond.getSoftwareId()));
    }

    private static Specification<License> notDeleted() {
        return (root, query, cb) -> cb.isFalse(root.get("isDeleted"));
    }

    private static Specification<License> activeOnly() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    private static Specification<License> keywordContains(String keyword) {
        if (!StringUtils.hasText(keyword)) return null;
        return (root, query, cb) -> cb.like(
            cb.lower(root.get("software").get("softwareName")),
            "%" + keyword.toLowerCase() + "%"
        );
    }

    private static Specification<License> typeEquals(String licenseType) {
        if (!StringUtils.hasText(licenseType)) return null;
        return (root, query, cb) -> cb.equal(root.get("licenseType"), licenseType);
    }

    private static Specification<License> softwareEquals(Long softwareId) {
        if (softwareId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("software").get("softwareId"), softwareId);
    }
}
