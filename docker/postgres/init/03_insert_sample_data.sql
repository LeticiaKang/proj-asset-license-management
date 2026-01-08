-- Asset & License Management System - Sample Data

-- 1. user (사용자)
INSERT INTO "user" (username, password, user_nm, email, dept_cd, position, join_date, user_status, reg_id, reg_date) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자', 'admin@company.com', 'DEPT001-01', '부장', '2020-01-01', 'ACTIVE', 1, CURRENT_TIMESTAMP),
('user1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '홍길동', 'hong@company.com', 'DEPT002-01', '대리', '2022-03-01', 'ACTIVE', 1, CURRENT_TIMESTAMP);

-- 2. user_role (사용자 역할)
INSERT INTO user_role (user_id, role_id, reg_id, reg_date) VALUES
((SELECT user_id FROM "user" WHERE username = 'admin'), (SELECT role_id FROM role WHERE role_cd = 'SUPER_ADMIN'), 1, CURRENT_TIMESTAMP),
((SELECT user_id FROM "user" WHERE username = 'user1'), (SELECT role_id FROM role WHERE role_cd = 'USER'), 1, CURRENT_TIMESTAMP);

-- 3. asset (자산 샘플)
INSERT INTO asset (asset_type, asset_nm, manufacturer, model_nm, serial_number, purchase_date, purchase_amount, warranty_start_date, warranty_end_date, asset_status, current_user_id, note, reg_id, reg_date) VALUES
('MONITOR', 'LG 27인치 모니터', 'LG', '27GL850', 'SN001', '2023-01-15', 450000, '2023-01-15', '2026-01-14', 'AVAILABLE', NULL, NULL, 1, CURRENT_TIMESTAMP),
('DESKTOP', '삼성 데스크톱', '삼성', 'DM530ADA', 'SN002', '2023-02-20', 1200000, '2023-02-20', '2026-02-19', 'AVAILABLE', NULL, NULL, 1, CURRENT_TIMESTAMP),
('LAPTOP', '맥북 프로', 'Apple', 'MacBook Pro 14', 'SN003', '2023-03-10', 2500000, '2023-03-10', '2026-03-09', 'AVAILABLE', NULL, NULL, 1, CURRENT_TIMESTAMP);

-- 4. license (라이센스 샘플)
INSERT INTO license (software_nm, software_version, license_type, total_quantity, available_quantity, license_key, purchase_date, purchase_amount, vendor, contract_start_date, contract_end_date, note, reg_id, reg_date) VALUES
('Microsoft Office', '2019', '볼륨 라이센스', 10, 10, NULL, '2023-01-01', 3000000, 'Microsoft', '2023-01-01', '2025-12-31', NULL, 1, CURRENT_TIMESTAMP),
('한글', '2020', '개인 라이센스', 5, 5, NULL, '2023-01-01', 500000, '한글과컴퓨터', '2023-01-01', '2025-12-31', NULL, 1, CURRENT_TIMESTAMP);
