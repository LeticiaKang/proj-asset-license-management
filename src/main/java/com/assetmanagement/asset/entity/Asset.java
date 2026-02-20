package com.assetmanagement.asset.entity;

import com.assetmanagement.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@Table(name = "asset")
public class Asset extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Long assetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private AssetCategory category;

    @Column(name = "asset_name", nullable = false, length = 100)
    private String assetName;

    @Column(name = "manufacturer", length = 100)
    private String manufacturer;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "serial_number", unique = true, length = 100)
    private String serialNumber;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_price", precision = 15, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "warranty_start_date")
    private LocalDate warrantyStartDate;

    @Column(name = "warranty_end_date")
    private LocalDate warrantyEndDate;

    @Column(name = "asset_status", nullable = false, length = 20)
    @Builder.Default
    private String assetStatus = "AVAILABLE";

    @Column(name = "memory", length = 50)
    private String memory;

    @Column(name = "storage", length = 50)
    private String storage;

    @Type(JsonType.class)
    @Column(name = "specs", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> specs = new HashMap<>();

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    private static final Map<String, Set<String>> VALID_TRANSITIONS = Map.of(
        "AVAILABLE", Set.of("IN_USE", "REPAIR", "DISPOSED", "LOST"),
        "IN_USE",    Set.of("AVAILABLE", "REPAIR", "LOST"),
        "REPAIR",    Set.of("AVAILABLE", "DISPOSED", "LOST"),
        "LOST",      Set.of("AVAILABLE")
    );

    public void changeStatus(String newStatus) {
        Set<String> allowed = VALID_TRANSITIONS.get(this.assetStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new IllegalStateException(
                String.format("잘못된 상태 전이: %s → %s", this.assetStatus, newStatus));
        }
        this.assetStatus = newStatus;
    }
}
