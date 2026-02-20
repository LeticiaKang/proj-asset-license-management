package com.assetmanagement.asset.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public class AssetReturnRequest {

    private LocalDate returnDate;
    private String remarks;
}
