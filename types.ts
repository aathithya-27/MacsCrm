export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

export interface Company {
    id: number;
    comp_id: number;
    client_id: number;
    comp_code: string;
    comp_name: string;
    mailing_name?: string | null;
    date_of_creation?: string | null;
    status: number; 
    address_1?: string | null;
    address_2?: string | null;
    address_3?: string | null;
    phone_no?: string | null;
    email?: string | null;
    area_id?: number | null;
    city_id?: number | null;
    state_id?: number | null;
    pin_code?: string | null;
    fax_no?: string | null;
    gst_no?: string | null;
    pan_no?: string | null;
    tan_no?: string | null;
    modified_on: string;
}

export interface User {
    id: number;
    name: string;
    comp_id: number;
}

export interface Country {
    id: number;
    country_name: string;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
    status: number;
}

export interface State {
    id: number;
    country_id: number;
    state: string; 
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
    status: number;
}

export interface District {
    id: number;
    state_id: number;
    country_id: number;
    district: string; 
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
    status: number;
}

export interface City {
    id: number;
    district_id: number;
    state_id: number;
    country_id: number;
    city: string; 
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
    status: number; 
}

export interface Area {
    id: number;
    city_id: number;
    district_id: number;
    state_id: number;
    country_id: number;
    area: string; 
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
    status: number; 
}


export interface SelectOption {
    value: string;
    label: string;
}

export interface Branch {
    id: number;
    branch_id: number;
    comp_id: number;
    branch_name: string;
    branch_code: string; 
    address_1?: string | null;
    address_2?: string | null;
    address_3?: string | null;
    area_id?: number | null;
    city_id?: number | null;
    state_id?: number | null;
    pincode?: string | null;
    phone_no?: string | null;
    fax_no?: string | null;
    gst_no?: string | null;
    pan_no?: string | null;
    tan_no?: string | null;
    date_of_creation?: string | null;
    modified_on: string;
    created_by?: number | null;
    modified_by?: number | null;
    status: number; 
}

export interface BusinessVertical {
    id: number;
    client_id: number;
    comp_id: number;
    business_vertical_name: string;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
    status: number; 
}


export interface InsuranceType {
    id: number;
    client_id: number;
    comp_id: number;
    insurance_type: string;
    business_vertical_id: number;
    date_of_creation: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
    status: number;
}

export interface InsuranceSubType {
    id: number;
    client_id: number;
    comp_id: number;
    insurance_sub_type: string;
    insurance_type_id: number;
    date_of_creation: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
    status: number;
}

export type FieldType = 'Text Input' | 'Number Input' | 'Date Input' | 'Toggle (Yes/No)' | 'Dropdown (Select)' | 'Checkbox Group' | 'Table';

export interface InsuranceFieldMaster {
    id: number;
    insurance_type_id: number;
    field_group: string;
    field_label: string;
    field_name: string;
    cdata_type: FieldType;
    column_span: 1 | 2 | 3;
    status: number;
    seq_no: number;
    options?: string[];
}

export interface ProcessFlow {
    id: number;
    comp_id: number;
    client_id: number;
    insurance_type_id: number;
    process_desc: string;
    seq_no: number;
    repeat: boolean;
    created_on: string;
    created_by: number;
    modified_on: string;
    modified_by: number;
    status: number;
}

export interface DocumentMaster {
    id: number;
    doc_name: string;
    status: number;
    seq_no: number;
}

export interface DocumentRequirement {
    id: number;
    comp_id: number;
    doc_id: number;
    insu_type_id: number;
    insu_sub_type_id?: number | null;
    is_mandatory: number;
    created_on: string;
    created_by: number;
    modified_on: string;
    modified_by: number;
    status: number;
}

export interface Member {
  id: string;
  name: string;
  policies?: Policy[];
  process_stages?: { [insurance_type_id: string]: string };
  route_id?: number;
  gender_id?: number;
  marital_status_id?: number;
  state?: string;
  district?: string;
  city?: string;
  area?: string;
  customer_category_id?: number;
  customer_sub_category_id?: number;
  customer_group_id?: number;
  customer_type_id?: number;
}

export interface Policy {
  id: string;
  insurance_type_id: string;
  scheme_name?: string;
  dynamic_data?: { [key:string]: any };
  covered_members?: { relationship: string }[];
}

export interface SchemeMaster {
    id: string;
    name: string;
    insurance_type_id: string;
}

export interface Agency {
  id: number;
  comp_id: number;
  agency_name: string;
  created_on: string;
  modified_on: string;
  created_by: number;
  modified_by: number;
  status: number; 
}

export interface Scheme {
  id: number;
  comp_id: number;
  scheme_name: string;
  insurance_type_id: number;
  insurance_sub_type_id?: number | null; 
  agency_id: number;
  seq_no?: number;
  created_on: string;
  modified_on: string;
  created_by: number;
  modified_by: number;
  status: number;
}

export interface Designation {
  id: number;
  comp_id: number;
  designation_name: string;
  rank?: number | null;
  created_on: string;
  modified_on: string;
  created_by: number;
  modified_by: number;
  status: number; 
}

export interface Role {
    id: number;
    comp_id: number;
    role_desc: string;
    is_advisor_role: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface Route {
    id: number;
    comp_id: number;
    route_name: string;
    seq_no: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface MaritalStatus {
    id: number;
    marital_status: string;
    seq_no: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface Gender {
    id: number;
    gender_name: string;
    seq_no: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface RelationshipType {
    id: number;
    comp_id: number;
    relationship_name: string;
    seq_no: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface LeadStage {
    id: number;
    comp_id: number;
    lead_name: string;
    seq_no: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface ExpenseCategory {
    id: number;
    comp_id: number;
    expense_cate_name: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface ExpenseHead {
    id: number;
    comp_id: number;
    expense_head_name: string;
    expense_cate_id: number;
    get_individual: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface ExpenseIndividual {
    id: number;
    comp_id: number;
    individual_name: string;
    expense_head_id: number;
    expense_cate_id: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface IncomeCategory {
    id: number;
    comp_id: number;
    income_cate: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface IncomeHead {
    id: number;
    comp_id: number;
    income_head: string;
    income_cate_id: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface CustomerCategory {
    id: number;
    comp_id: number;
    customer_category: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface CustomerSubCategory {
    id: number;
    comp_id: number;
    cust_cate_id: number;
    cust_sub_cate: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface CustomerGroup {
    id: number;
    comp_id: number;
    customer_group: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface CustomerType {
    id: number;
    comp_id: number;
    cust_type: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface CustomerTier {
    id: number;
    comp_id: number;
    cust_type_id: number;
    minimum_sum_assured: number;
    minimum_premium: number;
    assigned_gift_id?: number | null;
    status: number;
    seq_no: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface Gift {
    id: number;
    comp_id: number;
    gift_name: string;
    status: number;
    seq_no: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface Religion {
    id: number;
    comp_id: number;
    religion: string;
    seq_no: number;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface Festival {
    id: number;
    comp_id: number;
    religion_id?: number | null;
    fest_desc: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface FestivalDate {
    id: number;
    comp_id: number;
    fest_id: number;
    festvel_date: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface FinancialYear {
    id: number;
    comp_id: number;
    from_date: string;
    to_date: string;
    fin_year: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface DocumentNumberingRule {
    id: number;
    comp_id: number;
    fin_year_id: number;
    type: 'Voucher' | 'Receipt';
    prefix: string;
    starting_no: number;
    suffix?: string | null;
    status: number;
}

export interface Bank {
    id: number;
    comp_id: number;
    bank_name: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface AccountType {
    id: number;
    comp_id: number;
    account_type_name: string;
    status: number;
    created_on: string;
    modified_on: string;
    created_by: number;
    modified_by: number;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}