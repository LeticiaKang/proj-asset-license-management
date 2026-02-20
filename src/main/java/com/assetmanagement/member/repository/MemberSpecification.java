package com.assetmanagement.member.repository;

import com.assetmanagement.member.dto.MemberSearchCondition;
import com.assetmanagement.member.entity.Member;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class MemberSpecification {

    private MemberSpecification() {}

    public static Specification<Member> search(MemberSearchCondition condition) {
        return Specification.where(isNotDeleted())
            .and(keywordLike(condition.getKeyword()))
            .and(deptIdEqual(condition.getDeptId()))
            .and(employmentStatusEqual(condition.getEmploymentStatus()));
    }

    private static Specification<Member> isNotDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    private static Specification<Member> keywordLike(String keyword) {
        if (!StringUtils.hasText(keyword)) return null;
        return (root, query, cb) -> cb.or(
            cb.like(root.get("memberName"), "%" + keyword + "%"),
            cb.like(root.get("loginId"), "%" + keyword + "%")
        );
    }

    private static Specification<Member> deptIdEqual(Long deptId) {
        if (deptId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("deptId"), deptId);
    }

    private static Specification<Member> employmentStatusEqual(String status) {
        if (!StringUtils.hasText(status)) return null;
        return (root, query, cb) -> cb.equal(root.get("employmentStatus"), status);
    }
}
