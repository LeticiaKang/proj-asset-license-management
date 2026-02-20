-- ============================================================
-- 초기 데이터 시드 (Docker 환경 전용)
-- 실행 순서: 01-schema.sql (DDL) → 02-seed.sql (이 파일)
-- ============================================================

-- ── 1. 기본 부서 ──
INSERT INTO dept (dept_name, dept_code, dept_order, dept_depth, dept_path, is_active)
VALUES ('IT관리팀', 'IT_MGMT', 1, 0, '/1/', true);

-- ── 2. 초기 메뉴 구조 ──
INSERT INTO menu (menu_name, menu_code, menu_url, menu_icon, menu_order, menu_depth, is_active) VALUES
    ('자산 관리',    'ASSET',              NULL,                   'LaptopOutlined',    1, 0, true),
    ('라이센스 관리', 'LICENSE',            NULL,                   'KeyOutlined',       2, 0, true),
    ('사용자 관리',  'MEMBER',             '/members',             'TeamOutlined',      3, 0, true),
    ('부서 관리',    'DEPT',               '/departments',         'ApartmentOutlined', 4, 0, true),
    ('메뉴 관리',    'MENU',               '/menus',               'SettingOutlined',   5, 0, true);

-- 자산 관리 하위 메뉴
INSERT INTO menu (parent_menu_id, menu_name, menu_code, menu_url, menu_order, menu_depth, is_active) VALUES
    ((SELECT menu_id FROM menu WHERE menu_code = 'ASSET'), '자산 목록', 'ASSET_LIST',       '/assets',             1, 1, true),
    ((SELECT menu_id FROM menu WHERE menu_code = 'ASSET'), '자산 배정', 'ASSET_ASSIGNMENT', '/asset-assignments',  2, 1, true);

-- 라이센스 관리 하위 메뉴
INSERT INTO menu (parent_menu_id, menu_name, menu_code, menu_url, menu_order, menu_depth, is_active) VALUES
    ((SELECT menu_id FROM menu WHERE menu_code = 'LICENSE'), '라이센스 목록', 'LICENSE_LIST',       '/licenses',             1, 1, true),
    ((SELECT menu_id FROM menu WHERE menu_code = 'LICENSE'), '라이센스 배정', 'LICENSE_ASSIGNMENT', '/license-assignments',  2, 1, true);

-- ── 3. 관리자 계정 ──
-- 비밀번호: admin1234 (BCrypt encoded)
INSERT INTO member (
    login_id, password, member_name, dept_id, position,
    hire_date, employment_status, work_location, email,
    is_initial_password, is_active
) VALUES (
    'admin',
    '$2b$10$dYZBF4hZqzoHMpWBTN6oMOK65wG2RxJxdkoiLvr/54hnowOZLG0pa',
    '시스템관리자',
    (SELECT dept_id FROM dept WHERE dept_code = 'IT_MGMT'),
    'MANAGER',
    CURRENT_DATE,
    'ACTIVE',
    '본사',
    'admin@company.com',
    false,
    true
);

-- ── 4. 관리자 권한 매핑 ──
INSERT INTO member_role (member_id, role_id) VALUES (
    (SELECT member_id FROM member WHERE login_id = 'admin'),
    (SELECT role_id FROM role WHERE role_code = 'ROLE_ADMIN')
);

-- ── 5. 관리자 권한에 전체 메뉴 CRUD 매핑 ──
INSERT INTO role_menu (role_id, menu_id, can_read, can_create, can_update, can_delete)
SELECT
    (SELECT role_id FROM role WHERE role_code = 'ROLE_ADMIN'),
    m.menu_id,
    true, true, true, true
FROM menu m
WHERE m.is_deleted = false;
