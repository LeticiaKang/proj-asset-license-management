package com.assetmanagement.license.service;

import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import com.assetmanagement.license.dto.*;
import com.assetmanagement.license.entity.License;
import com.assetmanagement.license.entity.LicenseKey;
import com.assetmanagement.license.repository.LicenseKeyRepository;
import com.assetmanagement.license.repository.LicenseRepository;
import com.assetmanagement.license.repository.LicenseSpecification;
import com.assetmanagement.license.repository.LicenseSummaryProjection;
import com.assetmanagement.software.entity.Software;
import com.assetmanagement.software.repository.SoftwareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LicenseService {

    private final LicenseRepository licenseRepository;
    private final LicenseKeyRepository licenseKeyRepository;
    private final SoftwareRepository softwareRepository;

    public Page<LicenseResponse> getLicenses(LicenseSearchCondition condition, Pageable pageable) {
        return licenseRepository.findAll(LicenseSpecification.search(condition), pageable)
            .map(LicenseResponse::from);
    }

    public LicenseDetailResponse getLicense(Long licenseId) {
        License license = findLicenseOrThrow(licenseId);
        List<LicenseKey> keys = licenseKeyRepository
            .findByLicense_LicenseIdAndIsDeletedFalse(licenseId);
        return LicenseDetailResponse.from(license, keys);
    }

    @Transactional
    public LicenseResponse createLicense(LicenseRequest request, Long regId) {
        Software software = softwareRepository.findById(request.getSoftwareId())
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        License license = License.builder()
            .software(software)
            .licenseType(request.getLicenseType())
            .licenseVersion(request.getLicenseVersion())
            .totalQty(request.getTotalQty())
            .purchaseDate(request.getPurchaseDate())
            .expiryDate(request.getExpiryDate())
            .purchasePrice(request.getPurchasePrice())
            .installGuide(request.getInstallGuide())
            .remarks(request.getRemarks())
            .build();

        license.setRegId(regId);
        license.setUpdId(regId);

        return LicenseResponse.from(licenseRepository.save(license));
    }

    @Transactional
    public LicenseResponse updateLicense(Long licenseId, LicenseRequest request, Long updId) {
        License existing = findLicenseOrThrow(licenseId);

        Software software = softwareRepository.findById(request.getSoftwareId())
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        License updated = License.builder()
            .licenseId(existing.getLicenseId())
            .software(software)
            .licenseType(request.getLicenseType())
            .licenseVersion(request.getLicenseVersion())
            .totalQty(request.getTotalQty())
            .usedQty(existing.getUsedQty())
            .purchaseDate(request.getPurchaseDate())
            .expiryDate(request.getExpiryDate())
            .purchasePrice(request.getPurchasePrice())
            .installGuide(request.getInstallGuide())
            .remarks(request.getRemarks())
            .isActive(existing.getIsActive())
            .build();

        updated.setUpdId(updId);
        return LicenseResponse.from(licenseRepository.save(updated));
    }

    @Transactional
    public void deleteLicense(Long licenseId, Long updId) {
        License license = findLicenseOrThrow(licenseId);

        // 배정 중인 라이센스 삭제 불가 (used_qty > 0)
        if (license.getUsedQty() > 0) {
            throw new BusinessException(ErrorCode.LICENSE_004);
        }

        license.softDelete(updId);
    }

    public List<LicenseKeyResponse> getLicenseKeys(Long licenseId) {
        findLicenseOrThrow(licenseId);
        return licenseKeyRepository.findByLicense_LicenseIdAndIsDeletedFalse(licenseId)
            .stream()
            .map(LicenseKeyResponse::from)
            .toList();
    }

    @Transactional
    public LicenseKeyResponse createLicenseKey(Long licenseId, LicenseKeyRequest request, Long regId) {
        License license = findLicenseOrThrow(licenseId);

        LicenseKey key = LicenseKey.builder()
            .license(license)
            .licenseKey(request.getLicenseKey())
            .remarks(request.getRemarks())
            .build();

        key.setRegId(regId);
        key.setUpdId(regId);

        return LicenseKeyResponse.from(licenseKeyRepository.save(key));
    }

    @Transactional
    public LicenseKeyResponse updateLicenseKey(Long keyId, LicenseKeyRequest request, Long updId) {
        LicenseKey key = licenseKeyRepository.findById(keyId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        LicenseKey updated = LicenseKey.builder()
            .keyId(key.getKeyId())
            .license(key.getLicense())
            .licenseKey(request.getLicenseKey())
            .keyStatus(key.getKeyStatus())
            .remarks(request.getRemarks())
            .build();

        updated.setUpdId(updId);
        return LicenseKeyResponse.from(licenseKeyRepository.save(updated));
    }

    public List<LicenseSummaryResponse> getLicenseSummary() {
        return licenseRepository.getLicenseSummary().stream()
            .map(p -> new LicenseSummaryResponse(
                p.getSoftwareid(), p.getSoftwarename(),
                p.getLicenseid(), p.getLicensetype(), p.getLicenseversion(),
                p.getTotalqty(), p.getUsedqty(), p.getRemainqty(),
                p.getExpirydate(), p.getExpirystatus()
            ))
            .toList();
    }

    private License findLicenseOrThrow(Long licenseId) {
        return licenseRepository.findByLicenseIdAndIsDeletedFalse(licenseId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
    }
}
