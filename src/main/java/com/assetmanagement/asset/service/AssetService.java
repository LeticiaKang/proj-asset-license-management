package com.assetmanagement.asset.service;

import com.assetmanagement.asset.dto.*;
import com.assetmanagement.asset.entity.Asset;
import com.assetmanagement.asset.entity.AssetCategory;
import com.assetmanagement.asset.repository.AssetCategoryRepository;
import com.assetmanagement.asset.repository.AssetHistoryRepository;
import com.assetmanagement.asset.repository.AssetRepository;
import com.assetmanagement.asset.repository.AssetSpecification;
import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetCategoryRepository assetCategoryRepository;
    private final AssetHistoryRepository assetHistoryRepository;

    public Page<AssetResponse> getAssets(AssetSearchCondition condition, Pageable pageable) {
        return assetRepository.findAll(AssetSpecification.search(condition), pageable)
            .map(AssetResponse::from);
    }

    public AssetResponse getAsset(Long assetId) {
        Asset asset = findAssetOrThrow(assetId);
        return AssetResponse.from(asset);
    }

    @Transactional
    public AssetResponse createAsset(AssetRequest request, Long regId) {
        // 시리얼번호 중복 체크
        if (request.getSerialNumber() != null
                && assetRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new BusinessException(ErrorCode.ASSET_004);
        }

        AssetCategory category = assetCategoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        Asset asset = Asset.builder()
            .category(category)
            .assetName(request.getAssetName())
            .manufacturer(request.getManufacturer())
            .modelName(request.getModelName())
            .serialNumber(request.getSerialNumber())
            .purchaseDate(request.getPurchaseDate())
            .purchasePrice(request.getPurchasePrice())
            .warrantyStartDate(request.getWarrantyStartDate())
            .warrantyEndDate(request.getWarrantyEndDate())
            .memory(request.getMemory())
            .storage(request.getStorage())
            .specs(request.getSpecs())
            .remarks(request.getRemarks())
            .build();

        asset.setRegId(regId);
        asset.setUpdId(regId);

        return AssetResponse.from(assetRepository.save(asset));
    }

    @Transactional
    public AssetResponse updateAsset(Long assetId, AssetRequest request, Long updId) {
        Asset asset = findAssetOrThrow(assetId);

        // 시리얼번호 변경 시 중복 체크
        if (request.getSerialNumber() != null
                && !request.getSerialNumber().equals(asset.getSerialNumber())
                && assetRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new BusinessException(ErrorCode.ASSET_004);
        }

        AssetCategory category = assetCategoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));

        // 새 객체를 만들어 업데이트하는 대신, 기존 Entity의 필드를 직접 수정
        Asset updated = Asset.builder()
            .assetId(asset.getAssetId())
            .category(category)
            .assetName(request.getAssetName())
            .manufacturer(request.getManufacturer())
            .modelName(request.getModelName())
            .serialNumber(request.getSerialNumber())
            .purchaseDate(request.getPurchaseDate())
            .purchasePrice(request.getPurchasePrice())
            .warrantyStartDate(request.getWarrantyStartDate())
            .warrantyEndDate(request.getWarrantyEndDate())
            .assetStatus(asset.getAssetStatus())
            .memory(request.getMemory())
            .storage(request.getStorage())
            .specs(request.getSpecs())
            .remarks(request.getRemarks())
            .build();

        updated.setUpdId(updId);
        return AssetResponse.from(assetRepository.save(updated));
    }

    @Transactional
    public void deleteAsset(Long assetId, Long updId) {
        Asset asset = findAssetOrThrow(assetId);

        // 배정 중(IN_USE)인 자산은 삭제 불가
        if ("IN_USE".equals(asset.getAssetStatus())) {
            throw new BusinessException(ErrorCode.ASSET_003);
        }

        asset.softDelete(updId);
    }

    public List<AssetHistoryResponse> getAssetHistory(Long assetId) {
        findAssetOrThrow(assetId);
        return assetHistoryRepository.findByAssetIdOrderByActionDateDesc(assetId)
            .stream()
            .map(AssetHistoryResponse::from)
            .toList();
    }

    public List<AssetCategoryResponse> getCategories() {
        return assetCategoryRepository
            .findByIsDeletedFalseAndIsActiveTrueOrderByCategoryOrder()
            .stream()
            .map(AssetCategoryResponse::from)
            .toList();
    }

    @Transactional
    public AssetCategoryResponse createCategory(AssetCategoryRequest request, Long regId) {
        AssetCategory parentCategory = null;
        if (request.getParentCategoryId() != null) {
            parentCategory = findCategoryOrThrow(request.getParentCategoryId());
        }

        AssetCategory category = AssetCategory.builder()
            .categoryName(request.getCategoryName())
            .categoryCode(request.getCategoryCode())
            .parentCategory(parentCategory)
            .categoryOrder(request.getCategoryOrder() != null ? request.getCategoryOrder() : 0)
            .build();

        category.setRegId(regId);
        category.setUpdId(regId);

        return AssetCategoryResponse.from(assetCategoryRepository.save(category));
    }

    @Transactional
    public AssetCategoryResponse updateCategory(Long categoryId, AssetCategoryRequest request, Long updId) {
        AssetCategory existing = findCategoryOrThrow(categoryId);

        AssetCategory parentCategory = null;
        if (request.getParentCategoryId() != null) {
            parentCategory = findCategoryOrThrow(request.getParentCategoryId());
        }

        AssetCategory updated = AssetCategory.builder()
            .categoryId(existing.getCategoryId())
            .categoryName(request.getCategoryName())
            .categoryCode(request.getCategoryCode())
            .parentCategory(parentCategory)
            .categoryOrder(request.getCategoryOrder() != null ? request.getCategoryOrder() : existing.getCategoryOrder())
            .isActive(existing.getIsActive())
            .build();

        updated.setUpdId(updId);
        return AssetCategoryResponse.from(assetCategoryRepository.save(updated));
    }

    @Transactional
    public void deleteCategory(Long categoryId, Long updId) {
        AssetCategory category = findCategoryOrThrow(categoryId);

        // 하위 카테고리 존재 확인
        if (assetCategoryRepository.existsByParentCategory_CategoryIdAndIsDeletedFalse(categoryId)) {
            throw new BusinessException(ErrorCode.COMMON_002, "하위 카테고리가 존재하여 삭제할 수 없습니다.");
        }

        category.softDelete(updId);
    }

    public List<AssetSummaryResponse> getAssetSummary() {
        return assetRepository.getAssetSummary();
    }

    private AssetCategory findCategoryOrThrow(Long categoryId) {
        return assetCategoryRepository.findByCategoryIdAndIsDeletedFalse(categoryId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
    }

    private Asset findAssetOrThrow(Long assetId) {
        return assetRepository.findByAssetIdAndIsDeletedFalse(assetId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
    }
}
