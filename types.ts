

// API Response Wrapper
export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}

// Master Data: Company Master
export interface CompanyMaster {
  id?: number | string;
  comp_id: number;
  client_id: number;
  comp_code: string;
  comp_name: string;
  registered_name: string;
  date_of_creation: string;
  address_1: string;
  address_2: string;
  address_3?: string;
  country: string;
  state: string;
  district: string;
  city: string;
  area: string;
  pin_code: string;
  phone_no: string;
  email: string;
  fax_no?: string;
  gst_no: string;
  pan_no: string;
  tan_no: string;
  status: number;
}

// Master Data: Branch
export interface Branch {
  id?: number | string;
  branch_id: number | string;
  comp_id: number;
  branch_name: string;
  address_1: string;
  address_2: string;
  address_3: string;
  country_id?: number | string;
  area_id?: number | string;
  city_id?: number | string;
  state_id?: number | string;
  district_id?: number | string;
  pincode: string;
  phone_no: string;
  fax_no: string;
  gst_no: string;
  pan_no: string;
  tan_no: string;
  date_of_creation: string;
  modified_on?: string;
  created_by?: number;
  modified_by?: number;
  status: number;
  
  // Helpers for display
  country?: string;
  district?: string;
  state?: string; 
  city?: string;
  area?: string;
}

// Master Data: Business Vertical
export interface BusinessVertical {
  id?: number | string;
  client_id: number;
  comp_id: number;
  business_vertical_name: string;
  created_on?: string;
  modified_on?: string;
  created_by?: number;
  modified_by?: number;
  status: number;
}

// Master Data: Document Master
export interface DocumentMaster {
  id?: number | string;
  doc_name: string;
  status: number;
}

// Master Data: Designation
export interface Designation {
  id?: number | string;
  comp_id: number;
  designation_name: string;
  designation_rank?: string | number;
  is_advisor_role?: number; 
  created_on?: string;
  created_by?: number;
  modified_on?: string;
  modified_by?: number;
  status: number;
}

// Master Data: Role
export interface Role {
  id?: number | string;
  comp_id: number;
  client_id?: number;
  branch_id?: number;
  role_desc: string;
  is_advisor_role?: number;
  created_on?: string;
  created_by?: number;
  modified_on?: string;
  modified_by?: number;
  status: number;
}

// Role Permission
export interface RolePermission {
  id?: number | string;
  role_id: number | string;
  module_name: string;
  access_level: 'None' | 'View' | 'Edit' | 'Full';
}

// Financial Year
export interface FinancialYear {
  id?: number | string;
  comp_id: number;
  fin_year: string; 
  from_date: string;
  to_date: string;
  status: number;
}

// Numbering Rules (Voucher/Receipt)
export interface NumberingRule {
  id?: number | string;
  comp_id: number;
  fin_year_id: number | string;
  type: 'VOUCHER' | 'RECEIPT';
  prefix: string;
  suffix?: string;
  start_no: number;
  status: number;
}

// Religion & Festivals
export interface Religion {
  id?: number | string;
  comp_id: number;
  religion_name: string;
  status: number;
}

export interface Festival {
  id?: number | string;
  comp_id: number;
  religion_id: number | string;
  festival_name: string;
  status: number;
}

export interface FestivalDate {
  id?: number | string;
  festival_id: number | string;
  event_date: string; 
  year: string; 
  status: number;
}

// Lead & Relationship Masters
export interface LeadStage {
  id?: number | string;
  comp_id: number;
  lead_name: string;
  status: number;
}

export interface Relationship {
  id?: number | string;
  comp_id: number;
  relationship_name: string;
  status: number;
}

export interface LeadSource {
  id?: number | string;
  comp_id: number;
  client_id: number;
  ref_desc: string;
  parent_id: number | string; 
  individual: boolean;
  status: number;
  children?: LeadSource[];
}

// Bank Master
export interface BankMaster {
  id?: number | string;
  comp_id: number;
  bank_name: string;
  status: number;
}

export interface AccountType {
  id?: number | string;
  comp_id: number;
  account_type_name: string;
  status: number;
}

// Gender
export interface Gender {
  id?: number | string;
  comp_id: number;
  gender_name: string;
  status: number;
}

// Customer Segment Management
export interface CustomerCategory {
  id?: number | string;
  comp_id: number;
  customer_category: string;
  status: number;
}

export interface CustomerSubCategory {
  id?: number | string;
  comp_id: number;
  cust_sub_cate: string;
  cust_cate_id: number | string;
  status: number;
}

export interface CustomerGroup {
  id?: number | string;
  comp_id: number;
  customer_group: string;
  status: number;
}

export interface CustomerType {
  id?: number | string;
  comp_id: number;
  cust_type: string;
  status: number;
}

// Type & Gift Management
export interface Gift {
  id?: number | string;
  gift_name: string;
  status: number;
}

export interface SumAssuredTier {
  id?: number | string;
  comp_id: number;
  tier_name: string;
  minimum_sum_assured: number;
  assigned_gift: string;
  status: number;
}

export interface PremiumTier {
  id?: number | string;
  comp_id: number;
  tier_name: string;
  minimum_premium: number;
  assigned_gift: string;
  status: number;
}

// --- Expense Master ---
export interface ExpenseCategory {
  id?: number | string;
  comp_id: number;
  expense_cate_name: string;
  status: number;
}

export interface ExpenseHead {
  id?: number | string;
  comp_id: number;
  expense_head_name: string;
  expense_cate_id: number | string;
  get_individual: number; // 1 = Yes, 0 = No
  status: number;
}

export interface ExpenseIndividual {
  id?: number | string;
  comp_id: number;
  individual_name: string;
  expense_head_id: number | string;
  expense_category_id: number | string;
  status: number;
}

// --- Income Master ---
export interface IncomeCategory {
  id?: number | string;
  comp_id: number;
  income_cate: string;
  business_ty_id?: number; // Optional link
  status: number;
}

export interface IncomeHead {
  id?: number | string;
  comp_id: number;
  income_head: string;
  income_cate_id: number | string;
  status: number;
}

// --- Route Master ---
export interface Route {
  id?: number | string;
  comp_id: number;
  route_name: string;
  status: number;
}

// --- Marital Master ---
export interface MaritalStatus {
  id?: number | string;
  comp_id: number;
  marital_status: string;
  status: number;
}

// Policy Config
export interface InsuranceType {
  id?: number | string;
  client_id: number;
  comp_id: number;
  business_vertical_id: number | string;
  insurance_type: string;
  status: number;
}

export interface InsuranceSubType {
  id?: number | string;
  client_id: number;
  comp_id: number;
  insurance_type_id: number | string;
  insurance_sub_type: string;
  status: number;
}

export interface ProcessFlow {
  id?: number | string;
  comp_id: number;
  client_id: number;
  insurance_type_id?: number | string;
  process_desc: string;
  seq_no: number;
  repeat: boolean;
  status: number;
}

export interface PolicyField {
  id?: number | string;
  insurance_type_id: number | string;
  insurance_sub_type_id?: number | string | null;
  field_label: string;
  group_name?: string;
  column_span: number;
  field_type: string;
  status: number;
}

export interface PolicyDocument {
  id?: number | string;
  insurance_type_id: number | string;
  insurance_sub_type_id?: number | string | null;
  doc_master_id: number | string;
  is_mandatory: boolean;
}

// Agency & Scheme
export interface Agency {
  id?: number | string;
  comp_id: number;
  agency_name: string;
  status: number;
}

export interface Scheme {
  id?: number | string;
  comp_id: number;
  scheme_name: string;
  insurance_type_id: number | string;
  insurance_sub_type_id?: number | string;
  agency_id: number | string;
  status: number;
}

// Geography Entities
export interface Country {
  id?: number | string;
  country_name: string;
  status: number;
}

export interface State {
  id?: number | string;
  country_id: number | string;
  state: string;
  status: number;
}

export interface District {
  id?: number | string;
  country_id: number | string;
  state_id: number | string;
  district_name: string;
  status: number;
}

export interface City {
  id?: number | string;
  country_id: number | string;
  state_id: number | string;
  district_id: number | string;
  city: string;
  status: number;
}

export interface Area {
  id?: number | string;
  country_id: number | string;
  state_id: number | string;
  district_id: number | string;
  city_id: number | string;
  area: string; 
  status: number;
}