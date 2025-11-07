export interface Company {
    id: number;
    COMP_ID: number;
    CLIENT_ID: number;
    COMP_CODE: string;
    COMP_NAME: string;
    MAILING_NAME?: string | null;
    DATE_OF_CREATION?: string | null;
    STATUS: number; 
    ADDRESS_1?: string | null;
    ADDRESS_2?: string | null;
    ADDRESS_3?: string | null;
    PHONE_NO?: string | null;
    EMAIL?: string | null;
    AREA_ID?: number | null;
    CITY_ID?: number | null;
    STATE_ID?: number | null;
    PIN_CODE?: string | null;
    FAX_NO?: string | null;
    GST_NO?: string | null;
    PAN_NO?: string | null;
    TAN_NO?: string | null;
    MODIFIED_ON: string;
}

export interface User {
    id: number;
    name: string;
    comp_id: number;
}

export interface Country {
    ID: number;
    COUNTRY_NAME: string;
    CREATED_ON: string;
    MODIFIED_ON: string;
    CREATED_BY: number;
    MODIFIED_BY: number;
    STATUS: number;
}

export interface State {
    ID: number;
    COUNTRY_ID: number;
    STATE: string; 
    CREATED_ON: string;
    MODIFIED_ON: string;
    CREATED_BY: number;
    MODIFIED_BY: number;
    STATUS: number;
}

export interface District {
    ID: number;
    STATE_ID: number;
    COUNTRY_ID: number;
    DISTRICT: string; 
    CREATED_ON: string;
    MODIFIED_ON: string;
    CREATED_BY: number;
    MODIFIED_BY: number;
    STATUS: number;
}

export interface City {
    ID: number;
    DISTRICT_ID: number;
    STATE_ID: number;
    COUNTRY_ID: number;
    CITY: string; 
    CREATED_ON: string;
    MODIFIED_ON: string;
    CREATED_BY: number;
    MODIFIED_BY: number;
    STATUS: number; 
}

export interface Area {
    ID: number;
    CITY_ID: number;
    DISTRICT_ID: number;
    STATE_ID: number;
    COUNTRY_ID: number;
    AREA: string; 
    CREATED_ON: string;
    MODIFIED_ON: string;
    CREATED_BY: number;
    MODIFIED_BY: number;
    STATUS: number; 
}


export interface SelectOption {
    value: string;
    label: string;
}

export interface Branch {
    BRANCH_ID: number;
    COMP_ID: number;
    BRANCH_NAME: string;
    BRANCH_CODE: string; 
    ADDRESS_1?: string | null;
    ADDRESS_2?: string | null;
    ADDRESS_3?: string | null;
    AREA_ID?: number | null;
    CITY_ID?: number | null;
    STATE_ID?: number | null;
    PINCODE?: string | null;
    PHONE_NO?: string | null;
    FAX_NO?: string | null;
    GST_NO?: string | null;
    PAN_NO?: string | null;
    TAN_NO?: string | null;
    DATE_OF_CREATION?: string | null;
    MODIFIED_ON: string;
    CREATED_BY?: number | null;
    MODIFIED_BY?: number | null;
    STATUS: number; 
}

export interface BusinessVertical {
    ID: number;
    CLIENT_ID: number;
    COMP_ID: number;
    BUSINESS_VERTICAL_NAME: string;
    CREATED_ON: string;
    MODIFIED_ON: string;
    CREATED_BY: number;
    MODIFIED_BY: number;
    STATUS: number; 
}


export interface InsuranceType {
    ID: number;
    CLIENT_ID: number;
    COMP_ID: number;
    INSURANCE_TYPE: string;
    BUSINESS_VERTICAL_ID: number;
    DATE_OF_CREATION: string;
    MODIFIED_ON: string;
    CREATED_BY: number;
    MODIFIED_BY: number;
    STATUS: number;
}

export interface InsuranceSubType {
    ID: number;
    CLIENT_ID: number;
    COMP_ID: number;
    INSURANCE_SUB_TYPE: string;
    INSURANCE_TYPE_ID: number;
    DATE_OF_CREATION: string;
    MODIFIED_ON: string;
    CREATED_BY: number;
    MODIFIED_BY: number;
    STATUS: number;
}

export type FieldType = 'Text Input' | 'Number Input' | 'Date Input' | 'Toggle (Yes/No)' | 'Dropdown (Select)' | 'Checkbox Group' | 'Table';

export interface InsuranceFieldMaster {
    ID: number;
    INSURANCE_TYPE_ID: number;
    FIELD_GROUP: string;
    FIELD_LABEL: string;
    FIELD_NAME: string;
    CDATA_TYPE: FieldType;
    COLUMN_SPAN: 1 | 2 | 3;
    STATUS: number;
    SEQ_NO: number;
    OPTIONS?: string[];
}

export interface ProcessFlow {
    ID: number;
    COMP_ID: number;
    CLIENT_ID: number;
    INSURANCE_TYPE_ID: number;
    PROCESS_DESC: string;
    SEQ_NO: number;
    REPEAT: boolean;
    CREATED_ON: string;
    CREATED_BY: number;
    MODIFIED_ON: string;
    MODIFIED_BY: number;
    STATUS: number;
}

export interface DocumentMaster {
    ID: number;
    DOC_NAME: string;
    STATUS: number;
    SEQ_NO: number;
}

export interface DocumentRequirement {
    ID: number;
    COMP_ID: number;
    DOC_ID: number;
    INSU_TYPE_ID: number;
    INSU_SUB_TYPE_ID?: number | null;
    IS_MANDATORY: number;
    CREATED_ON: string;
    CREATED_BY: number;
    MODIFIED_ON: string;
    MODIFIED_BY: number;
    STATUS: number;
}

export interface Member {
  id: string;
  name: string;
  policies?: Policy[];
  processStages?: { [insuranceTypeId: string]: string };
  routeId?: number;
  genderId?: number;
  maritalStatusId?: number;
  state?: string;
  district?: string;
  city?: string;
  area?: string;
  customerCategoryId?: number;
  customerSubCategoryId?: number;
  customerGroupId?: number;
  customerTypeId?: number;
}

export interface Policy {
  id: string;
  insuranceTypeId: string;
  schemeName?: string;
  dynamicData?: { [key:string]: any };
  coveredMembers?: { relationship: string }[];
}

export interface SchemeMaster {
    id: string;
    name: string;
    insuranceTypeId: string;
}

export interface Agency {
  ID: number;
  COMP_ID: number;
  AGENCY_NAME: string;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number; 
}

export interface Scheme {
  ID: number;
  COMP_ID: number;
  SCHEME_NAME: string;
  INSURANCE_TYPE_ID: number;
  INSURANCE_SUB_TYPE_ID?: number | null; 
  AGENCY_ID: number;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number;
  SEQ_NO?: number; 
}

export interface Designation {
  ID: number;
  COMP_ID: number;
  DESIGNATION_NAME: string;
  RANK?: number | null;
  STATUS: number; 
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
}

export interface Role {
  ID: number;
  COMP_ID: number;
  ROLE_DESC: string;
  IS_ADVISOR_ROLE: number; 
  STATUS: number; 
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
}

export interface Route {
  ID: number;
  ROUTE_NAME: string;
  COMP_ID: number;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number; 
  SEQ_NO: number;
}

export interface MaritalStatus {
  ID: number;
  MARITAL_STATUS: string;
  STATUS: number; 
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
  SEQ_NO: number;
}

export interface Gender {
  ID: number;
  GENDER_NAME: string;
  STATUS: number; 
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
  SEQ_NO: number;
}

export interface RelationshipType {
  ID: number;
  RELATIONSHIP_NAME: string;
  COMP_ID: number;
  STATUS: number; 
  SEQ_NO: number;
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
}

export interface LeadStage {
  ID: number;
  LEAD_NAME: string;
  COMP_ID: number;
  STATUS: number; 
  SEQ_NO: number;
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ExpenseCategory {
  ID: number;
  COMP_ID: number;
  EXPENSE_CATE_NAME: string;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number; 
}

export interface ExpenseHead {
  ID: number;
  COMP_ID: number;
  EXPENSE_HEAD_NAME: string;
  EXPENSE_CATE_ID: number;
  GET_INDIVIDUAL: number; 
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number; 
}

export interface ExpenseIndividual {
  ID: number;
  COMP_ID: number;
  INDIVIDUAL_NAME: string; 
  EXPENSE_HEAD_ID: number;
  EXPENSE_CATEGORY_ID: number;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number; 
}

export interface IncomeCategory {
  ID: number;
  COMP_ID: number;
  INCOME_CATE: string;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number; 
}

export interface IncomeHead {
  ID: number;
  COMP_ID: number;
  INCOME_HEAD: string;
  INCOME_CATE_ID: number; 
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number; 
}

export interface CustomerCategory {
  ID: number;
  COMP_ID: number;
  BRANCH_ID?: number;
  CUSTOMER_CATEGORY: string;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number;
}

export interface CustomerSubCategory {
  ID: number;
  COMP_ID: number;
  BRANCH_ID?: number;
  CUST_SUB_CATE: string;
  CUST_CATE_ID: number;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number;
}

export interface CustomerGroup {
  ID: number;
  COMP_ID: number;
  BRANCH_ID?: number;
  CUSTOMER_GROUP: string;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number;
}

export interface CustomerType {
  ID: number;
  COMP_ID: number;
  CUST_TYPE: string;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number;
}

export interface CustomerTier {
  ID: number;
  COMP_ID: number;
  CUST_TYPE_ID: number;
  MINIMUM_SUM_ASSURED: number;
  MINIMUM_PREMIUM: number;
  ASSIGNED_GIFT_ID: number | null;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number;
  SEQ_NO: number;
}

export interface Gift {
  ID: number;
  COMP_ID: number;
  GIFT_NAME: string;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number;
  SEQ_NO: number;
}

export interface Religion {
  ID: number;
  COMP_ID: number;
  RELIGION: string;
  STATUS: number;
  SEQ_NO: number;
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
}

export interface Festival {
  ID: number;
  COMP_ID: number;
  RELIGION_ID: number | null;
  FEST_DESC: string;
  STATUS: number;
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
}

export interface FestivalDate {
  ID: number;
  COMP_ID: number;
  FEST_ID: number;
  FESTVEL_DATE: string;
  STATUS: number;
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
}

export interface FinancialYear {
  ID: number;
  COMP_ID: number;
  FROM_DATE: string;
  TO_DATE: string;
  FIN_YEAR: string;
  STATUS: number;
  CREATED_ON: string;
  CREATED_BY: number;
  MODIFIED_ON: string;
  MODIFIED_BY: number;
}

export interface DocumentNumberingRule {
  ID: number;
  COMP_ID: number;
  FIN_YEAR_ID: number;
  TYPE: 'Voucher' | 'Receipt';
  PREFIX: string;
  STARTING_NO: number;
  SUFFIX: string | null;
  STATUS: number;
}

export interface Bank {
  ID: number;
  BANK_NAME: string;
  COMP_ID: number;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number;
}

export interface AccountType {
  ID: number;
  ACCOUNT_TYPE_NAME: string;
  COMP_ID: number;
  CREATED_ON: string;
  MODIFIED_ON: string;
  CREATED_BY: number;
  MODIFIED_BY: number;
  STATUS: number;
}
