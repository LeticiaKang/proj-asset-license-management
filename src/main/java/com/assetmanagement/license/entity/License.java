package com.assetmanagement.license.entity;

import com.assetmanagement.global.entity.BaseEntity;
import com.assetmanagement.software.entity.Software;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "license")
public class License extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "license_id")
    private Long licenseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "software_id", nullable = false)
    private Software software;

    @Column(name = "license_type", nullable = false, length = 20)
    private String licenseType;

    @Column(name = "license_version", length = 50)
    private String licenseVersion;

    @Column(name = "total_qty", nullable = false)
    @Builder.Default
    private Integer totalQty = 1;

    @Column(name = "used_qty", nullable = false)
    @Builder.Default
    private Integer usedQty = 0;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "purchase_price", precision = 15, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "install_guide", columnDefinition = "TEXT")
    private String installGuide;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    public int getRemainQty() {
        return totalQty - usedQty;
    }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }
}
