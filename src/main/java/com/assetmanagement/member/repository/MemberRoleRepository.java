package com.assetmanagement.member.repository;

import com.assetmanagement.member.entity.MemberRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberRoleRepository extends JpaRepository<MemberRole, Long> {

    List<MemberRole> findByMember_MemberIdAndIsDeletedFalse(Long memberId);
}
