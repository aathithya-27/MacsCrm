import type { 
    Company, User, Branch, BusinessVertical, 
    InsuranceType, InsuranceSubType, ProcessFlow, InsuranceFieldMaster, DocumentMaster, DocumentRequirement,
    Member, SchemeMaster, Agency, Scheme, Designation, Role, Route, MaritalStatus, Gender,
    RelationshipType, LeadStage, ExpenseCategory, ExpenseHead, ExpenseIndividual, IncomeCategory, IncomeHead,
    Country, State, District, City, Area,
    CustomerCategory, CustomerSubCategory, CustomerGroup, CustomerType,
    CustomerTier, Gift, Religion, Festival, FestivalDate,
    FinancialYear, DocumentNumberingRule, Bank, AccountType
} from '../types';

const now = new Date().toISOString();
const dummyUser = 1;

let countries: Country[] = [
    { id: 1, country_name: 'India', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let states: State[] = [
    { id: 1, country_id: 1, state: 'Maharashtra', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, country_id: 1, state: 'Karnataka', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, country_id: 1, state: 'Andaman and Nicobar Islands', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, country_id: 1, state: 'Andhra Pradesh', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let districts: District[] = [
    { id: 1, country_id: 1, state_id: 1, district: 'Mumbai', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, country_id: 1, state_id: 1, district: 'Pune', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, country_id: 1, state_id: 2, district: 'Bengaluru Urban', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, country_id: 1, state_id: 4, district: 'Adilabad', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let cities: City[] = [
    { id: 1, country_id: 1, state_id: 1, district_id: 1, city: 'Bandra', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, country_id: 1, state_id: 1, district_id: 2, city: 'Pune City', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, country_id: 1, state_id: 2, district_id: 3, city: 'Bengaluru', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let areas: Area[] = [
    { id: 1, country_id: 1, state_id: 1, district_id: 1, city_id: 1, area: 'Financial District', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];


const companies: Company[] = [
    {
        id: 1,
        comp_id: 1,
        client_id: 101,
        comp_code: 'FIN01',
        comp_name: 'Finroots',
        mailing_name: 'Finroots Financial Services Pvt. Ltd.',
        date_of_creation: '2020-07-01',
        status: 1,
        address_1: '123 Financial Street',
        address_2: 'Bandra',
        address_3: '',
        state_id: 1, 
        city_id: 1, 
        area_id: 1, 
        pin_code: '400050',
        phone_no: '+91 22 12345678',
        email: 'info@finroots.com',
        fax_no: '',
        gst_no: '27ABCDE1234F1Z5',
        pan_no: 'ABCDE1234F',
        tan_no: 'MUMF12345G',
        modified_on: '2023-10-27T10:00:00Z',
    }
];

let branches: Branch[] = [
    {
        id: 1,
        branch_id: 1,
        comp_id: 1,
        branch_code: 'MUM',
        branch_name: 'Mumbai Head Office',
        date_of_creation: '2021-01-15',
        status: 1,
        address_1: '456 Business Avenue',
        address_2: 'Andheri',
        address_3: 'Near Metro Station',
        state_id: 1, 
        city_id: 1, 
        area_id: 1, 
        pincode: '400093',
        phone_no: '+91 22 87654321',
        fax_no: '',
        gst_no: '27LMNOP1234F1Z5',
        pan_no: 'LMNOP1234F',
        tan_no: 'MUML12345G',
        created_by: 1,
        modified_by: 1,
        modified_on: '2023-11-10T11:00:00Z',
    },
    {
        id: 2,
        branch_id: 2,
        comp_id: 1,
        branch_code: 'PUN',
        branch_name: 'Pune Branch',
        date_of_creation: '2022-05-20',
        status: 1,
        address_1: '789 Tech Park',
        address_2: 'Hinjewadi',
        address_3: '',
        state_id: 1, 
        city_id: 2, 
        area_id: null,
        pincode: '411057',
        phone_no: '+91 20 98765432',
        fax_no: '',
        gst_no: '27QRSTU1234F1Z6',
        pan_no: 'QRSTU1234F',
        tan_no: 'PUNQ12345H',
        created_by: 1,
        modified_by: 1,
        modified_on: '2023-12-01T15:30:00Z',
    }
];

let businessVerticals: BusinessVertical[] = [
    { id: 1, client_id: 101, comp_id: 1, business_vertical_name: 'Insurance', created_on: '2023-01-10T10:00:00Z', modified_on: '2023-10-27T11:00:00Z', created_by: 1, modified_by: 1, status: 1 },
    { id: 2, client_id: 101, comp_id: 1, business_vertical_name: 'Mutual Funds', created_on: '2023-02-15T10:00:00Z', modified_on: '2023-11-01T12:00:00Z', created_by: 1, modified_by: 1, status: 1 },
    { id: 3, client_id: 101, comp_id: 1, business_vertical_name: 'Agent Appointments (SA)', created_on: '2023-03-20T10:00:00Z', modified_on: '2023-11-15T13:00:00Z', created_by: 1, modified_by: 1, status: 0 },
];


let insuranceTypes: InsuranceType[] = [
    { id: 1, insurance_type: 'Life Insurance', business_vertical_id: 1, status: 1, client_id: 101, comp_id: 1, date_of_creation: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, insurance_type: 'Health Insurance', business_vertical_id: 1, status: 1, client_id: 101, comp_id: 1, date_of_creation: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, insurance_type: 'General Insurance', business_vertical_id: 1, status: 1, client_id: 101, comp_id: 1, date_of_creation: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let insuranceSubTypes: InsuranceSubType[] = [
    { id: 101, insurance_sub_type: 'Whole Life Insurance', insurance_type_id: 1, status: 1, client_id: 101, comp_id: 1, date_of_creation: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 102, insurance_sub_type: 'Term Life Insurance', insurance_type_id: 1, status: 1, client_id: 101, comp_id: 1, date_of_creation: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 103, insurance_sub_type: 'Endowment Plans', insurance_type_id: 1, status: 0, client_id: 101, comp_id: 1, date_of_creation: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 104, insurance_sub_type: 'Unit-linked Insurance Plan', insurance_type_id: 1, status: 1, client_id: 101, comp_id: 1, date_of_creation: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let processFlows: ProcessFlow[] = [
    { id: 1, insurance_type_id: 1, process_desc: 'Initial Contact', status: 1, seq_no: 0, repeat: false, client_id: 101, comp_id: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, insurance_type_id: 1, process_desc: 'Requirement Analysis', status: 1, seq_no: 1, repeat: false, client_id: 101, comp_id: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, insurance_type_id: 1, process_desc: 'Plan Presentation', status: 1, seq_no: 2, repeat: false, client_id: 101, comp_id: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, insurance_type_id: 1, process_desc: 'Application Form Filling', status: 1, seq_no: 3, repeat: false, client_id: 101, comp_id: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 5, insurance_type_id: 1, process_desc: 'Premium Collection', status: 1, seq_no: 4, repeat: false, client_id: 101, comp_id: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 6, insurance_type_id: 1, process_desc: 'Policy Issuance', status: 1, seq_no: 5, repeat: false, client_id: 101, comp_id: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 7, insurance_type_id: 2, process_desc: 'Enquiry', status: 1, seq_no: 0, repeat: false, client_id: 101, comp_id: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 8, insurance_type_id: 2, process_desc: 'Medical Check-up', status: 1, seq_no: 1, repeat: false, client_id: 101, comp_id: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 9, insurance_type_id: 2, process_desc: 'Documentation', status: 1, seq_no: 2, repeat: false, client_id: 101, comp_id: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let insuranceFields: InsuranceFieldMaster[] = [
    { id: 1, insurance_type_id: 1, field_group: 'Personal Information', field_label: "Father's Name", field_name: "fatherName", cdata_type: 'Text Input', column_span: 1, status: 1, seq_no: 0 },
    { id: 2, insurance_type_id: 1, field_group: 'Personal Information', field_label: "Mother's Name", field_name: "motherName", cdata_type: 'Text Input', column_span: 1, status: 1, seq_no: 1 },
    { id: 3, insurance_type_id: 1, field_group: 'Personal Information', field_label: "Spouse's Full Name", field_name: "spouseName", cdata_type: 'Text Input', column_span: 1, status: 1, seq_no: 2 },
    { id: 4, insurance_type_id: 1, field_group: 'Personal Information', field_label: "Place of Birth", field_name: "birthPlace", cdata_type: 'Text Input', column_span: 1, status: 0, seq_no: 3 },
];

let documentMasters: DocumentMaster[] = [
    { id: 1, doc_name: 'PAN Card', status: 1, seq_no: 0 },
    { id: 2, doc_name: 'Aadhaar Card', status: 1, seq_no: 1 },
    { id: 3, doc_name: 'Passport', status: 1, seq_no: 2 },
    { id: 4, doc_name: 'Driving License', status: 1, seq_no: 3 },
    { id: 5, doc_name: 'Bank Statement', status: 1, seq_no: 4 },
];

let documentRequirements: DocumentRequirement[] = [
    { id: 1, insu_type_id: 1, doc_id: 1, is_mandatory: 1, comp_id: 1, status: 1, created_by: 1, created_on: now, modified_by: 1, modified_on: now },
    { id: 2, insu_type_id: 1, doc_id: 2, is_mandatory: 1, comp_id: 1, status: 1, created_by: 1, created_on: now, modified_by: 1, modified_on: now },
    { id: 3, insu_type_id: 1, insu_sub_type_id: 101, doc_id: 1, is_mandatory: 1, comp_id: 1, status: 1, created_by: 1, created_on: now, modified_by: 1, modified_on: now },
];

const allMembers: Member[] = [
    { id: 'mem_1', name: 'John Doe', process_stages: { 'it_1': 'Premium Collection' }, policies: [{ id: 'pol_1', insurance_type_id: 'it_1', scheme_name: 'Jeevan Anand', dynamic_data: { fatherName: 'Richard Doe' } }], route_id: 1, gender_id: 1, marital_status_id: 2, customer_category_id: 1, customer_sub_category_id: 1, customer_group_id: 1, customer_type_id: 2 },
    { id: 'mem_2', name: 'Jane Smith', process_stages: { 'it_1': 'Plan Presentation' }, route_id: 2, gender_id: 2, marital_status_id: 1, customer_category_id: 2, customer_group_id: 2, customer_type_id: 1 },
];

const schemesMaster: SchemeMaster[] = [
    { id: 'sch_1', name: 'Jeevan Anand', insurance_type_id: 'it_1' },
    { id: 'sch_2', name: 'Health Guard', insurance_type_id: 'it_2' },
    { id: 'sch_3', name: 'Term Shield', insurance_type_id: 'it_sub_2' },
];

let agencies: Agency[] = [
    { id: 1, comp_id: 1, agency_name: 'Max Life Insurance', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 2, comp_id: 1, agency_name: 'Life Insurance Corporation (LIC)', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 3, comp_id: 1, agency_name: 'HDFC Life', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 4, comp_id: 1, agency_name: 'ICICI Prudential Life Insurance', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 5, comp_id: 1, agency_name: 'Star Health & Allied Insurance', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 6, comp_id: 1, agency_name: 'Niva Bupa', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 0 },
    { id: 7, comp_id: 1, agency_name: 'HDFC ERGO Health', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 8, comp_id: 1, agency_name: 'Care Health Insurance', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 9, comp_id: 1, agency_name: 'ICICI Lombard', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 10, comp_id: 1, agency_name: 'Bajaj Allianz General Insurance', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 11, comp_id: 1, agency_name: 'Tata AIG General Insurance', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 12, comp_id: 1, agency_name: 'New India Assurance', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 13, comp_id: 1, agency_name: 'Oriental Insurance', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
    { id: 14, comp_id: 1, agency_name: 'United India Insurance', created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1 },
];

let schemes: Scheme[] = [
    { id: 1, comp_id: 1, agency_id: 1, scheme_name: 'Smart Secure Plus Plan', insurance_type_id: 1, insurance_sub_type_id: 102, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1, seq_no: 0 },
    { id: 2, comp_id: 1, agency_id: 1, scheme_name: 'Smart Secure Plus Plan', insurance_type_id: 1, insurance_sub_type_id: 101, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1, seq_no: 1 },
    { id: 3, comp_id: 1, agency_id: 2, scheme_name: 'Jeevan Labh', insurance_type_id: 1, insurance_sub_type_id: 103, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser, status: 1, seq_no: 0 },
];

let designations: Designation[] = [
    { id: 1, comp_id: 1, designation_name: 'Admin', rank: null, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, designation_name: 'Advisor', rank: null, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, designation_name: 'Secretary', rank: null, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, comp_id: 1, designation_name: 'Support', rank: null, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 5, comp_id: 1, designation_name: 'Security', rank: null, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let roles: Role[] = [
    { id: 1, comp_id: 1, role_desc: 'System Administrator', is_advisor_role: 0, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, role_desc: 'Sales Advisor', is_advisor_role: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, role_desc: 'Office Secretary', is_advisor_role: 0, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, comp_id: 1, role_desc: 'Support Staff', is_advisor_role: 0, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let routes: Route[] = [
    { id: 1, route_name: 'Chennai-Madurai', comp_id: 1, status: 1, seq_no: 0, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, route_name: 'Zone A Delivery Route', comp_id: 1, status: 1, seq_no: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, route_name: 'Mumbai-Pune Express', comp_id: 1, status: 0, seq_no: 2, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let maritalStatuses: MaritalStatus[] = [
    { id: 1, marital_status: 'Single', status: 1, seq_no: 0, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, marital_status: 'Married', status: 1, seq_no: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, marital_status: 'Divorced', status: 1, seq_no: 2, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, marital_status: 'Widowed', status: 1, seq_no: 3, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let genders: Gender[] = [
    { id: 1, gender_name: 'Male', status: 1, seq_no: 0, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, gender_name: 'Female', status: 1, seq_no: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, gender_name: 'Transgender', status: 1, seq_no: 2, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, gender_name: 'Other', status: 1, seq_no: 3, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let relationshipTypes: RelationshipType[] = [
    { id: 1, relationship_name: 'Self', comp_id: 1, status: 1, seq_no: 0, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, relationship_name: 'Spouse', comp_id: 1, status: 1, seq_no: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, relationship_name: 'Son', comp_id: 1, status: 1, seq_no: 2, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, relationship_name: 'Daughter', comp_id: 1, status: 1, seq_no: 3, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 5, relationship_name: 'Father', comp_id: 1, status: 1, seq_no: 4, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 6, relationship_name: 'Mother', comp_id: 1, status: 1, seq_no: 5, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let leadStages: LeadStage[] = [
    { id: 1, lead_name: 'Lead', comp_id: 1, status: 1, seq_no: 0, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, lead_name: 'Contacted', comp_id: 1, status: 1, seq_no: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, lead_name: 'Meeting Scheduled', comp_id: 1, status: 1, seq_no: 2, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, lead_name: 'Proposal Sent', comp_id: 1, status: 1, seq_no: 3, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];


let expenseCategories: ExpenseCategory[] = [
    { id: 1, comp_id: 1, expense_cate_name: 'Administrative Expenses', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, expense_cate_name: 'Marketing Expenses', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let expenseHeads: ExpenseHead[] = [
    { id: 1, comp_id: 1, expense_head_name: 'Salary', expense_cate_id: 1, get_individual: 0, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, expense_head_name: 'Rent', expense_cate_id: 1, get_individual: 0, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, expense_head_name: "MD's Travel", expense_cate_id: 1, get_individual: 0, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, comp_id: 1, expense_head_name: 'Print Media Ad', expense_cate_id: 2, get_individual: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 5, comp_id: 1, expense_head_name: 'Digital Media', expense_cate_id: 2, get_individual: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let expenseIndividuals: ExpenseIndividual[] = [
    { id: 1, comp_id: 1, individual_name: 'Staff Incentive', expense_head_id: 1, expense_cate_id: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, individual_name: 'Google Ads', expense_head_id: 5, expense_cate_id: 2, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let incomeCategories: IncomeCategory[] = [
    { id: 1, comp_id: 1, income_cate: 'Direct Income', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, income_cate: 'Indirect Income', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let incomeHeads: IncomeHead[] = [
    { id: 1, comp_id: 1, income_head: 'Commission', income_cate_id: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, income_head: 'Consultancy Fees', income_cate_id: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, income_head: 'Interest Received', income_cate_id: 2, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let customerCategories: CustomerCategory[] = [
    { id: 1, comp_id: 1, customer_category: 'Salaried', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, customer_category: 'Business', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, customer_category: 'Professional', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let customerSubCategories: CustomerSubCategory[] = [
    { id: 1, comp_id: 1, cust_cate_id: 1, cust_sub_cate: 'IT/Software', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, cust_cate_id: 1, cust_sub_cate: 'Manufacturing', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, cust_cate_id: 3, cust_sub_cate: 'Doctor', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, comp_id: 1, cust_cate_id: 3, cust_sub_cate: 'Government', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 5, comp_id: 1, cust_cate_id: 2, cust_sub_cate: 'Trading', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 6, comp_id: 1, cust_cate_id: 3, cust_sub_cate: 'Lawyer', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let customerGroups: CustomerGroup[] = [
    { id: 1, comp_id: 1, customer_group: 'HNI', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, customer_group: 'Mid-Income', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, customer_group: 'Affluent', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let customerTypes: CustomerType[] = [
    { id: 1, comp_id: 1, cust_type: 'Silver', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, cust_type: 'Gold', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, cust_type: 'Diamond', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, comp_id: 1, cust_type: 'Platinum', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let customerTiers: CustomerTier[] = [
    { id: 1, comp_id: 1, cust_type_id: 1, minimum_sum_assured: 100000, minimum_premium: 10000, assigned_gift_id: 1, status: 1, seq_no: 0, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, cust_type_id: 2, minimum_sum_assured: 500000, minimum_premium: 25000, assigned_gift_id: 2, status: 1, seq_no: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, cust_type_id: 3, minimum_sum_assured: 1000000, minimum_premium: 50000, assigned_gift_id: 3, status: 1, seq_no: 2, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let gifts: Gift[] = [
    { id: 1, comp_id: 1, gift_name: 'Travel Voucher', status: 1, seq_no: 0, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, gift_name: 'Smartwatch', status: 1, seq_no: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, gift_name: 'Bluetooth Speaker', status: 1, seq_no: 2, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, comp_id: 1, gift_name: 'Mug', status: 0, seq_no: 3, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let religions: Religion[] = [
    { id: 1, comp_id: 1, religion: 'Hinduism', status: 1, seq_no: 0, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, religion: 'Christianity', status: 1, seq_no: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, religion: 'Islam', status: 1, seq_no: 2, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, comp_id: 1, religion: 'Sikhism', status: 1, seq_no: 3, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 5, comp_id: 1, religion: 'General', status: 1, seq_no: 4, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let festivals: Festival[] = [
    { id: 1, comp_id: 1, religion_id: 1, fest_desc: 'Diwali', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, religion_id: 3, fest_desc: 'Eid al-Fitr', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, religion_id: 1, fest_desc: 'Holi', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, comp_id: 1, religion_id: 2, fest_desc: 'Good Friday', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 5, comp_id: 1, religion_id: 2, fest_desc: 'Christmas', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 6, comp_id: 1, religion_id: 5, fest_desc: "New Year's Day", status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let festivalDates: FestivalDate[] = [
    { id: 1, comp_id: 1, fest_id: 5, festvel_date: '2025-12-25', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, fest_id: 1, festvel_date: '2025-10-21', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, comp_id: 1, fest_id: 2, festvel_date: '2025-03-30', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 4, comp_id: 1, fest_id: 4, festvel_date: '2025-04-18', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 5, comp_id: 1, fest_id: 3, festvel_date: '2025-03-14', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 6, comp_id: 1, fest_id: 6, festvel_date: '2025-01-01', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 7, comp_id: 1, fest_id: 5, festvel_date: '2024-12-25', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 8, comp_id: 1, fest_id: 2, festvel_date: '2026-03-20', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let financialYears: FinancialYear[] = [
    { id: 1, comp_id: 1, from_date: '2023-04-01', to_date: '2024-03-31', fin_year: '2023-2024', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, comp_id: 1, from_date: '2024-04-01', to_date: '2025-03-31', fin_year: '2024-2025', status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let documentNumberingRules: DocumentNumberingRule[] = [
    { id: 1, comp_id: 1, fin_year_id: 2, type: 'Voucher', prefix: 'VCH/24-25/', starting_no: 1, suffix: null, status: 1 },
    { id: 2, comp_id: 1, fin_year_id: 2, type: 'Receipt', prefix: 'RCT/24-25/', starting_no: 1, suffix: null, status: 1 },
];

let banks: Bank[] = [
    { id: 1, bank_name: 'State Bank of India', comp_id: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, bank_name: 'HDFC Bank', comp_id: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

let accountTypes: AccountType[] = [
    { id: 1, account_type_name: 'Current Account', comp_id: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 2, account_type_name: 'Overdraft Account', comp_id: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
    { id: 3, account_type_name: 'Cash Credit Account', comp_id: 1, status: 1, created_on: now, modified_on: now, created_by: dummyUser, modified_by: dummyUser },
];

const currentUser: User = {
    id: 101,
    name: 'Admin User',
    comp_id: 1,
};

export const db = {
    countries,
    states,
    districts,
    cities,
    areas,
    companies,
    branches,
    businessVerticals,
    insuranceTypes,
    insuranceSubTypes,
    processFlows,
    insuranceFields,
    documentMasters,
    documentRequirements,
    allMembers,
    schemesMaster,
    agencies,
    schemes,
    designations,
    roles,
    routes,
    maritalStatuses,
    genders,
    relationshipTypes,
    leadStages,
    expenseCategories,
    expenseHeads,
    expenseIndividuals,
    incomeCategories,
    incomeHeads,
    customerCategories,
    customerSubCategories,
    customerGroups,
    customerTypes,
    customerTiers,
    gifts,
    religions,
    festivals,
    festivalDates,
    financialYears,
    documentNumberingRules,
    banks,
    accountTypes,
    currentUser
};