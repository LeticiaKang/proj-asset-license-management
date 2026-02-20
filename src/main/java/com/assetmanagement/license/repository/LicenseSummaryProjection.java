package com.assetmanagement.license.repository;

import java.time.LocalDate;

/**
 * 라이센스 요약 현황 native query 결과 매핑용 Projection
 */
public interface LicenseSummaryProjection {

    Long getSoftwareid();
    String getSoftwarename();
    Long getLicenseid();
    String getLicensetype();
    String getLicenseversion();
    Integer getTotalqty();
    Integer getUsedqty();
    Integer getRemainqty();
    LocalDate getExpirydate();
    String getExpirystatus();
}
