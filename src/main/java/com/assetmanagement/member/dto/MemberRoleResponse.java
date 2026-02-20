package com.assetmanagement.member.dto;

import com.assetmanagement.member.entity.MemberRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberRoleResponse {

    private Long memberRoleId;
    private Long memberId;
    private Long roleId;

    public static MemberRoleResponse from(MemberRole memberRole) {
        return MemberRoleResponse.builder()
            .memberRoleId(memberRole.getMemberRoleId())
            .memberId(memberRole.getMember().getMemberId())
            .roleId(memberRole.getRoleId())
            .build();
    }
}
