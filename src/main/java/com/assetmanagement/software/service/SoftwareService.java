package com.assetmanagement.software.service;

import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import com.assetmanagement.software.dto.SoftwareRequest;
import com.assetmanagement.software.dto.SoftwareResponse;
import com.assetmanagement.software.entity.Software;
import com.assetmanagement.software.repository.SoftwareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SoftwareService {

    private final SoftwareRepository softwareRepository;

    public List<SoftwareResponse> getSoftwares() {
        return softwareRepository.findByIsDeletedFalse().stream()
            .map(SoftwareResponse::from)
            .toList();
    }

    public SoftwareResponse getSoftware(Long softwareId) {
        Software software = findSoftwareOrThrow(softwareId);
        return SoftwareResponse.from(software);
    }

    @Transactional
    public SoftwareResponse createSoftware(SoftwareRequest request, Long regId) {
        Software software = Software.builder()
            .softwareName(request.getSoftwareName())
            .publisher(request.getPublisher())
            .description(request.getDescription())
            .build();

        software.setRegId(regId);
        software.setUpdId(regId);

        return SoftwareResponse.from(softwareRepository.save(software));
    }

    @Transactional
    public SoftwareResponse updateSoftware(Long softwareId, SoftwareRequest request, Long updId) {
        Software existing = findSoftwareOrThrow(softwareId);

        Software updated = Software.builder()
            .softwareId(existing.getSoftwareId())
            .softwareName(request.getSoftwareName())
            .publisher(request.getPublisher())
            .description(request.getDescription())
            .isActive(existing.getIsActive())
            .build();

        updated.setUpdId(updId);
        return SoftwareResponse.from(softwareRepository.save(updated));
    }

    private Software findSoftwareOrThrow(Long softwareId) {
        return softwareRepository.findBySoftwareIdAndIsDeletedFalse(softwareId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
    }
}
