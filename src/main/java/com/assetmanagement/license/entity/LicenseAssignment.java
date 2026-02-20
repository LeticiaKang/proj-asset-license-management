package com.assetmanagement.license.entity;

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
@Table(name = "license_assignment")
public class LicenseAssignment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "license_id", nullable = false)
    private License license;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "key_id")
    private LicenseKey licenseKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "assignment_reason", nullable = false, columnDefinition = "TEXT")
    private String assignmentReason;

    @Column(name = "assignment_status", nullable = false, length = 20)
    @Builder.Default
    private String assignmentStatus = "ASSIGNED";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    public void returnLicense() {
        this.assignmentStatus = "RETURNED";
        this.returnDate = LocalDate.now();
    }

    public void expire() {
        this.assignmentStatus = "EXPIRED";
        this.returnDate = LocalDate.now();
    }
}
