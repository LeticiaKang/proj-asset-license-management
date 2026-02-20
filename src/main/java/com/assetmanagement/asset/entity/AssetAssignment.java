package com.assetmanagement.asset.entity;

import com.assetmanagement.global.entity.BaseEntity;
import com.assetmanagement.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "asset_assignment")
public class AssetAssignment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "assignment_status", nullable = false, length = 20)
    @Builder.Default
    private String assignmentStatus = "ASSIGNED";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    public void returnAsset() {
        this.assignmentStatus = "RETURNED";
        this.returnDate = LocalDate.now();
    }
}
