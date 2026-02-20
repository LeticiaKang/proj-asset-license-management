-- ============================================================
-- IT 자산 & 라이센스 관리 시스템 DDL (v1.3)
-- Database: PostgreSQL 15+
-- Created: 2026-02-20
-- 컬럼 규칙: reg_date, reg_id, upd_date, upd_id, is_deleted
-- 이력 테이블: reg_date, reg_id만 포함 (INSERT-ONLY)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. 메뉴 관리 (트리 구조)
-- ============================================================
CREATE TABLE menu (
	menu_id			BIGSERIAL		PRIMARY KEY,
	parent_menu_id	BIGINT			REFERENCES menu(menu_id),
	menu_name		VARCHAR(100)	NOT NULL,
	menu_code		VARCHAR(50)		NOT NULL UNIQUE,
	menu_url		VARCHAR(255),
	menu_icon		VARCHAR(100),
	menu_order		INT				NOT NULL DEFAULT 0,
	menu_depth		INT				NOT NULL DEFAULT 0,
	description		VARCHAR(255),
	is_active		BOOLEAN			NOT NULL DEFAULT true,
	is_deleted		BOOLEAN			NOT NULL DEFAULT false,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id			BIGINT,
	upd_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE menu IS '메뉴 관리';
COMMENT ON COLUMN menu.parent_menu_id IS '상위 메뉴 ID (자기참조 FK)';
COMMENT ON COLUMN menu.menu_code IS '메뉴 코드 (UNIQUE)';
COMMENT ON COLUMN menu.menu_depth IS '메뉴 깊이 (0=최상위)';

CREATE INDEX idx_menu_parent ON menu(parent_menu_id);
CREATE INDEX idx_menu_deleted ON menu(is_deleted);

-- ============================================================
-- 2. 권한(역할) 관리
-- ============================================================
CREATE TABLE role (
	role_id			BIGSERIAL		PRIMARY KEY,
	role_name		VARCHAR(50)		NOT NULL UNIQUE,
	role_code		VARCHAR(50)		NOT NULL UNIQUE,
	description		VARCHAR(255),
	is_active		BOOLEAN			NOT NULL DEFAULT true,
	is_deleted		BOOLEAN			NOT NULL DEFAULT false,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id			BIGINT,
	upd_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE role IS '권한(역할) 관리';
COMMENT ON COLUMN role.role_name IS '권한명 (예: 시스템관리자, 자산관리자, 일반사용자)';
COMMENT ON COLUMN role.role_code IS '권한 코드 (예: ROLE_ADMIN, ROLE_ASSET_MANAGER)';

-- ============================================================
-- 3. 메뉴별 권한 매핑
-- ============================================================
CREATE TABLE role_menu (
	role_menu_id	BIGSERIAL		PRIMARY KEY,
	role_id			BIGINT			NOT NULL REFERENCES role(role_id),
	menu_id			BIGINT			NOT NULL REFERENCES menu(menu_id),
	can_read		BOOLEAN			NOT NULL DEFAULT false,
	can_create		BOOLEAN			NOT NULL DEFAULT false,
	can_update		BOOLEAN			NOT NULL DEFAULT false,
	can_delete		BOOLEAN			NOT NULL DEFAULT false,
	is_deleted		BOOLEAN			NOT NULL DEFAULT false,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id			BIGINT,
	upd_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uk_role_menu UNIQUE (role_id, menu_id)
);

COMMENT ON TABLE role_menu IS '메뉴별 권한 매핑 (CRUD 권한)';

CREATE INDEX idx_role_menu_role ON role_menu(role_id);
CREATE INDEX idx_role_menu_menu ON role_menu(menu_id);

-- ============================================================
-- 4. 부서 관리 (트리 구조, 최대 5단계)
-- ============================================================
CREATE TABLE dept (
	dept_id			BIGSERIAL		PRIMARY KEY,
	parent_dept_id	BIGINT			REFERENCES dept(dept_id),
	dept_name		VARCHAR(100)	NOT NULL,
	dept_code		VARCHAR(50)		NOT NULL UNIQUE,
	dept_order		INT				NOT NULL DEFAULT 0,
	dept_depth		INT				NOT NULL DEFAULT 0,
	dept_path		VARCHAR(500),
	is_active		BOOLEAN			NOT NULL DEFAULT true,
	is_deleted		BOOLEAN			NOT NULL DEFAULT false,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id			BIGINT,
	upd_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT chk_dept_depth CHECK (dept_depth <= 5)
);

COMMENT ON TABLE dept IS '부서 관리 (트리 구조)';
COMMENT ON COLUMN dept.parent_dept_id IS '상위 부서 ID (NULL이면 최상위)';
COMMENT ON COLUMN dept.dept_path IS 'Materialized Path (예: /1/3/7/)';

CREATE INDEX idx_dept_parent ON dept(parent_dept_id);
CREATE INDEX idx_dept_path ON dept(dept_path);
CREATE INDEX idx_dept_deleted ON dept(is_deleted);

-- ============================================================
-- 5. 사용자(멤버) 관리
-- ============================================================
CREATE TABLE member (
	member_id			BIGSERIAL		PRIMARY KEY,
	login_id			VARCHAR(50)		NOT NULL UNIQUE,
	password			VARCHAR(255)	NOT NULL,
	member_name			VARCHAR(50)		NOT NULL,
	dept_id				BIGINT			REFERENCES dept(dept_id),
	position			VARCHAR(50),
	job_title			VARCHAR(100),
	hire_date			DATE			NOT NULL,
	resign_date			DATE,
	employment_status	VARCHAR(20)		NOT NULL DEFAULT 'ACTIVE',
	work_location		VARCHAR(100),
	email				VARCHAR(100),
	phone				VARCHAR(20),
	login_fail_count	INT				NOT NULL DEFAULT 0,
	is_locked			BOOLEAN			NOT NULL DEFAULT false,
	locked_at			TIMESTAMP,
	password_changed_at	TIMESTAMP,
	is_initial_password	BOOLEAN			NOT NULL DEFAULT true,
	is_active			BOOLEAN			NOT NULL DEFAULT true,
	is_deleted			BOOLEAN			NOT NULL DEFAULT false,
	reg_id				BIGINT,
	reg_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id				BIGINT,
	upd_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE member IS '사용자(멤버) 관리';
COMMENT ON COLUMN member.login_id IS '로그인 아이디 (영문소문자+숫자+점)';
COMMENT ON COLUMN member.position IS '직급 (공통코드 POSITION 참조)';
COMMENT ON COLUMN member.job_title IS '담당업무 (nullable)';
COMMENT ON COLUMN member.employment_status IS '재직상태 (ACTIVE/RESIGNED/LEAVE)';
COMMENT ON COLUMN member.work_location IS '근무지';
COMMENT ON COLUMN member.login_fail_count IS '연속 로그인 실패 횟수';
COMMENT ON COLUMN member.is_locked IS '계정 잠금 여부 (5회 실패 시 true)';
COMMENT ON COLUMN member.is_initial_password IS '초기 비밀번호 여부 (최초 로그인 시 변경 강제)';

CREATE INDEX idx_member_dept ON member(dept_id);
CREATE INDEX idx_member_status ON member(employment_status);
CREATE INDEX idx_member_login ON member(login_id);
CREATE INDEX idx_member_deleted ON member(is_deleted);

-- ============================================================
-- 6. 비밀번호 이력 (INSERT-ONLY, 최근 3개 재사용 방지)
-- ============================================================
CREATE TABLE password_history (
	history_id		BIGSERIAL		PRIMARY KEY,
	member_id		BIGINT			NOT NULL REFERENCES member(member_id),
	password		VARCHAR(255)	NOT NULL,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE password_history IS '비밀번호 변경 이력 (최근 3개 재사용 방지)';

CREATE INDEX idx_pw_history_member ON password_history(member_id);

-- ============================================================
-- 7. 사용자별 권한 매핑
-- ============================================================
CREATE TABLE member_role (
	member_role_id	BIGSERIAL		PRIMARY KEY,
	member_id		BIGINT			NOT NULL REFERENCES member(member_id),
	role_id			BIGINT			NOT NULL REFERENCES role(role_id),
	is_deleted		BOOLEAN			NOT NULL DEFAULT false,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id			BIGINT,
	upd_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uk_member_role UNIQUE (member_id, role_id)
);

COMMENT ON TABLE member_role IS '사용자별 권한 매핑';

CREATE INDEX idx_member_role_member ON member_role(member_id);
CREATE INDEX idx_member_role_role ON member_role(role_id);

-- ============================================================
-- 8. 자산 유형 (카테고리)
-- ============================================================
CREATE TABLE asset_category (
	category_id			BIGSERIAL		PRIMARY KEY,
	category_name		VARCHAR(100)	NOT NULL,
	category_code		VARCHAR(50)		NOT NULL UNIQUE,
	parent_category_id	BIGINT			REFERENCES asset_category(category_id),
	category_order		INT				NOT NULL DEFAULT 0,
	is_active			BOOLEAN			NOT NULL DEFAULT true,
	is_deleted			BOOLEAN			NOT NULL DEFAULT false,
	reg_id				BIGINT,
	reg_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id				BIGINT,
	upd_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE asset_category IS '자산 유형 카테고리 (예: 데스크톱, 모니터 등)';

INSERT INTO asset_category (category_name, category_code, category_order) VALUES
	('데스크톱',	'DESKTOP',	1),
	('노트북',		'LAPTOP',	2),
	('모니터',		'MONITOR',	3),
	('마우스',		'MOUSE',	4),
	('키보드',		'KEYBOARD',	5),
	('프린터',		'PRINTER',	6),
	('기타',		'ETC',		99);

-- ============================================================
-- 9. 자산 관리
-- ============================================================
CREATE TABLE asset (
	asset_id			BIGSERIAL		PRIMARY KEY,
	category_id			BIGINT			NOT NULL REFERENCES asset_category(category_id),
	asset_name			VARCHAR(100)	NOT NULL,
	manufacturer		VARCHAR(100),
	model_name			VARCHAR(100),
	serial_number		VARCHAR(100)	UNIQUE,
	purchase_date		DATE,
	purchase_price		NUMERIC(15,2),
	warranty_start_date	DATE,
	warranty_end_date	DATE,
	asset_status		VARCHAR(20)		NOT NULL DEFAULT 'AVAILABLE',
	memory				VARCHAR(50),
	storage				VARCHAR(50),
	specs				JSONB			DEFAULT '{}',
	remarks				TEXT,
	is_deleted			BOOLEAN			NOT NULL DEFAULT false,
	reg_id				BIGINT,
	reg_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id				BIGINT,
	upd_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE asset IS '자산 관리';
COMMENT ON COLUMN asset.asset_status IS 'AVAILABLE/IN_USE/REPAIR/DISPOSED/LOST';
COMMENT ON COLUMN asset.memory IS '메모리 (예: 16GB, 32GB)';
COMMENT ON COLUMN asset.storage IS '저장장치 (예: 512GB SSD, 1TB HDD)';
COMMENT ON COLUMN asset.specs IS '추가 스펙 JSON (예: {"cpu":"i7-13700","gpu":"RTX 4060"})';

CREATE INDEX idx_asset_category ON asset(category_id);
CREATE INDEX idx_asset_status ON asset(asset_status);
CREATE INDEX idx_asset_deleted ON asset(is_deleted);
CREATE INDEX idx_asset_specs ON asset USING GIN (specs);

-- ============================================================
-- 10. 자산 배정 관리
--     return_date IS NULL → 현재 사용중
--     return_date IS NOT NULL → 반납 완료 (히스토리)
-- ============================================================
CREATE TABLE asset_assignment (
	assignment_id		BIGSERIAL		PRIMARY KEY,
	asset_id			BIGINT			NOT NULL REFERENCES asset(asset_id),
	member_id			BIGINT			NOT NULL REFERENCES member(member_id),
	assigned_date		DATE			NOT NULL,
	return_date			DATE,
	assignment_status	VARCHAR(20)		NOT NULL DEFAULT 'ASSIGNED',
	remarks				TEXT,
	is_deleted			BOOLEAN			NOT NULL DEFAULT false,
	reg_id				BIGINT,
	reg_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id				BIGINT,
	upd_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE asset_assignment IS '자산 배정 관리 (자산 중심 히스토리)';
COMMENT ON COLUMN asset_assignment.assignment_status IS 'ASSIGNED=배정중, RETURNED=반납완료';

CREATE INDEX idx_asset_assign_asset ON asset_assignment(asset_id);
CREATE INDEX idx_asset_assign_member ON asset_assignment(member_id);
CREATE INDEX idx_asset_assign_status ON asset_assignment(assignment_status);
CREATE UNIQUE INDEX uk_asset_assign_active ON asset_assignment(asset_id)
	WHERE assignment_status = 'ASSIGNED' AND is_deleted = false;

-- ============================================================
-- 11. 자산 배정 이력 (감사 로그, INSERT-ONLY)
-- ============================================================
CREATE TABLE asset_history (
	history_id		BIGSERIAL		PRIMARY KEY,
	asset_id		BIGINT			NOT NULL REFERENCES asset(asset_id),
	member_id		BIGINT			NOT NULL REFERENCES member(member_id),
	action_type		VARCHAR(20)		NOT NULL,
	action_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	remarks			TEXT,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE asset_history IS '자산 배정 이력 (감사 로그, INSERT-ONLY)';
COMMENT ON COLUMN asset_history.action_type IS 'ASSIGN=배정, RETURN=반납, TRANSFER=이관';

CREATE INDEX idx_asset_history_asset ON asset_history(asset_id);
CREATE INDEX idx_asset_history_member ON asset_history(member_id);
CREATE INDEX idx_asset_history_date ON asset_history(action_date);

-- ============================================================
-- 12. 소프트웨어 관리
-- ============================================================
CREATE TABLE software (
	software_id		BIGSERIAL		PRIMARY KEY,
	software_name	VARCHAR(100)	NOT NULL,
	publisher		VARCHAR(100),
	description		TEXT,
	is_active		BOOLEAN			NOT NULL DEFAULT true,
	is_deleted		BOOLEAN			NOT NULL DEFAULT false,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id			BIGINT,
	upd_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE software IS '소프트웨어 관리 (라이센스의 상위 개념)';

-- ============================================================
-- 13. 라이센스 관리
-- ============================================================
CREATE TABLE license (
	license_id		BIGSERIAL		PRIMARY KEY,
	software_id		BIGINT			NOT NULL REFERENCES software(software_id),
	license_type	VARCHAR(20)		NOT NULL,
	license_version	VARCHAR(50),
	total_qty		INT				NOT NULL DEFAULT 1,
	used_qty		INT				NOT NULL DEFAULT 0,
	purchase_date	DATE,
	expiry_date		DATE,
	purchase_price	NUMERIC(15,2),
	install_guide	TEXT,
	remarks			TEXT,
	is_active		BOOLEAN			NOT NULL DEFAULT true,
	is_deleted		BOOLEAN			NOT NULL DEFAULT false,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id			BIGINT,
	upd_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT chk_license_qty CHECK (used_qty >= 0 AND used_qty <= total_qty)
);

COMMENT ON TABLE license IS '라이센스 관리';
COMMENT ON COLUMN license.license_type IS 'VOLUME/INDIVIDUAL/SUBSCRIPTION';
COMMENT ON COLUMN license.total_qty IS '총 라이센스 수량';
COMMENT ON COLUMN license.used_qty IS '사용중 수량 (트리거 자동 관리)';
COMMENT ON COLUMN license.install_guide IS '설치 가이드 (향후 이메일 발송용)';

CREATE INDEX idx_license_software ON license(software_id);
CREATE INDEX idx_license_type ON license(license_type);
CREATE INDEX idx_license_deleted ON license(is_deleted);

-- ============================================================
-- 14. 라이센스 키 관리
-- ============================================================
CREATE TABLE license_key (
	key_id			BIGSERIAL		PRIMARY KEY,
	license_id		BIGINT			NOT NULL REFERENCES license(license_id),
	license_key		VARCHAR(500)	NOT NULL,
	key_status		VARCHAR(20)		NOT NULL DEFAULT 'AVAILABLE',
	remarks			TEXT,
	is_deleted		BOOLEAN			NOT NULL DEFAULT false,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id			BIGINT,
	upd_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE license_key IS '라이센스 키 관리';
COMMENT ON COLUMN license_key.key_status IS 'AVAILABLE/IN_USE/EXPIRED/REVOKED';

CREATE INDEX idx_license_key_license ON license_key(license_id);
CREATE INDEX idx_license_key_status ON license_key(key_status);

-- ============================================================
-- 15. 라이센스 배정 관리
-- ============================================================
CREATE TABLE license_assignment (
	assignment_id		BIGSERIAL		PRIMARY KEY,
	license_id			BIGINT			NOT NULL REFERENCES license(license_id),
	key_id				BIGINT			REFERENCES license_key(key_id),
	member_id			BIGINT			NOT NULL REFERENCES member(member_id),
	assigned_date		DATE			NOT NULL,
	return_date			DATE,
	assignment_reason	TEXT			NOT NULL,
	assignment_status	VARCHAR(20)		NOT NULL DEFAULT 'ASSIGNED',
	remarks				TEXT,
	is_deleted			BOOLEAN			NOT NULL DEFAULT false,
	reg_id				BIGINT,
	reg_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id				BIGINT,
	upd_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE license_assignment IS '라이센스 배정 관리 (사람 중심)';
COMMENT ON COLUMN license_assignment.assignment_reason IS '배정 사유 (필수)';
COMMENT ON COLUMN license_assignment.assignment_status IS 'ASSIGNED/RETURNED/EXPIRED';

CREATE INDEX idx_license_assign_license ON license_assignment(license_id);
CREATE INDEX idx_license_assign_member ON license_assignment(member_id);
CREATE INDEX idx_license_assign_key ON license_assignment(key_id);
CREATE INDEX idx_license_assign_status ON license_assignment(assignment_status);
CREATE UNIQUE INDEX uk_license_assign_active ON license_assignment(license_id, member_id)
	WHERE assignment_status = 'ASSIGNED' AND is_deleted = false;

-- ============================================================
-- 16. 라이센스 배정 이력 (감사 로그, INSERT-ONLY)
-- ============================================================
CREATE TABLE license_history (
	history_id			BIGSERIAL		PRIMARY KEY,
	license_id			BIGINT			NOT NULL REFERENCES license(license_id),
	key_id				BIGINT			REFERENCES license_key(key_id),
	member_id			BIGINT			NOT NULL REFERENCES member(member_id),
	action_type			VARCHAR(20)		NOT NULL,
	action_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	assignment_reason	TEXT,
	remarks				TEXT,
	reg_id				BIGINT,
	reg_date			TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE license_history IS '라이센스 배정 이력 (사람 중심, INSERT-ONLY)';
COMMENT ON COLUMN license_history.action_type IS 'ASSIGN/RETURN/CHANGE/EXPIRE';

CREATE INDEX idx_license_history_license ON license_history(license_id);
CREATE INDEX idx_license_history_member ON license_history(member_id);
CREATE INDEX idx_license_history_date ON license_history(action_date);

-- ============================================================
-- 17. 공통 코드 테이블
-- ============================================================
CREATE TABLE common_code (
	code_id			BIGSERIAL		PRIMARY KEY,
	group_code		VARCHAR(50)		NOT NULL,
	code			VARCHAR(50)		NOT NULL,
	code_name		VARCHAR(100)	NOT NULL,
	code_order		INT				NOT NULL DEFAULT 0,
	description		VARCHAR(255),
	is_active		BOOLEAN			NOT NULL DEFAULT true,
	is_deleted		BOOLEAN			NOT NULL DEFAULT false,
	reg_id			BIGINT,
	reg_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	upd_id			BIGINT,
	upd_date		TIMESTAMP		NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uk_common_code UNIQUE (group_code, code)
);

COMMENT ON TABLE common_code IS '공통 코드 관리';

CREATE INDEX idx_common_code_group ON common_code(group_code);

INSERT INTO common_code (group_code, code, code_name, code_order) VALUES
	-- 자산 상태
	('ASSET_STATUS',		'AVAILABLE',	'사용가능',	1),
	('ASSET_STATUS',		'IN_USE',		'사용중',	2),
	('ASSET_STATUS',		'REPAIR',		'수리중',	3),
	('ASSET_STATUS',		'DISPOSED',		'폐기',		4),
	('ASSET_STATUS',		'LOST',			'분실',		5),
	-- 재직 상태
	('EMPLOYMENT_STATUS',	'ACTIVE',		'재직',		1),
	('EMPLOYMENT_STATUS',	'RESIGNED',		'퇴사',		2),
	('EMPLOYMENT_STATUS',	'LEAVE',		'휴직',		3),
	-- 라이센스 유형
	('LICENSE_TYPE',		'VOLUME',		'볼륨',		1),
	('LICENSE_TYPE',		'INDIVIDUAL',	'개별',		2),
	('LICENSE_TYPE',		'SUBSCRIPTION',	'구독',		3),
	-- 라이센스 키 상태
	('KEY_STATUS',			'AVAILABLE',	'사용가능',	1),
	('KEY_STATUS',			'IN_USE',		'사용중',	2),
	('KEY_STATUS',			'EXPIRED',		'만료',		3),
	('KEY_STATUS',			'REVOKED',		'폐기',		4),
	-- 배정 상태
	('ASSIGNMENT_STATUS',	'ASSIGNED',		'배정',		1),
	('ASSIGNMENT_STATUS',	'RETURNED',		'반납',		2),
	('ASSIGNMENT_STATUS',	'EXPIRED',		'만료',		3),
	-- 직급
	('POSITION',			'INTERN',		'인턴',		1),
	('POSITION',			'STAFF',		'사원',		2),
	('POSITION',			'SENIOR',		'주임',		3),
	('POSITION',			'ASSISTANT_MGR','대리',		4),
	('POSITION',			'MANAGER',		'과장',		5),
	('POSITION',			'DEPUTY_GM',	'차장',		6),
	('POSITION',			'GENERAL_MGR',	'부장',		7),
	('POSITION',			'DIRECTOR',		'이사',		8),
	-- 자산 이력 액션
	('ASSET_ACTION',		'ASSIGN',		'배정',		1),
	('ASSET_ACTION',		'RETURN',		'반납',		2),
	('ASSET_ACTION',		'TRANSFER',		'이관',		3),
	-- 라이센스 이력 액션
	('LICENSE_ACTION',		'ASSIGN',		'배정',		1),
	('LICENSE_ACTION',		'RETURN',		'회수',		2),
	('LICENSE_ACTION',		'CHANGE',		'변경',		3),
	('LICENSE_ACTION',		'EXPIRE',		'만료',		4);

-- ============================================================
-- 초기 권한 데이터
-- ============================================================
INSERT INTO role (role_name, role_code, description) VALUES
	('시스템관리자',	'ROLE_ADMIN',			'전체 시스템 관리 권한'),
	('자산관리자',		'ROLE_ASSET_MANAGER',	'자산 및 라이센스 관리 권한'),
	('일반사용자',		'ROLE_USER',			'조회 권한');

-- ============================================================
-- 트리거: 라이센스 배정 시 used_qty 자동 증가
-- ============================================================
CREATE OR REPLACE FUNCTION fn_license_assign_increment()
RETURNS TRIGGER AS $$
BEGIN
	IF NEW.assignment_status = 'ASSIGNED' THEN
		UPDATE	license
		SET		used_qty = used_qty + 1,
				upd_date = CURRENT_TIMESTAMP
		WHERE	license_id = NEW.license_id;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_license_assign_insert
	AFTER INSERT ON license_assignment
	FOR EACH ROW
	EXECUTE FUNCTION fn_license_assign_increment();

-- ============================================================
-- 트리거: 라이센스 회수/만료 시 used_qty 자동 감소
-- ============================================================
CREATE OR REPLACE FUNCTION fn_license_assign_decrement()
RETURNS TRIGGER AS $$
BEGIN
	IF OLD.assignment_status = 'ASSIGNED'
		AND NEW.assignment_status IN ('RETURNED', 'EXPIRED') THEN
		UPDATE	license
		SET		used_qty = GREATEST(used_qty - 1, 0),
				upd_date = CURRENT_TIMESTAMP
		WHERE	license_id = NEW.license_id;
	END IF;
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_license_assign_update
	AFTER UPDATE OF assignment_status ON license_assignment
	FOR EACH ROW
	EXECUTE FUNCTION fn_license_assign_decrement();

-- ============================================================
-- 뷰: 라이센스 수량 정합성 검증
-- ============================================================
CREATE OR REPLACE VIEW v_license_qty_check AS
SELECT
	l.license_id,
	s.software_name,
	l.license_version,
	l.license_type,
	l.total_qty,
	l.used_qty									AS recorded_used_qty,
	COUNT(la.assignment_id)						AS actual_used_qty,
	CASE
		WHEN l.used_qty = COUNT(la.assignment_id)
			THEN 'OK'
		ELSE 'MISMATCH'
	END											AS status
FROM	license l
JOIN	software s
	ON	s.software_id = l.software_id
LEFT JOIN license_assignment la
	ON	la.license_id = l.license_id
	AND	la.assignment_status = 'ASSIGNED'
	AND	la.is_deleted = false
WHERE	l.is_deleted = false
GROUP BY l.license_id, s.software_name, l.license_version, l.license_type,
		l.total_qty, l.used_qty;

COMMENT ON VIEW v_license_qty_check IS '라이센스 수량 정합성 검증 (recorded vs actual)';

-- ============================================================
-- 뷰: 자산 유형별 현황 요약
-- ============================================================
CREATE OR REPLACE VIEW v_asset_summary AS
SELECT
	ac.category_id,
	ac.category_name,
	ac.category_code,
	COUNT(a.asset_id)										AS total_count,
	COUNT(CASE WHEN a.asset_status = 'AVAILABLE' THEN 1 END)	AS available_count,
	COUNT(CASE WHEN a.asset_status = 'IN_USE' THEN 1 END)		AS in_use_count,
	COUNT(CASE WHEN a.asset_status = 'REPAIR' THEN 1 END)		AS repair_count,
	COUNT(CASE WHEN a.asset_status = 'DISPOSED' THEN 1 END)	AS disposed_count,
	COUNT(CASE WHEN a.asset_status = 'LOST' THEN 1 END)		AS lost_count
FROM	asset_category ac
LEFT JOIN asset a
	ON	a.category_id = ac.category_id
	AND	a.is_deleted = false
WHERE	ac.is_deleted = false
GROUP BY ac.category_id, ac.category_name, ac.category_code
ORDER BY ac.category_order;

COMMENT ON VIEW v_asset_summary IS '자산 유형별 현황 요약';

-- ============================================================
-- 뷰: 라이센스 현황 요약
-- ============================================================
CREATE OR REPLACE VIEW v_license_summary AS
SELECT
	s.software_id,
	s.software_name,
	l.license_id,
	l.license_type,
	l.license_version,
	l.total_qty,
	l.used_qty,
	(l.total_qty - l.used_qty)	AS remain_qty,
	l.expiry_date,
	CASE
		WHEN l.expiry_date IS NOT NULL AND l.expiry_date < CURRENT_DATE
			THEN 'EXPIRED'
		WHEN l.expiry_date IS NOT NULL AND l.expiry_date <= CURRENT_DATE + INTERVAL '7 days'
			THEN 'EXPIRING_SOON'
		ELSE 'ACTIVE'
	END							AS expiry_status
FROM	license l
JOIN	software s
	ON	s.software_id = l.software_id
WHERE	l.is_deleted = false
	AND	l.is_active = true
ORDER BY s.software_name, l.license_version;

COMMENT ON VIEW v_license_summary IS '라이센스 현황 요약 (만료 상태 포함)';
