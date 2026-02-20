package com.assetmanagement.member.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class MemberResignRequest {

    @NotNull(message = "퇴사일은 필수입니다.")
    private LocalDate resignDate;
}
