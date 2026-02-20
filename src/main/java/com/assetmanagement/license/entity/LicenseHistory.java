package com.assetmanagement.license.entity;

import com.assetmanagement.global.entity.BaseHistoryEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "license_history")
public class LicenseHistory extends BaseHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @Column(name = "license_id", nullable = false)
    private Long licenseId;

    @Column(name = "key_id")
    private Long keyId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "action_type", nullable = false, length = 20)
    private String actionType;

    @Column(name = "action_date", nullable = false)
    @Builder.Default
    private LocalDateTime actionDate = LocalDateTime.now();

    @Column(name = "assignment_reason", columnDefinition = "TEXT")
    private String assignmentReason;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
}
