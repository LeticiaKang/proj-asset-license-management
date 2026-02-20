package com.assetmanagement.license.entity;

import com.assetmanagement.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.Map;
import java.util.Set;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "license_key")
public class LicenseKey extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "key_id")
    private Long keyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "license_id", nullable = false)
    private License license;

    @Column(name = "license_key", nullable = false, length = 500)
    private String licenseKey;

    @Column(name = "key_status", nullable = false, length = 20)
    @Builder.Default
    private String keyStatus = "AVAILABLE";

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    private static final Map<String, Set<String>> VALID_TRANSITIONS = Map.of(
        "AVAILABLE", Set.of("IN_USE", "EXPIRED", "REVOKED"),
        "IN_USE",    Set.of("AVAILABLE", "EXPIRED", "REVOKED")
    );

    public void changeStatus(String newStatus) {
        Set<String> allowed = VALID_TRANSITIONS.get(this.keyStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new IllegalStateException(
                String.format("잘못된 키 상태 전이: %s → %s", this.keyStatus, newStatus));
        }
        this.keyStatus = newStatus;
    }
}
