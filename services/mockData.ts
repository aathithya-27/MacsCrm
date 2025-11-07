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
    { ID: 1, COUNTRY_NAME: 'India', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let states: State[] = [
    { ID: 1, COUNTRY_ID: 1, STATE: 'Maharashtra', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COUNTRY_ID: 1, STATE: 'Karnataka', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COUNTRY_ID: 1, STATE: 'Andaman and Nicobar Islands', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COUNTRY_ID: 1, STATE: 'Andhra Pradesh', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let districts: District[] = [
    { ID: 1, COUNTRY_ID: 1, STATE_ID: 1, DISTRICT: 'Mumbai', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COUNTRY_ID: 1, STATE_ID: 1, DISTRICT: 'Pune', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COUNTRY_ID: 1, STATE_ID: 2, DISTRICT: 'Bengaluru Urban', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COUNTRY_ID: 1, STATE_ID: 4, DISTRICT: 'Adilabad', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let cities: City[] = [
    { ID: 1, COUNTRY_ID: 1, STATE_ID: 1, DISTRICT_ID: 1, CITY: 'Bandra', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COUNTRY_ID: 1, STATE_ID: 1, DISTRICT_ID: 2, CITY: 'Pune City', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COUNTRY_ID: 1, STATE_ID: 2, DISTRICT_ID: 3, CITY: 'Bengaluru', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let areas: Area[] = [
    { ID: 1, COUNTRY_ID: 1, STATE_ID: 1, DISTRICT_ID: 1, CITY_ID: 1, AREA: 'Financial District', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];


const companies: Company[] = [
    {
        id: 1,
        COMP_ID: 1,
        CLIENT_ID: 101,
        COMP_CODE: 'FIN01',
        COMP_NAME: 'Finroots',
        MAILING_NAME: 'Finroots Financial Services Pvt. Ltd.',
        DATE_OF_CREATION: '2020-07-01',
        STATUS: 1,
        ADDRESS_1: '123 Financial Street',
        ADDRESS_2: 'Bandra',
        ADDRESS_3: '',
        STATE_ID: 1, 
        CITY_ID: 1, 
        AREA_ID: 1, 
        PIN_CODE: '400050',
        PHONE_NO: '+91 22 12345678',
        EMAIL: 'info@finroots.com',
        FAX_NO: '',
        GST_NO: '27ABCDE1234F1Z5',
        PAN_NO: 'ABCDE1234F',
        TAN_NO: 'MUMF12345G',
        MODIFIED_ON: '2023-10-27T10:00:00Z',
    }
];

let branches: Branch[] = [
    {
        BRANCH_ID: 1,
        COMP_ID: 1,
        BRANCH_CODE: 'MUM',
        BRANCH_NAME: 'Mumbai Head Office',
        DATE_OF_CREATION: '2021-01-15',
        STATUS: 1,
        ADDRESS_1: '456 Business Avenue',
        ADDRESS_2: 'Andheri',
        ADDRESS_3: 'Near Metro Station',
        STATE_ID: 1, 
        CITY_ID: 1, 
        AREA_ID: 1, 
        PINCODE: '400093',
        PHONE_NO: '+91 22 87654321',
        FAX_NO: '',
        GST_NO: '27LMNOP1234F1Z5',
        PAN_NO: 'LMNOP1234F',
        TAN_NO: 'MUML12345G',
        CREATED_BY: 1,
        MODIFIED_BY: 1,
        MODIFIED_ON: '2023-11-10T11:00:00Z',
    },
    {
        BRANCH_ID: 2,
        COMP_ID: 1,
        BRANCH_CODE: 'PUN',
        BRANCH_NAME: 'Pune Branch',
        DATE_OF_CREATION: '2022-05-20',
        STATUS: 1,
        ADDRESS_1: '789 Tech Park',
        ADDRESS_2: 'Hinjewadi',
        ADDRESS_3: '',
        STATE_ID: 1, 
        CITY_ID: 2, 
        AREA_ID: null,
        PINCODE: '411057',
        PHONE_NO: '+91 20 98765432',
        FAX_NO: '',
        GST_NO: '27QRSTU1234F1Z6',
        PAN_NO: 'QRSTU1234F',
        TAN_NO: 'PUNQ12345H',
        CREATED_BY: 1,
        MODIFIED_BY: 1,
        MODIFIED_ON: '2023-12-01T15:30:00Z',
    }
];

let businessVerticals: BusinessVertical[] = [
    { ID: 1, CLIENT_ID: 101, COMP_ID: 1, BUSINESS_VERTICAL_NAME: 'Insurance', CREATED_ON: '2023-01-10T10:00:00Z', MODIFIED_ON: '2023-10-27T11:00:00Z', CREATED_BY: 1, MODIFIED_BY: 1, STATUS: 1 },
    { ID: 2, CLIENT_ID: 101, COMP_ID: 1, BUSINESS_VERTICAL_NAME: 'Mutual Funds', CREATED_ON: '2023-02-15T10:00:00Z', MODIFIED_ON: '2023-11-01T12:00:00Z', CREATED_BY: 1, MODIFIED_BY: 1, STATUS: 1 },
    { ID: 3, CLIENT_ID: 101, COMP_ID: 1, BUSINESS_VERTICAL_NAME: 'Agent Appointments (SA)', CREATED_ON: '2023-03-20T10:00:00Z', MODIFIED_ON: '2023-11-15T13:00:00Z', CREATED_BY: 1, MODIFIED_BY: 1, STATUS: 0 },
];


let insuranceTypes: InsuranceType[] = [
    { ID: 1, INSURANCE_TYPE: 'Life Insurance', BUSINESS_VERTICAL_ID: 1, STATUS: 1, CLIENT_ID: 101, COMP_ID: 1, DATE_OF_CREATION: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, INSURANCE_TYPE: 'Health Insurance', BUSINESS_VERTICAL_ID: 1, STATUS: 1, CLIENT_ID: 101, COMP_ID: 1, DATE_OF_CREATION: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, INSURANCE_TYPE: 'General Insurance', BUSINESS_VERTICAL_ID: 1, STATUS: 1, CLIENT_ID: 101, COMP_ID: 1, DATE_OF_CREATION: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let insuranceSubTypes: InsuranceSubType[] = [
    { ID: 101, INSURANCE_SUB_TYPE: 'Whole Life Insurance', INSURANCE_TYPE_ID: 1, STATUS: 1, CLIENT_ID: 101, COMP_ID: 1, DATE_OF_CREATION: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 102, INSURANCE_SUB_TYPE: 'Term Life Insurance', INSURANCE_TYPE_ID: 1, STATUS: 1, CLIENT_ID: 101, COMP_ID: 1, DATE_OF_CREATION: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 103, INSURANCE_SUB_TYPE: 'Endowment Plans', INSURANCE_TYPE_ID: 1, STATUS: 0, CLIENT_ID: 101, COMP_ID: 1, DATE_OF_CREATION: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 104, INSURANCE_SUB_TYPE: 'Unit-linked Insurance Plan', INSURANCE_TYPE_ID: 1, STATUS: 1, CLIENT_ID: 101, COMP_ID: 1, DATE_OF_CREATION: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let processFlows: ProcessFlow[] = [
    { ID: 1, INSURANCE_TYPE_ID: 1, PROCESS_DESC: 'Initial Contact', STATUS: 1, SEQ_NO: 0, REPEAT: false, CLIENT_ID: 101, COMP_ID: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, INSURANCE_TYPE_ID: 1, PROCESS_DESC: 'Requirement Analysis', STATUS: 1, SEQ_NO: 1, REPEAT: false, CLIENT_ID: 101, COMP_ID: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, INSURANCE_TYPE_ID: 1, PROCESS_DESC: 'Plan Presentation', STATUS: 1, SEQ_NO: 2, REPEAT: false, CLIENT_ID: 101, COMP_ID: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, INSURANCE_TYPE_ID: 1, PROCESS_DESC: 'Application Form Filling', STATUS: 1, SEQ_NO: 3, REPEAT: false, CLIENT_ID: 101, COMP_ID: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 5, INSURANCE_TYPE_ID: 1, PROCESS_DESC: 'Premium Collection', STATUS: 1, SEQ_NO: 4, REPEAT: false, CLIENT_ID: 101, COMP_ID: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 6, INSURANCE_TYPE_ID: 1, PROCESS_DESC: 'Policy Issuance', STATUS: 1, SEQ_NO: 5, REPEAT: false, CLIENT_ID: 101, COMP_ID: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 7, INSURANCE_TYPE_ID: 2, PROCESS_DESC: 'Enquiry', STATUS: 1, SEQ_NO: 0, REPEAT: false, CLIENT_ID: 101, COMP_ID: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 8, INSURANCE_TYPE_ID: 2, PROCESS_DESC: 'Medical Check-up', STATUS: 1, SEQ_NO: 1, REPEAT: false, CLIENT_ID: 101, COMP_ID: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 9, INSURANCE_TYPE_ID: 2, PROCESS_DESC: 'Documentation', STATUS: 1, SEQ_NO: 2, REPEAT: false, CLIENT_ID: 101, COMP_ID: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let insuranceFields: InsuranceFieldMaster[] = [
    { ID: 1, INSURANCE_TYPE_ID: 1, FIELD_GROUP: 'Personal Information', FIELD_LABEL: "Father's Name", FIELD_NAME: "fatherName", CDATA_TYPE: 'Text Input', COLUMN_SPAN: 1, STATUS: 1, SEQ_NO: 0 },
    { ID: 2, INSURANCE_TYPE_ID: 1, FIELD_GROUP: 'Personal Information', FIELD_LABEL: "Mother's Name", FIELD_NAME: "motherName", CDATA_TYPE: 'Text Input', COLUMN_SPAN: 1, STATUS: 1, SEQ_NO: 1 },
    { ID: 3, INSURANCE_TYPE_ID: 1, FIELD_GROUP: 'Personal Information', FIELD_LABEL: "Spouse's Full Name", FIELD_NAME: "spouseName", CDATA_TYPE: 'Text Input', COLUMN_SPAN: 1, STATUS: 1, SEQ_NO: 2 },
    { ID: 4, INSURANCE_TYPE_ID: 1, FIELD_GROUP: 'Personal Information', FIELD_LABEL: "Place of Birth", FIELD_NAME: "birthPlace", CDATA_TYPE: 'Text Input', COLUMN_SPAN: 1, STATUS: 0, SEQ_NO: 3 },
];

let documentMasters: DocumentMaster[] = [
    { ID: 1, DOC_NAME: 'PAN Card', STATUS: 1, SEQ_NO: 0 },
    { ID: 2, DOC_NAME: 'Aadhaar Card', STATUS: 1, SEQ_NO: 1 },
    { ID: 3, DOC_NAME: 'Passport', STATUS: 1, SEQ_NO: 2 },
    { ID: 4, DOC_NAME: 'Driving License', STATUS: 1, SEQ_NO: 3 },
    { ID: 5, DOC_NAME: 'Bank Statement', STATUS: 1, SEQ_NO: 4 },
];

let documentRequirements: DocumentRequirement[] = [
    { ID: 1, INSU_TYPE_ID: 1, DOC_ID: 1, IS_MANDATORY: 1, COMP_ID: 1, STATUS: 1, CREATED_BY: 1, CREATED_ON: now, MODIFIED_BY: 1, MODIFIED_ON: now },
    { ID: 2, INSU_TYPE_ID: 1, DOC_ID: 2, IS_MANDATORY: 1, COMP_ID: 1, STATUS: 1, CREATED_BY: 1, CREATED_ON: now, MODIFIED_BY: 1, MODIFIED_ON: now },
    { ID: 3, INSU_TYPE_ID: 1, INSU_SUB_TYPE_ID: 101, DOC_ID: 1, IS_MANDATORY: 1, COMP_ID: 1, STATUS: 1, CREATED_BY: 1, CREATED_ON: now, MODIFIED_BY: 1, MODIFIED_ON: now },
];

const allMembers: Member[] = [
    { id: 'mem_1', name: 'John Doe', processStages: { 'it_1': 'Premium Collection' }, policies: [{ id: 'pol_1', insuranceTypeId: 'it_1', schemeName: 'Jeevan Anand', dynamicData: { fatherName: 'Richard Doe' } }], routeId: 1, genderId: 1, maritalStatusId: 2, customerCategoryId: 1, customerSubCategoryId: 1, customerGroupId: 1, customerTypeId: 2 },
    { id: 'mem_2', name: 'Jane Smith', processStages: { 'it_1': 'Plan Presentation' }, routeId: 2, genderId: 2, maritalStatusId: 1, customerCategoryId: 2, customerGroupId: 2, customerTypeId: 1 },
];

const schemesMaster: SchemeMaster[] = [
    { id: 'sch_1', name: 'Jeevan Anand', insuranceTypeId: 'it_1' },
    { id: 'sch_2', name: 'Health Guard', insuranceTypeId: 'it_2' },
    { id: 'sch_3', name: 'Term Shield', insuranceTypeId: 'it_sub_2' },
];

let agencies: Agency[] = [
    { ID: 1, COMP_ID: 1, AGENCY_NAME: 'Max Life Insurance', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 2, COMP_ID: 1, AGENCY_NAME: 'Life Insurance Corporation (LIC)', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 3, COMP_ID: 1, AGENCY_NAME: 'HDFC Life', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 4, COMP_ID: 1, AGENCY_NAME: 'ICICI Prudential Life Insurance', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 5, COMP_ID: 1, AGENCY_NAME: 'Star Health & Allied Insurance', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 6, COMP_ID: 1, AGENCY_NAME: 'Niva Bupa', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 0 },
    { ID: 7, COMP_ID: 1, AGENCY_NAME: 'HDFC ERGO Health', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 8, COMP_ID: 1, AGENCY_NAME: 'Care Health Insurance', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 9, COMP_ID: 1, AGENCY_NAME: 'ICICI Lombard', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 10, COMP_ID: 1, AGENCY_NAME: 'Bajaj Allianz General Insurance', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 11, COMP_ID: 1, AGENCY_NAME: 'Tata AIG General Insurance', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 12, COMP_ID: 1, AGENCY_NAME: 'New India Assurance', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 13, COMP_ID: 1, AGENCY_NAME: 'Oriental Insurance', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
    { ID: 14, COMP_ID: 1, AGENCY_NAME: 'United India Insurance', CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1 },
];

let schemes: Scheme[] = [
    { ID: 1, COMP_ID: 1, AGENCY_ID: 1, SCHEME_NAME: 'Smart Secure Plus Plan', INSURANCE_TYPE_ID: 1, INSURANCE_SUB_TYPE_ID: 102, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1, SEQ_NO: 0 },
    { ID: 2, COMP_ID: 1, AGENCY_ID: 1, SCHEME_NAME: 'Smart Secure Plus Plan', INSURANCE_TYPE_ID: 1, INSURANCE_SUB_TYPE_ID: 101, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1, SEQ_NO: 1 },
    { ID: 3, COMP_ID: 1, AGENCY_ID: 2, SCHEME_NAME: 'Jeevan Labh', INSURANCE_TYPE_ID: 1, INSURANCE_SUB_TYPE_ID: 103, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser, STATUS: 1, SEQ_NO: 0 },
];

let designations: Designation[] = [
    { ID: 1, COMP_ID: 1, DESIGNATION_NAME: 'Admin', RANK: null, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, DESIGNATION_NAME: 'Advisor', RANK: null, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, DESIGNATION_NAME: 'Secretary', RANK: null, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COMP_ID: 1, DESIGNATION_NAME: 'Support', RANK: null, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 5, COMP_ID: 1, DESIGNATION_NAME: 'Security', RANK: null, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let roles: Role[] = [
    { ID: 1, COMP_ID: 1, ROLE_DESC: 'System Administrator', IS_ADVISOR_ROLE: 0, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, ROLE_DESC: 'Sales Advisor', IS_ADVISOR_ROLE: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, ROLE_DESC: 'Office Secretary', IS_ADVISOR_ROLE: 0, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COMP_ID: 1, ROLE_DESC: 'Support Staff', IS_ADVISOR_ROLE: 0, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let routes: Route[] = [
    { ID: 1, ROUTE_NAME: 'Chennai-Madurai', COMP_ID: 1, STATUS: 1, SEQ_NO: 0, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, ROUTE_NAME: 'Zone A Delivery Route', COMP_ID: 1, STATUS: 1, SEQ_NO: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, ROUTE_NAME: 'Mumbai-Pune Express', COMP_ID: 1, STATUS: 0, SEQ_NO: 2, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let maritalStatuses: MaritalStatus[] = [
    { ID: 1, MARITAL_STATUS: 'Single', STATUS: 1, SEQ_NO: 0, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, MARITAL_STATUS: 'Married', STATUS: 1, SEQ_NO: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, MARITAL_STATUS: 'Divorced', STATUS: 1, SEQ_NO: 2, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, MARITAL_STATUS: 'Widowed', STATUS: 1, SEQ_NO: 3, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let genders: Gender[] = [
    { ID: 1, GENDER_NAME: 'Male', STATUS: 1, SEQ_NO: 0, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, GENDER_NAME: 'Female', STATUS: 1, SEQ_NO: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, GENDER_NAME: 'Transgender', STATUS: 1, SEQ_NO: 2, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, GENDER_NAME: 'Other', STATUS: 1, SEQ_NO: 3, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let relationshipTypes: RelationshipType[] = [
    { ID: 1, RELATIONSHIP_NAME: 'Self', COMP_ID: 1, STATUS: 1, SEQ_NO: 0, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, RELATIONSHIP_NAME: 'Spouse', COMP_ID: 1, STATUS: 1, SEQ_NO: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, RELATIONSHIP_NAME: 'Son', COMP_ID: 1, STATUS: 1, SEQ_NO: 2, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, RELATIONSHIP_NAME: 'Daughter', COMP_ID: 1, STATUS: 1, SEQ_NO: 3, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 5, RELATIONSHIP_NAME: 'Father', COMP_ID: 1, STATUS: 1, SEQ_NO: 4, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 6, RELATIONSHIP_NAME: 'Mother', COMP_ID: 1, STATUS: 1, SEQ_NO: 5, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let leadStages: LeadStage[] = [
    { ID: 1, LEAD_NAME: 'Lead', COMP_ID: 1, STATUS: 1, SEQ_NO: 0, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, LEAD_NAME: 'Contacted', COMP_ID: 1, STATUS: 1, SEQ_NO: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, LEAD_NAME: 'Meeting Scheduled', COMP_ID: 1, STATUS: 1, SEQ_NO: 2, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, LEAD_NAME: 'Proposal Sent', COMP_ID: 1, STATUS: 1, SEQ_NO: 3, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];


let expenseCategories: ExpenseCategory[] = [
    { ID: 1, COMP_ID: 1, EXPENSE_CATE_NAME: 'Administrative Expenses', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, EXPENSE_CATE_NAME: 'Marketing Expenses', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let expenseHeads: ExpenseHead[] = [
    { ID: 1, COMP_ID: 1, EXPENSE_HEAD_NAME: 'Salary', EXPENSE_CATE_ID: 1, GET_INDIVIDUAL: 0, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, EXPENSE_HEAD_NAME: 'Rent', EXPENSE_CATE_ID: 1, GET_INDIVIDUAL: 0, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, EXPENSE_HEAD_NAME: "MD's Travel", EXPENSE_CATE_ID: 1, GET_INDIVIDUAL: 0, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COMP_ID: 1, EXPENSE_HEAD_NAME: 'Print Media Ad', EXPENSE_CATE_ID: 2, GET_INDIVIDUAL: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 5, COMP_ID: 1, EXPENSE_HEAD_NAME: 'Digital Media', EXPENSE_CATE_ID: 2, GET_INDIVIDUAL: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let expenseIndividuals: ExpenseIndividual[] = [
    { ID: 1, COMP_ID: 1, INDIVIDUAL_NAME: 'Staff Incentive', EXPENSE_HEAD_ID: 1, EXPENSE_CATEGORY_ID: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, INDIVIDUAL_NAME: 'Google Ads', EXPENSE_HEAD_ID: 5, EXPENSE_CATEGORY_ID: 2, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let incomeCategories: IncomeCategory[] = [
    { ID: 1, COMP_ID: 1, INCOME_CATE: 'Direct Income', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, INCOME_CATE: 'Indirect Income', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let incomeHeads: IncomeHead[] = [
    { ID: 1, COMP_ID: 1, INCOME_HEAD: 'Commission', INCOME_CATE_ID: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, INCOME_HEAD: 'Consultancy Fees', INCOME_CATE_ID: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, INCOME_HEAD: 'Interest Received', INCOME_CATE_ID: 2, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let customerCategories: CustomerCategory[] = [
    { ID: 1, COMP_ID: 1, CUSTOMER_CATEGORY: 'Salaried', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, CUSTOMER_CATEGORY: 'Business', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, CUSTOMER_CATEGORY: 'Professional', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let customerSubCategories: CustomerSubCategory[] = [
    { ID: 1, COMP_ID: 1, CUST_CATE_ID: 1, CUST_SUB_CATE: 'IT/Software', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, CUST_CATE_ID: 1, CUST_SUB_CATE: 'Manufacturing', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, CUST_CATE_ID: 3, CUST_SUB_CATE: 'Doctor', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COMP_ID: 1, CUST_CATE_ID: 3, CUST_SUB_CATE: 'Government', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 5, COMP_ID: 1, CUST_CATE_ID: 2, CUST_SUB_CATE: 'Trading', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 6, COMP_ID: 1, CUST_CATE_ID: 3, CUST_SUB_CATE: 'Lawyer', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let customerGroups: CustomerGroup[] = [
    { ID: 1, COMP_ID: 1, CUSTOMER_GROUP: 'HNI', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, CUSTOMER_GROUP: 'Mid-Income', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, CUSTOMER_GROUP: 'Affluent', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let customerTypes: CustomerType[] = [
    { ID: 1, COMP_ID: 1, CUST_TYPE: 'Silver', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, CUST_TYPE: 'Gold', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, CUST_TYPE: 'Diamond', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COMP_ID: 1, CUST_TYPE: 'Platinum', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let customerTiers: CustomerTier[] = [
    { ID: 1, COMP_ID: 1, CUST_TYPE_ID: 1, MINIMUM_SUM_ASSURED: 100000, MINIMUM_PREMIUM: 10000, ASSIGNED_GIFT_ID: 1, STATUS: 1, SEQ_NO: 0, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, CUST_TYPE_ID: 2, MINIMUM_SUM_ASSURED: 500000, MINIMUM_PREMIUM: 25000, ASSIGNED_GIFT_ID: 2, STATUS: 1, SEQ_NO: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, CUST_TYPE_ID: 3, MINIMUM_SUM_ASSURED: 1000000, MINIMUM_PREMIUM: 50000, ASSIGNED_GIFT_ID: 3, STATUS: 1, SEQ_NO: 2, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let gifts: Gift[] = [
    { ID: 1, COMP_ID: 1, GIFT_NAME: 'Travel Voucher', STATUS: 1, SEQ_NO: 0, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, GIFT_NAME: 'Smartwatch', STATUS: 1, SEQ_NO: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, GIFT_NAME: 'Bluetooth Speaker', STATUS: 1, SEQ_NO: 2, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COMP_ID: 1, GIFT_NAME: 'Mug', STATUS: 0, SEQ_NO: 3, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let religions: Religion[] = [
    { ID: 1, COMP_ID: 1, RELIGION: 'Hinduism', STATUS: 1, SEQ_NO: 0, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, RELIGION: 'Christianity', STATUS: 1, SEQ_NO: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, RELIGION: 'Islam', STATUS: 1, SEQ_NO: 2, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COMP_ID: 1, RELIGION: 'Sikhism', STATUS: 1, SEQ_NO: 3, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 5, COMP_ID: 1, RELIGION: 'General', STATUS: 1, SEQ_NO: 4, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let festivals: Festival[] = [
    { ID: 1, COMP_ID: 1, RELIGION_ID: 1, FEST_DESC: 'Diwali', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, RELIGION_ID: 3, FEST_DESC: 'Eid al-Fitr', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, RELIGION_ID: 1, FEST_DESC: 'Holi', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COMP_ID: 1, RELIGION_ID: 2, FEST_DESC: 'Good Friday', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 5, COMP_ID: 1, RELIGION_ID: 2, FEST_DESC: 'Christmas', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 6, COMP_ID: 1, RELIGION_ID: 5, FEST_DESC: "New Year's Day", STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let festivalDates: FestivalDate[] = [
    { ID: 1, COMP_ID: 1, FEST_ID: 5, FESTVEL_DATE: '2025-12-25', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, FEST_ID: 1, FESTVEL_DATE: '2025-10-21', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, COMP_ID: 1, FEST_ID: 2, FESTVEL_DATE: '2025-03-30', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 4, COMP_ID: 1, FEST_ID: 4, FESTVEL_DATE: '2025-04-18', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 5, COMP_ID: 1, FEST_ID: 3, FESTVEL_DATE: '2025-03-14', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 6, COMP_ID: 1, FEST_ID: 6, FESTVEL_DATE: '2025-01-01', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 7, COMP_ID: 1, FEST_ID: 5, FESTVEL_DATE: '2024-12-25', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 8, COMP_ID: 1, FEST_ID: 2, FESTVEL_DATE: '2026-03-20', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let financialYears: FinancialYear[] = [
    { ID: 1, COMP_ID: 1, FROM_DATE: '2023-04-01', TO_DATE: '2024-03-31', FIN_YEAR: '2023-2024', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, COMP_ID: 1, FROM_DATE: '2024-04-01', TO_DATE: '2025-03-31', FIN_YEAR: '2024-2025', STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let documentNumberingRules: DocumentNumberingRule[] = [
    { ID: 1, COMP_ID: 1, FIN_YEAR_ID: 2, TYPE: 'Voucher', PREFIX: 'VCH/24-25/', STARTING_NO: 1, SUFFIX: null, STATUS: 1 },
    { ID: 2, COMP_ID: 1, FIN_YEAR_ID: 2, TYPE: 'Receipt', PREFIX: 'RCT/24-25/', STARTING_NO: 1, SUFFIX: null, STATUS: 1 },
];

let banks: Bank[] = [
    { ID: 1, BANK_NAME: 'State Bank of India', COMP_ID: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, BANK_NAME: 'HDFC Bank', COMP_ID: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
];

let accountTypes: AccountType[] = [
    { ID: 1, ACCOUNT_TYPE_NAME: 'Current Account', COMP_ID: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 2, ACCOUNT_TYPE_NAME: 'Overdraft Account', COMP_ID: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
    { ID: 3, ACCOUNT_TYPE_NAME: 'Cash Credit Account', COMP_ID: 1, STATUS: 1, CREATED_ON: now, MODIFIED_ON: now, CREATED_BY: dummyUser, MODIFIED_BY: dummyUser },
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