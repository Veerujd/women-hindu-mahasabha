-- ============================================================
-- Akhila Bharata Veerashaiva Mahila Mahasabha
-- Membership Applications Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS mahasabha_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mahasabha_db;

-- Main membership applications table (Step 1 + Step 2 combined)
CREATE TABLE IF NOT EXISTS membership_applications (
    -- Primary key & timestamps
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status              ENUM('draft','submitted','approved','rejected') DEFAULT 'submitted',

    -- Application meta
    application_no      VARCHAR(30),
    application_date    DATE,

    -- ── STEP 1: Personal Information ─────────────────────────
    applicant_name      VARCHAR(200) NOT NULL,
    aadhaar_no          VARCHAR(12)  NOT NULL,
    father_husband_name VARCHAR(200),
    mother_name         VARCHAR(200),
    dob                 DATE,
    gender              ENUM('Female','Male','Other'),
    blood_group         VARCHAR(10),

    -- Family details
    male_children       INT DEFAULT 0,
    female_children     INT DEFAULT 0,
    total_children      INT DEFAULT 0,

    -- Education & Occupation
    education           VARCHAR(200),
    occupation          VARCHAR(200),

    -- Contact
    mobile              VARCHAR(15) NOT NULL,
    email               VARCHAR(200),

    -- Address
    address             TEXT,
    state               VARCHAR(100),
    district            VARCHAR(100),
    taluk               VARCHAR(100),
    pincode             VARCHAR(10),

    -- Payment Details
    payment_ref         VARCHAR(200),
    classification      VARCHAR(100),
    payment_amount      DECIMAL(10,2),
    specific_project    VARCHAR(300),

    -- Electoral Representation
    rep_lokasabha       VARCHAR(200),
    rep_corporation     VARCHAR(200),
    rep_vidhanasabha    VARCHAR(200),
    rep_cmc             VARCHAR(200),
    rep_tmc             VARCHAR(200),
    rep_gram_panchayat  VARCHAR(200),

    -- Introducer
    introducer_name     VARCHAR(200),
    introducer_mem_no   VARCHAR(100),

    -- Photo (only filename stored, actual file saved in /static/uploads/member_photos/)
    photo_filename      VARCHAR(300),

    -- ── STEP 2: Detailed Family Members ──────────────────────
    -- Stored as JSON array: [{"relation":"Spouse","name":"...","mobile":"..."}]
    family_members      JSON,

    -- Indexes for fast lookup
    INDEX idx_aadhaar   (aadhaar_no),
    INDEX idx_mobile    (mobile),
    INDEX idx_appno     (application_no),
    INDEX idx_status    (status)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: view to quickly see submitted applications
CREATE OR REPLACE VIEW v_submitted_applications AS
    SELECT
        id,
        application_no,
        application_date,
        applicant_name,
        mobile,
        email,
        district,
        state,
        classification,
        payment_amount,
        photo_filename,
        status,
        created_at
    FROM membership_applications
    WHERE status = 'submitted'
    ORDER BY created_at DESC;
