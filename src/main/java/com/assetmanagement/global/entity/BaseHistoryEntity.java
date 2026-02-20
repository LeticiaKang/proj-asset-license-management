package com.assetmanagement.global.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
public abstract class BaseHistoryEntity {

    @Column(name = "reg_id")
    private Long regId;

    @Column(name = "reg_date", nullable = false, updatable = false)
    private LocalDateTime regDate = LocalDateTime.now();

    public void setRegId(Long regId) {
        this.regId = regId;
    }
}
