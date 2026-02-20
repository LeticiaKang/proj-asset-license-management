package com.assetmanagement.commoncode.service;

import com.assetmanagement.commoncode.dto.CodeGroupResponse;
import com.assetmanagement.commoncode.dto.CommonCodeResponse;
import com.assetmanagement.commoncode.repository.CommonCodeRepository;
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
}
