package com.assetmanagement.member.entity;

import com.assetmanagement.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "member")
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long memberId;

    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "member_name", nullable = false, length = 50)
    private String memberName;

    @Column(name = "dept_id")
    private Long deptId;

    @Column(name = "position", length = 50)
    private String position;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "resign_date")
    private LocalDate resignDate;

    @Column(name = "employment_status", nullable = false, length = 20)
    @Builder.Default
    private String employmentStatus = "ACTIVE";

    @Column(name = "work_location", length = 100)
    private String workLocation;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "login_fail_count", nullable = false)
    @Builder.Default
    private Integer loginFailCount = 0;

    @Column(name = "is_locked", nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    @Column(name = "is_initial_password", nullable = false)
    @Builder.Default
    private Boolean isInitialPassword = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
        this.passwordChangedAt = LocalDateTime.now();
        this.isInitialPassword = false;
    }

    private static final Map<String, Set<String>> VALID_TRANSITIONS = Map.of(
        "ACTIVE",   Set.of("LEAVE", "RESIGNED"),
        "LEAVE",    Set.of("ACTIVE", "RESIGNED")
    );

    public void changeEmploymentStatus(String newStatus) {
        Set<String> allowed = VALID_TRANSITIONS.get(this.employmentStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new IllegalStateException(
                String.format("잘못된 상태 전이: %s → %s", this.employmentStatus, newStatus));
        }
        this.employmentStatus = newStatus;
    }

    public void resign(LocalDate resignDate) {
        this.resignDate = resignDate;
        this.employmentStatus = "RESIGNED";
        this.isActive = false;
    }

    public void incrementLoginFailCount() {
        this.loginFailCount++;
        if (this.loginFailCount >= 5) {
            this.isLocked = true;
            this.lockedAt = LocalDateTime.now();
        }
    }

    public void resetLoginFailCount() {
        this.loginFailCount = 0;
        this.isLocked = false;
        this.lockedAt = null;
    }

    public void unlock() {
        this.isLocked = false;
        this.lockedAt = null;
        this.loginFailCount = 0;
    }
}
