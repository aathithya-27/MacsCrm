
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 15000,
  RETRY_COUNT: 2,
  RETRY_DELAY: 500,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  MASTER_DATA: {
    // Organization
    COMPANY: '/companyMaster',
    BRANCH: '/branches',
    BUSINESS_VERTICAL: '/businessVerticals',
    AGENCY: '/agencies',
    SCHEME: '/schemes',
    
    // HR & Access Control
    DESIGNATION: '/designations',
    ROLE: '/roles',
    ROLE_PERMISSION: '/rolePermissions',
    
    // Policy Configuration
    INSURANCE_TYPE: '/insuranceTypes',
    INSURANCE_SUB_TYPE: '/insuranceSubTypes',
    PROCESS_FLOW: '/processFlows',
    POLICY_FIELD: '/policyFields',
    POLICY_DOCUMENT: '/policyDocuments',
    DOCUMENT_MASTER: '/documentMasters',
    
    // Geography
    COUNTRY: '/countries',
    STATE: '/states',
    DISTRICT: '/districts',
    CITY: '/cities',
    AREA: '/areas',
    ROUTE: '/routes',
    
    // Finance
    FINANCIAL_YEAR: '/financialYears',
    NUMBERING_RULE: '/numberingRules',
    BANK: '/banks',
    ACCOUNT_TYPE: '/accountTypes',
    
    // Accounts Category (New)
    ACCOUNT_CATEGORY: '/accountCategories',
    ACCOUNT_SUB_CATEGORY: '/accountSubCategories',
    ACCOUNT_HEAD: '/accountHeads',
    
    // CRM / Sales
    LEAD_STAGE: '/leadStages',
    LEAD_SOURCE: '/leadSources',
    RELATIONSHIP: '/relationships',
    CUSTOMER_CATEGORY: '/customerCategories',
    CUSTOMER_SUB_CATEGORY: '/customerSubCategories',
    CUSTOMER_GROUP: '/customerGroups',
    CUSTOMER_TYPE: '/customerTypes',
    
    // Gifts & Tiers
    GIFT: '/gifts',
    SUM_ASSURED_TIER: '/sumAssuredTiers',
    PREMIUM_TIER: '/premiumTiers',
    
    // Demographics / Misc
    RELIGION: '/religions',
    FESTIVAL: '/festivals',
    FESTIVAL_DATE: '/festivalDates',
    GENDER: '/genders',
    MARITAL_STATUS: '/maritalStatuses',
    
    // Task
    TASK_STATUS: '/taskStatuses',
  },
};