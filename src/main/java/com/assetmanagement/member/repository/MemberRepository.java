package com.assetmanagement.member.repository;

import com.assetmanagement.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long>, JpaSpecificationExecutor<Member> {

    Optional<Member> findByLoginIdAndIsDeletedFalse(String loginId);

    boolean existsByLoginId(String loginId);

    boolean existsByDeptIdAndIsDeletedFalse(Long deptId);

    Optional<Member> findByMemberIdAndIsDeletedFalse(Long memberId);
}
