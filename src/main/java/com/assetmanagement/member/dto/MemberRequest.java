package com.assetmanagement.member.dto;

import com.assetmanagement.member.entity.Member;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class MemberRequest {

    @NotBlank(message = "로그인 ID는 필수입니다")
    @Size(max = 50, message = "로그인 ID는 50자 이하여야 합니다")
    @Pattern(regexp = "^[a-z0-9.]+$", message = "로그인 ID는 영문 소문자, 숫자, 점(.)만 허용합니다")
    private String loginId;

    @Size(min = 8, max = 255, message = "비밀번호는 8자 이상이어야 합니다")
    private String password;

    @NotBlank(message = "사용자명은 필수입니다")
    @Size(max = 50, message = "사용자명은 50자 이하여야 합니다")
    private String memberName;

    @NotNull(message = "부서는 필수입니다")
    private Long deptId;

    @NotBlank(message = "직급은 필수입니다")
    @Size(max = 50, message = "직급은 50자 이하여야 합니다")
    private String position;

    @Size(max = 100, message = "담당업무는 100자 이하여야 합니다")
    private String jobTitle;

    @NotNull(message = "입사일은 필수입니다")
    private LocalDate hireDate;

    @NotBlank(message = "근무지는 필수입니다")
    @Size(max = 100, message = "근무지는 100자 이하여야 합니다")
    private String workLocation;

    @Size(max = 100, message = "이메일은 100자 이하여야 합니다")
    private String email;

    @Size(max = 20, message = "연락처는 20자 이하여야 합니다")
    private String phone;

    public Member toEntity(String encodedPassword) {
        return Member.builder()
            .loginId(loginId)
            .password(encodedPassword)
            .memberName(memberName)
            .deptId(deptId)
            .position(position)
            .jobTitle(jobTitle)
            .hireDate(hireDate)
            .workLocation(workLocation)
            .email(email)
            .phone(phone)
            .build();
    }
}
