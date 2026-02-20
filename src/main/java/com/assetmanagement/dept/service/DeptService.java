package com.assetmanagement.dept.service;

import com.assetmanagement.dept.dto.DeptMoveRequest;
import com.assetmanagement.dept.dto.DeptRequest;
import com.assetmanagement.dept.dto.DeptResponse;
import com.assetmanagement.dept.entity.Dept;
import com.assetmanagement.dept.repository.DeptRepository;
import com.assetmanagement.global.exception.BusinessException;
import com.assetmanagement.global.exception.ErrorCode;
import com.assetmanagement.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeptService {

    private final DeptRepository deptRepository;
    private final MemberRepository memberRepository;

    public List<DeptResponse> getDeptTree() {
        List<Dept> allDepts = deptRepository.findByIsDeletedFalseOrderByDeptOrderAsc();

        Map<Long, DeptResponse> map = new LinkedHashMap<>();
        for (Dept dept : allDepts) {
            map.put(dept.getDeptId(), DeptResponse.from(dept));
        }

        List<DeptResponse> roots = new ArrayList<>();
        for (DeptResponse response : map.values()) {
            if (response.getParentDeptId() == null) {
                roots.add(response);
            } else {
                DeptResponse parent = map.get(response.getParentDeptId());
                if (parent != null) {
                    parent.getChildren().add(response);
                }
            }
        }
        return roots;
    }

    public DeptResponse getDept(Long deptId) {
        return DeptResponse.from(findDeptOrThrow(deptId));
    }

    @Transactional
    public DeptResponse createDept(DeptRequest request, Long regId) {
        int depth = 0;
        String path = "/";

        if (request.getParentDeptId() != null) {
            Dept parent = findDeptOrThrow(request.getParentDeptId());
            depth = parent.getDeptDepth() + 1;
            if (depth > 5) {
                throw new BusinessException(ErrorCode.DEPT_003);
            }
        }

        Dept dept = Dept.builder()
            .parentDeptId(request.getParentDeptId())
            .deptName(request.getDeptName())
            .deptCode(request.getDeptCode())
            .deptOrder(request.getDeptOrder() != null ? request.getDeptOrder() : 0)
            .deptDepth(depth)
            .build();

        dept.setRegId(regId);
        dept.setUpdId(regId);

        Dept saved = deptRepository.save(dept);

        // Materialized Path 설정
        if (request.getParentDeptId() != null) {
            Dept parent = findDeptOrThrow(request.getParentDeptId());
            saved.updatePath(parent.getDeptPath() + saved.getDeptId() + "/");
        } else {
            saved.updatePath("/" + saved.getDeptId() + "/");
        }

        return DeptResponse.from(saved);
    }

    @Transactional
    public DeptResponse updateDept(Long deptId, DeptRequest request, Long updId) {
        Dept existing = findDeptOrThrow(deptId);

        Dept updated = Dept.builder()
            .deptId(existing.getDeptId())
            .parentDeptId(existing.getParentDeptId())
            .deptName(request.getDeptName())
            .deptCode(request.getDeptCode())
            .deptOrder(request.getDeptOrder() != null ? request.getDeptOrder() : existing.getDeptOrder())
            .deptDepth(existing.getDeptDepth())
            .deptPath(existing.getDeptPath())
            .isActive(existing.getIsActive())
            .build();

        updated.setUpdId(updId);
        return DeptResponse.from(deptRepository.save(updated));
    }

    @Transactional
    public void deleteDept(Long deptId, Long updId) {
        Dept dept = findDeptOrThrow(deptId);

        // 하위 부서 존재 확인
        if (deptRepository.existsByParentDeptIdAndIsDeletedFalse(deptId)) {
            throw new BusinessException(ErrorCode.DEPT_001);
        }

        // 소속 사용자 존재 확인
        if (memberRepository.existsByDeptIdAndIsDeletedFalse(deptId)) {
            throw new BusinessException(ErrorCode.DEPT_002);
        }

        dept.softDelete(updId);
    }

    @Transactional
    public DeptResponse moveDept(Long deptId, DeptMoveRequest request, Long updId) {
        Dept dept = findDeptOrThrow(deptId);
        Dept newParent = findDeptOrThrow(request.getNewParentDeptId());

        int newDepth = newParent.getDeptDepth() + 1;
        if (newDepth > 5) {
            throw new BusinessException(ErrorCode.DEPT_003);
        }

        String oldPath = dept.getDeptPath();
        String newPath = newParent.getDeptPath() + dept.getDeptId() + "/";

        dept.move(request.getNewParentDeptId(), newDepth, newPath);
        dept.setUpdId(updId);

        // 하위 부서의 depth, path 자동 재계산
        List<Dept> children = deptRepository.findByDeptPathStartingWithAndIsDeletedFalse(oldPath);
        for (Dept child : children) {
            if (child.getDeptId().equals(deptId)) continue;
            String childNewPath = child.getDeptPath().replace(oldPath, newPath);
            int depthDiff = newDepth - dept.getDeptDepth();
            child.updateDepthAndPath(child.getDeptDepth() + depthDiff, childNewPath);
            child.setUpdId(updId);
        }

        return DeptResponse.from(dept);
    }

    private Dept findDeptOrThrow(Long deptId) {
        return deptRepository.findByDeptIdAndIsDeletedFalse(deptId)
            .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_003));
    }
}
