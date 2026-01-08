-- Asset & License Management System - Database Schema

-- 1. department (부서)
CREATE TABLE department (
    dept_cd VARCHAR(20) PRIMARY KEY,
    dept_nm VARCHAR(100) NOT NULL,
    full_dept_nm VARCHAR(300) NOT NULL,
    dept_level INT NOT NULL,
    up_dept_cd VARCHAR(20) REFERENCES department(dept_cd),
    use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
    display_order INT,
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE department IS '부서';
COMMENT ON COLUMN department.dept_cd IS '부서코드';
COMMENT ON COLUMN department.dept_nm IS '부서명';
COMMENT ON COLUMN department.full_dept_nm IS '전체부서명';
COMMENT ON COLUMN department.dept_level IS '부서레벨';
COMMENT ON COLUMN department.up_dept_cd IS '상위부서코드';
COMMENT ON COLUMN department.use_yn IS '사용여부';
COMMENT ON COLUMN department.display_order IS '표시순서';

CREATE INDEX idx_department_up_dept_cd ON department(up_dept_cd);
CREATE INDEX idx_department_use_yn ON department(use_yn);

-- 2. role (역할)
CREATE TABLE role (
    role_id BIGSERIAL PRIMARY KEY,
    role_cd VARCHAR(50) UNIQUE NOT NULL,
    role_nm VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE role IS '역할';
COMMENT ON COLUMN role.role_id IS '역할ID';
COMMENT ON COLUMN role.role_cd IS '역할코드';
COMMENT ON COLUMN role.role_nm IS '역할명';
COMMENT ON COLUMN role.description IS '설명';

CREATE INDEX idx_role_cd ON role(role_cd);

-- 3. user (사용자)
CREATE TABLE "user" (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_nm VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    dept_cd VARCHAR(20) REFERENCES department(dept_cd),
    position VARCHAR(50),
    join_date DATE,
    user_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (user_status IN ('ACTIVE', 'INACTIVE', 'RESIGNED')),
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE "user" IS '사용자';
COMMENT ON COLUMN "user".user_id IS '사용자ID';
COMMENT ON COLUMN "user".username IS '사용자명(로그인ID)';
COMMENT ON COLUMN "user".password IS '비밀번호';
COMMENT ON COLUMN "user".user_nm IS '이름';
COMMENT ON COLUMN "user".email IS '이메일';
COMMENT ON COLUMN "user".dept_cd IS '부서코드';
COMMENT ON COLUMN "user".position IS '직급';
COMMENT ON COLUMN "user".join_date IS '입사일';
COMMENT ON COLUMN "user".user_status IS '사용자상태';

CREATE INDEX idx_user_username ON "user"(username);
CREATE INDEX idx_user_dept_cd ON "user"(dept_cd);
CREATE INDEX idx_user_status ON "user"(user_status);

-- 4. user_role (사용자별 역할)
CREATE TABLE user_role (
    user_role_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "user"(user_id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES role(role_id) ON DELETE CASCADE,
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role_id)
);

COMMENT ON TABLE user_role IS '사용자별 역할';
COMMENT ON COLUMN user_role.user_role_id IS '사용자역할ID';
COMMENT ON COLUMN user_role.user_id IS '사용자ID';
COMMENT ON COLUMN user_role.role_id IS '역할ID';

CREATE INDEX idx_user_role_user_id ON user_role(user_id);
CREATE INDEX idx_user_role_role_id ON user_role(role_id);

-- 5. menu (메뉴)
CREATE TABLE menu (
    menu_id BIGSERIAL PRIMARY KEY,
    menu_cd VARCHAR(50) UNIQUE NOT NULL,
    menu_nm VARCHAR(100) NOT NULL,
    parent_menu_id BIGINT REFERENCES menu(menu_id),
    menu_path VARCHAR(255),
    menu_icon VARCHAR(50),
    display_order INT,
    use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE menu IS '메뉴';
COMMENT ON COLUMN menu.menu_id IS '메뉴ID';
COMMENT ON COLUMN menu.menu_cd IS '메뉴코드';
COMMENT ON COLUMN menu.menu_nm IS '메뉴명';
COMMENT ON COLUMN menu.parent_menu_id IS '상위메뉴ID';
COMMENT ON COLUMN menu.menu_path IS '메뉴경로';
COMMENT ON COLUMN menu.menu_icon IS '메뉴아이콘';
COMMENT ON COLUMN menu.display_order IS '표시순서';
COMMENT ON COLUMN menu.use_yn IS '사용여부';

CREATE INDEX idx_menu_parent_menu_id ON menu(parent_menu_id);
CREATE INDEX idx_menu_use_yn ON menu(use_yn);

-- 6. role_menu (역할별 메뉴 권한)
CREATE TABLE role_menu (
    role_menu_id BIGSERIAL PRIMARY KEY,
    role_id BIGINT REFERENCES role(role_id) ON DELETE CASCADE,
    menu_id BIGINT REFERENCES menu(menu_id) ON DELETE CASCADE,
    can_read BOOLEAN DEFAULT TRUE,
    can_create BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, menu_id)
);

COMMENT ON TABLE role_menu IS '역할별 메뉴 권한';
COMMENT ON COLUMN role_menu.role_menu_id IS '역할메뉴ID';
COMMENT ON COLUMN role_menu.role_id IS '역할ID';
COMMENT ON COLUMN role_menu.menu_id IS '메뉴ID';
COMMENT ON COLUMN role_menu.can_read IS '조회권한';
COMMENT ON COLUMN role_menu.can_create IS '생성권한';
COMMENT ON COLUMN role_menu.can_update IS '수정권한';
COMMENT ON COLUMN role_menu.can_delete IS '삭제권한';

CREATE INDEX idx_role_menu_role_id ON role_menu(role_id);
CREATE INDEX idx_role_menu_menu_id ON role_menu(menu_id);

-- 7. asset (자산)
CREATE TABLE asset (
    asset_id BIGSERIAL PRIMARY KEY,
    asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('MONITOR', 'DESKTOP', 'LAPTOP')),
    asset_nm VARCHAR(200) NOT NULL,
    manufacturer VARCHAR(100),
    model_nm VARCHAR(100),
    serial_number VARCHAR(100),
    purchase_date DATE,
    purchase_amount DECIMAL(15, 2),
    warranty_start_date DATE,
    warranty_end_date DATE,
    asset_status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (asset_status IN ('AVAILABLE', 'IN_USE', 'REPAIR', 'DISPOSED')),
    current_user_id BIGINT REFERENCES "user"(user_id),
    note TEXT,
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE asset IS '자산';
COMMENT ON COLUMN asset.asset_id IS '자산ID';
COMMENT ON COLUMN asset.asset_type IS '자산유형';
COMMENT ON COLUMN asset.asset_nm IS '자산명';
COMMENT ON COLUMN asset.manufacturer IS '제조사';
COMMENT ON COLUMN asset.model_nm IS '모델명';
COMMENT ON COLUMN asset.serial_number IS '시리얼번호';
COMMENT ON COLUMN asset.purchase_date IS '구매일';
COMMENT ON COLUMN asset.purchase_amount IS '구매금액';
COMMENT ON COLUMN asset.warranty_start_date IS '보증시작일';
COMMENT ON COLUMN asset.warranty_end_date IS '보증종료일';
COMMENT ON COLUMN asset.asset_status IS '자산상태';
COMMENT ON COLUMN asset.current_user_id IS '현재사용자ID';
COMMENT ON COLUMN asset.note IS '비고';

CREATE INDEX idx_asset_type ON asset(asset_type);
CREATE INDEX idx_asset_status ON asset(asset_status);
CREATE INDEX idx_asset_current_user_id ON asset(current_user_id);
CREATE INDEX idx_asset_serial_number ON asset(serial_number);

-- 8. asset_history (자산 히스토리)
CREATE TABLE asset_history (
    history_id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT REFERENCES asset(asset_id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('ASSIGN', 'RECOVER', 'UPDATE', 'REPAIR', 'DISPOSE')),
    target_user_id BIGINT REFERENCES "user"(user_id),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE asset_history IS '자산 히스토리';
COMMENT ON COLUMN asset_history.history_id IS '히스토리ID';
COMMENT ON COLUMN asset_history.asset_id IS '자산ID';
COMMENT ON COLUMN asset_history.action_type IS '액션유형';
COMMENT ON COLUMN asset_history.target_user_id IS '대상사용자ID';
COMMENT ON COLUMN asset_history.action_date IS '액션일시';
COMMENT ON COLUMN asset_history.note IS '비고';

CREATE INDEX idx_asset_history_asset_id ON asset_history(asset_id);
CREATE INDEX idx_asset_history_target_user_id ON asset_history(target_user_id);
CREATE INDEX idx_asset_history_action_date ON asset_history(action_date);

-- 9. license (라이센스)
CREATE TABLE license (
    license_id BIGSERIAL PRIMARY KEY,
    software_nm VARCHAR(200) NOT NULL,
    software_version VARCHAR(50),
    license_type VARCHAR(50),
    total_quantity INT NOT NULL,
    available_quantity INT NOT NULL,
    license_key TEXT,
    purchase_date DATE,
    purchase_amount DECIMAL(15, 2),
    vendor VARCHAR(100),
    contract_start_date DATE,
    contract_end_date DATE,
    note TEXT,
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE license IS '라이센스';
COMMENT ON COLUMN license.license_id IS '라이센스ID';
COMMENT ON COLUMN license.software_nm IS '소프트웨어명';
COMMENT ON COLUMN license.software_version IS '소프트웨어버전';
COMMENT ON COLUMN license.license_type IS '라이센스유형';
COMMENT ON COLUMN license.total_quantity IS '총수량';
COMMENT ON COLUMN license.available_quantity IS '가용수량';
COMMENT ON COLUMN license.license_key IS '라이센스키';
COMMENT ON COLUMN license.purchase_date IS '구매일';
COMMENT ON COLUMN license.purchase_amount IS '구매금액';
COMMENT ON COLUMN license.vendor IS '공급업체';
COMMENT ON COLUMN license.contract_start_date IS '계약시작일';
COMMENT ON COLUMN license.contract_end_date IS '계약종료일';
COMMENT ON COLUMN license.note IS '비고';

CREATE INDEX idx_license_software_nm ON license(software_nm);
CREATE INDEX idx_license_contract_end_date ON license(contract_end_date);

-- 10. license_assignment (라이센스 할당)
CREATE TABLE license_assignment (
	assignment_id       BIGSERIAL PRIMARY KEY,
	license_id          BIGINT NOT NULL REFERENCES license(license_id),
	user_id             BIGINT NOT NULL REFERENCES "user"(user_id),
	assigned_date       DATE NOT NULL,
	assigned_reason     TEXT NOT NULL,
	recovered_date      DATE,
	recovered_reason    TEXT,
	is_active           BOOLEAN DEFAULT TRUE,
	reg_id              BIGINT,
	reg_date            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	upd_id              BIGINT,
	upd_date            TIMESTAMP
);

CREATE INDEX idx_license_assignment_license ON license_assignment(license_id);
CREATE INDEX idx_license_assignment_user ON license_assignment(user_id);
CREATE UNIQUE INDEX idx_license_assignment_active ON license_assignment(license_id, user_id, is_active) 
WHERE is_active = TRUE;

COMMENT ON TABLE license_assignment IS '라이센스 할당';
COMMENT ON COLUMN license_assignment.assignment_id IS '할당ID';
COMMENT ON COLUMN license_assignment.license_id IS '라이센스ID';
COMMENT ON COLUMN license_assignment.user_id IS '사용자ID';
COMMENT ON COLUMN license_assignment.assigned_date IS '할당일시';
COMMENT ON COLUMN license_assignment.is_active IS '활성여부';
COMMENT ON COLUMN license_assignment.note IS '비고';

-- 11. license_history (라이센스 히스토리)
CREATE TABLE license_history (
    history_id BIGSERIAL PRIMARY KEY,
    license_id BIGINT REFERENCES license(license_id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('ASSIGN', 'RECOVER', 'UPDATE')),
    target_user_id BIGINT REFERENCES "user"(user_id),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    reg_id BIGINT,
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    upd_id BIGINT,
    upd_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE license_history IS '라이센스 히스토리';
COMMENT ON COLUMN license_history.history_id IS '히스토리ID';
COMMENT ON COLUMN license_history.license_id IS '라이센스ID';
COMMENT ON COLUMN license_history.action_type IS '액션유형';
COMMENT ON COLUMN license_history.target_user_id IS '대상사용자ID';
COMMENT ON COLUMN license_history.action_date IS '액션일시';
COMMENT ON COLUMN license_history.note IS '비고';

CREATE INDEX idx_license_history_license_id ON license_history(license_id);
CREATE INDEX idx_license_history_target_user_id ON license_history(target_user_id);
CREATE INDEX idx_license_history_action_date ON license_history(action_date);

--- asset_assignment
CREATE TABLE asset_assignment (
	assignment_id       BIGSERIAL PRIMARY KEY,
	asset_id            BIGINT NOT NULL REFERENCES asset(asset_id),
	user_id             BIGINT NOT NULL REFERENCES "user"(user_id),
	assigned_date       DATE NOT NULL,
	recovered_date      DATE,
	is_active           BOOLEAN DEFAULT TRUE,
	reason              TEXT NOT NULL,
	reg_id              BIGINT,
	reg_date            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	upd_id              BIGINT,
	upd_date            TIMESTAMP
);

CREATE INDEX idx_asset_assignment_asset ON asset_assignment(asset_id);
CREATE INDEX idx_asset_assignment_user ON asset_assignment(user_id);
CREATE UNIQUE INDEX idx_asset_assignment_active ON asset_assignment(asset_id, is_active) 
WHERE is_active = TRUE;


