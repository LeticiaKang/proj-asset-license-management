package com.assetmanagement.menu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MenuRequest {

    private Long parentMenuId;

    @NotBlank(message = "메뉴명은 필수입니다")
    @Size(max = 100)
    private String menuName;

    @NotBlank(message = "메뉴 코드는 필수입니다")
    @Size(max = 50)
    private String menuCode;

    @Size(max = 255)
    private String menuUrl;

    @Size(max = 100)
    private String menuIcon;

    private Integer menuOrder;

    @Size(max = 255)
    private String description;
}
