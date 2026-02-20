package com.assetmanagement.global.security;

import com.assetmanagement.member.entity.Member;
import com.assetmanagement.member.entity.MemberRole;
import com.assetmanagement.member.repository.MemberRepository;
import com.assetmanagement.member.repository.MemberRoleRepository;
import com.assetmanagement.role.entity.Role;
import com.assetmanagement.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;
    private final MemberRoleRepository memberRoleRepository;
    private final RoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = memberRepository.findByLoginIdAndIsDeletedFalse(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<MemberRole> memberRoles = memberRoleRepository.findByMember_MemberIdAndIsDeletedFalse(member.getMemberId());

        List<SimpleGrantedAuthority> authorities = memberRoles.stream()
            .map(mr -> roleRepository.findByRoleIdAndIsDeletedFalse(mr.getRoleId())
                .map(Role::getRoleCode)
                .orElse(null))
            .filter(code -> code != null)
            .map(SimpleGrantedAuthority::new)
            .toList();

        return new User(member.getLoginId(), member.getPassword(), authorities);
    }
}
