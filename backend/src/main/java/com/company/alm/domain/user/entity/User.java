package com.company.alm.domain.user.entity;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class User {
    private Long userId;
    private String username;
    private String password;
    private String userNm;
    private String email;
    private String deptCd;
    private String position;
    private LocalDate joinDate;
    private String userStatus;
    private Long regId;
    private LocalDateTime regDate;
    private Long updId;
    private LocalDateTime updDate;
}
