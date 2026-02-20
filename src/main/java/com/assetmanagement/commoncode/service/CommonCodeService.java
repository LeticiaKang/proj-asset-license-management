package com.assetmanagement.commoncode.service;

import com.assetmanagement.commoncode.dto.CodeGroupResponse;
import com.assetmanagement.commoncode.dto.CommonCodeRequest;
import com.assetmanagement.commoncode.dto.CommonCodeResponse;
import com.assetmanagement.commoncode.entity.CommonCode;
import com.assetmanagement.commoncode.repository.CommonCodeRepository;
import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommonCodeService {

    private final CommonCodeRepository commonCodeRepository;

    public List<CodeGroupResponse> getCodeGroups() {
        List<String> groupCodes = commonCodeRepository.findDistinctGroupCodes();
        return groupCodes.stream()
            .map(gc -> CodeGroupResponse.builder()
                .groupCode(gc)
                .build())
            .toList();
    }

    public List<CommonCodeResponse> getCodesByGroup(String groupCode) {
        return commonCodeRepository
            .findByGroupCodeAndIsDeletedFalseAndIsActiveTrueOrderByCodeOrderAsc(groupCode)
            .stream()
            .map(CommonCodeResponse::from)
            .toList();
    }

    @Transactional
    public CommonCodeResponse createCode(CommonCodeRequest request, Long regId) {
        // 동일 그룹 내 코드 중복 체크
        if (commonCodeRepository.existsByGroupCodeAndCodeAndIsDeletedFalse(
                request.getGroupCode(), request.getCode())) {
            throw new BusinessException(ErrorCode.COMMON_002, "동일 그룹 내 중복 코드가 존재합니다.");
        }

        CommonCode code = CommonCode.builder()
            .groupCode(request.getGroupCode())
            .code(request.getCode())
            .codeName(request.getCodeName())
            .codeOrder(request.getCodeOrder() != null ? request.getCodeOrder() : 0)
            .description(request.getDescription())
            .build();

        code.setRegId(regId);
        code.setUpdId(regId);

        return CommonCodeResponse.from(commonCodeRepository.save(code));
    }

    @Transactional
    public CommonCodeResponse updateCode(Long codeId, CommonCodeRequest request, Long updId) {
        CommonCode existing = findCodeOrThrow(codeId);

        CommonCode updated = CommonCode.builder()
            .codeId(existing.getCodeId())
            .groupCode(existing.getGroupCode())
            .code(existing.getCode())
            .codeName(request.getCodeName())
            .codeOrder(request.getCodeOrder() != null ? request.getCodeOrder() : existing.getCodeOrder())
            .description(request.getDescription())
            .isActive(existing.getIsActive())
            .build();

        updated.setUpdId(updId);
        return CommonCodeResponse.from(commonCodeRepository.save(updated));
    }

    @Transactional
    public void deleteCode(Long codeId, Long updId) {
        CommonCode code = findCodeOrThrow(codeId);
        // 정책 1.4: 코드 삭제 불가, is_active = false로 비활성화만 가능
        code.deactivate(updId);
    }

    private CommonCode findCodeOrThrow(Long codeId) {
        return commonCodeRepository.findByCodeIdAndIsDeletedFalse(codeId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
    }
}
