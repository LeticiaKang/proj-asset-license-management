package com.assetmanagement.global.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Column(name = "reg_id", updatable = false)
    private Long regId;

    @CreatedDate
    @Column(name = "reg_date", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @Column(name = "upd_id")
    private Long updId;

    @LastModifiedDate
    @Column(name = "upd_date", nullable = false)
    private LocalDateTime updDate;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    public void setRegId(Long regId) {
        this.regId = regId;
    }

    public void setUpdId(Long updId) {
        this.updId = updId;
    }

    public void softDelete(Long updId) {
        this.isDeleted = true;
        this.updId = updId;
    }
}
