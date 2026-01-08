-- Asset & License Management System - Basic Data

-- 1. department (부서)
INSERT INTO department (dept_cd, dept_nm, full_dept_nm, dept_level, up_dept_cd, use_yn, display_order, reg_id, reg_date) VALUES
('DEPT001', '경영지원본부', '경영지원본부', 1, NULL, 'Y', 1, 1, CURRENT_TIMESTAMP),
('DEPT002', '개발본부', '개발본부', 1, NULL, 'Y', 2, 1, CURRENT_TIMESTAMP),
('DEPT001-01', '인사팀', '경영지원본부 > 인사팀', 2, 'DEPT001', 'Y', 1, 1, CURRENT_TIMESTAMP),
('DEPT001-02', '총무팀', '경영지원본부 > 총무팀', 2, 'DEPT001', 'Y', 2, 1, CURRENT_TIMESTAMP),
('DEPT002-01', '개발1팀', '개발본부 > 개발1팀', 2, 'DEPT002', 'Y', 1, 1, CURRENT_TIMESTAMP);

-- 2. role (역할)
INSERT INTO role (role_cd, role_nm, description, reg_id, reg_date) VALUES
('SUPER_ADMIN', '최고관리자', '모든 기능 접근 권한', 1, CURRENT_TIMESTAMP),
('HR_MANAGER', '인사담당자', '사용자 관리 및 모든 자산/라이센스 조회', 1, CURRENT_TIMESTAMP),
('ASSET_MANAGER', '자산관리자', '자산 전체 관리', 1, CURRENT_TIMESTAMP),
('SW_MANAGER', '소프트웨어관리자', '라이센스 전체 관리', 1, CURRENT_TIMESTAMP),
('USER', '일반사용자', '본인 보유 자산/라이센스 조회', 1, CURRENT_TIMESTAMP);

-- 3. menu (메뉴)
-- 1단계 메뉴
INSERT INTO menu (menu_cd, menu_nm, parent_menu_id, menu_path, menu_icon, display_order, use_yn, reg_id, reg_date) VALUES
('DASHBOARD', '대시보드', NULL, '/dashboard', 'dashboard', 1, 'Y', 1, CURRENT_TIMESTAMP),
('USER', '사용자관리', NULL, NULL, 'users', 2, 'Y', 1, CURRENT_TIMESTAMP),
('ASSET', '자산관리', NULL, NULL, 'monitor', 3, 'Y', 1, CURRENT_TIMESTAMP),
('LICENSE', '라이센스관리', NULL, NULL, 'key', 4, 'Y', 1, CURRENT_TIMESTAMP);

-- 2단계 메뉴
INSERT INTO menu (menu_cd, menu_nm, parent_menu_id, menu_path, menu_icon, display_order, use_yn, reg_id, reg_date) VALUES
('USER_LIST', '사용자목록', (SELECT menu_id FROM menu WHERE menu_cd = 'USER'), '/user/list', NULL, 1, 'Y', 1, CURRENT_TIMESTAMP),
('USER_CREATE', '사용자등록', (SELECT menu_id FROM menu WHERE menu_cd = 'USER'), '/user/create', NULL, 2, 'Y', 1, CURRENT_TIMESTAMP),
('ASSET_LIST', '자산목록', (SELECT menu_id FROM menu WHERE menu_cd = 'ASSET'), '/asset/list', NULL, 1, 'Y', 1, CURRENT_TIMESTAMP),
('ASSET_CREATE', '자산등록', (SELECT menu_id FROM menu WHERE menu_cd = 'ASSET'), '/asset/create', NULL, 2, 'Y', 1, CURRENT_TIMESTAMP),
('LICENSE_LIST', '라이센스목록', (SELECT menu_id FROM menu WHERE menu_cd = 'LICENSE'), '/license/list', NULL, 1, 'Y', 1, CURRENT_TIMESTAMP),
('LICENSE_CREATE', '라이센스등록', (SELECT menu_id FROM menu WHERE menu_cd = 'LICENSE'), '/license/create', NULL, 2, 'Y', 1, CURRENT_TIMESTAMP),
('LICENSE_DASHBOARD', '라이센스현황', (SELECT menu_id FROM menu WHERE menu_cd = 'LICENSE'), '/license/dashboard', NULL, 3, 'Y', 1, CURRENT_TIMESTAMP);
