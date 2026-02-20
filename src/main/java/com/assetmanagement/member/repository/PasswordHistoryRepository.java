package com.assetmanagement.member.repository;

import com.assetmanagement.member.entity.PasswordHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasswordHistoryRepository extends JpaRepository<PasswordHistory, Long> {

    List<PasswordHistory> findTop3ByMember_MemberIdOrderByRegDateDesc(Long memberId);
}
