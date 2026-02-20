package com.assetmanagement.commoncode.repository;

import com.assetmanagement.commoncode.entity.CommonCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {

    List<CommonCode> findByGroupCodeAndIsDeletedFalseAndIsActiveTrueOrderByCodeOrderAsc(String groupCode);

    @Query("SELECT DISTINCT c.groupCode FROM CommonCode c WHERE c.isDeleted = false AND c.isActive = true ORDER BY c.groupCode")
    List<String> findDistinctGroupCodes();

    Optional<CommonCode> findByCodeIdAndIsDeletedFalse(Long codeId);

    boolean existsByGroupCodeAndCodeAndIsDeletedFalse(String groupCode, String code);
}
