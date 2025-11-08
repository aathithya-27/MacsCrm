
import type { 
    Company, User, Branch, BusinessVertical, 
    InsuranceType, InsuranceSubType, ProcessFlow, InsuranceFieldMaster, DocumentMaster, DocumentRequirement,
    Member, SchemeMaster, Agency, Scheme, Designation, Role, Route, MaritalStatus, Gender,
    RelationshipType, LeadStage, ExpenseCategory, ExpenseHead, ExpenseIndividual, IncomeCategory, IncomeHead,
    Country, State, District, City, Area,
    CustomerCategory, CustomerSubCategory, CustomerGroup, CustomerType,
    CustomerTier, Gift, Religion, Festival, FestivalDate,
    FinancialYear, DocumentNumberingRule, Bank, AccountType, PaginatedResponse
} from '../types';
import { db } from './mockData';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const processResponse = <T>(data: any): T => JSON.parse(JSON.stringify(data));

const paginate = <T>(items: T[], page: number = 1, limit: number = 25, searchQuery: string = '', searchFields: (keyof T)[] = []): PaginatedResponse<T> => {
    let filteredItems = items;

    if (searchQuery && searchFields.length > 0) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filteredItems = items.filter(item => 
            searchFields.some(field => 
                String(item[field]).toLowerCase().includes(lowercasedQuery)
            )
        );
    }
    
    const total = filteredItems.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredItems.slice(startIndex, endIndex);

    return {
        data,
        meta: {
            total,
            page,
            limit,
            pages,
            has_next_page: page < pages,
            has_prev_page: page > 1,
        }
    };
};

export const fetchCountries = async ({ page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<Country>> => { await delay(200); const paginated = paginate(db.countries, page, limit, search, ['country_name']); return { ...paginated, data: processResponse<Country[]>(paginated.data) }; };
export const fetchStates = async ({ page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<State>> => { await delay(200); const paginated = paginate(db.states, page, limit, search, ['state']); return { ...paginated, data: processResponse<State[]>(paginated.data) }; };
export const fetchDistricts = async ({ page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<District>> => { await delay(200); const paginated = paginate(db.districts, page, limit, search, ['district']); return { ...paginated, data: processResponse<District[]>(paginated.data) }; };
export const fetchCities = async ({ page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<City>> => { await delay(200); const paginated = paginate(db.cities, page, limit, search, ['city']); return { ...paginated, data: processResponse<City[]>(paginated.data) }; };
export const fetchAreas = async ({ page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<Area>> => { await delay(200); const paginated = paginate(db.areas, page, limit, search, ['area']); return { ...paginated, data: processResponse<Area[]>(paginated.data) }; };

export const fetchCountryById = async (id: number): Promise<Country | null> => { await delay(50); return processResponse<Country | null>(db.countries.find(c => c.id === id) || null); };
export const fetchStateById = async (id: number): Promise<State | null> => { await delay(50); return processResponse<State | null>(db.states.find(s => s.id === id) || null); };
export const fetchDistrictById = async (id: number): Promise<District | null> => { await delay(50); return processResponse<District | null>(db.districts.find(d => d.id === id) || null); };
export const fetchCityById = async (id: number): Promise<City | null> => { await delay(50); return processResponse<City | null>(db.cities.find(c => c.id === id) || null); };
export const fetchAreaById = async (id: number): Promise<Area | null> => { await delay(50); return processResponse<Area | null>(db.areas.find(a => a.id === id) || null); };


export const onUpdateCountries = async (data: Country[]): Promise<Country[]> => { await delay(300); db.countries = data; return processResponse<Country[]>(db.countries); };
export const onUpdateStates = async (data: State[]): Promise<State[]> => { await delay(300); db.states = data; return processResponse<State[]>(db.states); };
export const onUpdateDistricts = async (data: District[]): Promise<District[]> => { await delay(300); db.districts = data; return processResponse<District[]>(db.districts); };
export const onUpdateCities = async (data: City[]): Promise<City[]> => { await delay(300); db.cities = data; return processResponse<City[]>(db.cities); };
export const onUpdateAreas = async (data: Area[]): Promise<Area[]> => { await delay(300); db.areas = data; return processResponse<Area[]>(db.areas); };


export const fetchCompanies = async (): Promise<Company[]> => {
    await delay(400);
    return processResponse<Company[]>(db.companies);
};

export const fetchCompanyById = async (id: number): Promise<Company | null> => {
    await delay(50);
    return processResponse<Company | null>(db.companies.find(c => c.comp_id === id) || null);
};

export const fetchCurrentUser = async (): Promise<User> => {
    await delay(100);
    return processResponse<User>(db.currentUser);
};

export const updateCompany = async (data: Company): Promise<Company> => {
    await delay(500);
    const index = db.companies.findIndex(c => c.comp_id === data.comp_id);
    if (index !== -1) {
        const oldStatus = db.companies[index].status;
        const newStatus = data.status;

        const dbData = { ...data, modified_on: new Date().toISOString() };
        db.companies[index] = dbData;
        
    } else {
        throw new Error("Company not found for update");
    }
    return processResponse<Company>(data);
};

export const fetchBranches = async (compId: number, { page = 1, limit = 25, search = '' } = {}): Promise<PaginatedResponse<Branch>> => {
    await delay(350);
    const companyBranches = db.branches.filter(b => b.comp_id === compId);
    const paginated = paginate(companyBranches, page, limit, search, ['branch_name', 'branch_code']);
    return { ...paginated, data: processResponse<Branch[]>(paginated.data) };
};

export const saveBranch = async (branchData: Partial<Branch>): Promise<Branch> => {
    await delay(500);
    
    const company = db.companies.find(c => c.comp_id === branchData.comp_id);
    if (company && branchData.branch_code) {
        const fullBranchId = `${company.comp_code}-${branchData.branch_code}`;
        const isDuplicate = db.branches.some(b => 
            b.branch_id !== branchData.branch_id && 
            `${company.comp_code}-${b.branch_code}` === fullBranchId
        );
        if (isDuplicate) {
             const error: any = new Error("Branch ID already exists.");
             error.status = 409;
             throw error;
        }
    }

    if (branchData.id) {
        const index = db.branches.findIndex(b => b.branch_id === branchData.id);
        if (index > -1) {
            const updatedBranch = { ...db.branches[index], ...branchData, modified_on: new Date().toISOString() };
            db.branches[index] = updatedBranch as any;
            return processResponse<Branch>(updatedBranch);
        } else {
            throw new Error("Branch not found");
        }
    } else {
        const newBranch = {
            ...branchData,
            branch_id: Date.now(),
            id: Date.now(),
            date_of_creation: branchData.date_of_creation || new Date().toISOString().split('T')[0],
            modified_on: new Date().toISOString(),
            created_on: new Date().toISOString(),
            created_by: 1,
            modified_by: 1,
        } as any;
        db.branches.push(newBranch);
        return processResponse<Branch>(newBranch);
    }
};

export const fetchDesignations = async (compId: number, { page = 1, limit = 25, search = '' } = {}): Promise<PaginatedResponse<Designation>> => {
    await delay(200);
    const companyItems = db.designations.filter(d => d.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['designation_name']);
    paginated.data.sort((a,b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
    return { ...paginated, data: processResponse<Designation[]>(paginated.data) };
};

export const saveDesignation = async (designationData: Partial<Designation>): Promise<Designation> => {
    await delay(400);
    if (designationData.id) { 
        const index = db.designations.findIndex(d => d.id === designationData.id);
        if (index > -1) {
            const updated = { ...db.designations[index], ...designationData, modified_on: new Date().toISOString(), modified_by: 1 } as any;
            db.designations[index] = updated;
            return processResponse<Designation>(updated);
        } else {
            throw new Error("Designation not found");
        }
    } else { 
        const newDesignation = {
            ...designationData,
            id: Date.now(),
            status: designationData.status ?? 1,
            created_on: new Date().toISOString(),
            modified_on: new Date().toISOString(),
            created_by: 1,
            modified_by: 1,
        } as any;
        db.designations.push(newDesignation);
        return processResponse<Designation>(newDesignation);
    }
};


const saveData = <T extends { id?: number; status?: number; comp_id?: number }>(
    dbTable: any[], 
    item: Partial<T>, 
    nameField: keyof T
): T => {
    if (!item[nameField] && nameField) {
        throw new Error("Name field is required.");
    }

    const now = new Date().toISOString();
    if (item.id) {
        const index = dbTable.findIndex(d => d.id === item.id);
        if (index > -1) {
            const updated = { ...dbTable[index], ...item, modified_on: now, modified_by: 1 };
            dbTable[index] = updated;
            return processResponse<T>(updated);
        } else {
            throw new Error("Item not found");
        }
    } else {
        const newItem = {
            ...item,
            id: Date.now(),
            status: item.status ?? 1,
            created_on: now,
            modified_on: now,
            created_by: 1,
            modified_by: 1,
        };
        dbTable.push(newItem);
        return processResponse<T>(newItem);
    }
};


export const fetchBusinessVerticals = async (compId: number, { page = 1, limit = 10, search = '' } = {}): Promise<PaginatedResponse<BusinessVertical>> => {
    await delay(300);
    const companyItems = db.businessVerticals.filter(v => v.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['business_vertical_name']);
    return { ...paginated, data: processResponse<BusinessVertical[]>(paginated.data) };
};
export const saveBusinessVertical = async (verticalData: Partial<BusinessVertical>): Promise<BusinessVertical> => { await delay(400); return saveData(db.businessVerticals, verticalData, 'business_vertical_name'); };

export const fetchInsuranceTypes = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<InsuranceType>> => {
    await delay(200);
    const companyItems = db.insuranceTypes.filter(i => i.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['insurance_type']);
    return { ...paginated, data: processResponse<InsuranceType[]>(paginated.data) };
};
export const saveInsuranceType = async (item: Partial<InsuranceType>): Promise<InsuranceType> => {
    await delay(400);
    return saveData(db.insuranceTypes, item, 'insurance_type');
};

export const fetchInsuranceSubTypes = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<InsuranceSubType>> => {
    await delay(200);
    const companyItems = db.insuranceSubTypes.filter(i => i.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['insurance_sub_type']);
    return { ...paginated, data: processResponse<InsuranceSubType[]>(paginated.data) };
};
export const saveInsuranceSubType = async (item: Partial<InsuranceSubType>): Promise<InsuranceSubType> => {
    await delay(400);
    return saveData(db.insuranceSubTypes, item, 'insurance_sub_type');
};

export const fetchProcessFlows = async (): Promise<ProcessFlow[]> => { await delay(200); return processResponse<ProcessFlow[]>(db.processFlows); };
export const onUpdateProcessFlows = async (data: ProcessFlow[]): Promise<ProcessFlow[]> => {
    await delay(300);
    db.processFlows = data;
    return processResponse<ProcessFlow[]>(db.processFlows);
};

export const fetchInsuranceFields = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<InsuranceFieldMaster>> => {
    await delay(200);
    const allFields = db.insuranceFields;
    const paginated = paginate(allFields, page, limit, search, ['field_label', 'field_group']);
    return { ...paginated, data: processResponse<InsuranceFieldMaster[]>(paginated.data) };
};
export const saveInsuranceField = async (item: Partial<InsuranceFieldMaster>): Promise<InsuranceFieldMaster> => { await delay(300); return saveData(db.insuranceFields, item, 'field_label'); };

export const fetchDocumentMasters = async ({ page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<DocumentMaster>> => {
    await delay(200);
    const paginated = paginate(db.documentMasters, page, limit, search, ['doc_name']);
    return { ...paginated, data: processResponse<DocumentMaster[]>(paginated.data) };
};
export const saveDocumentMaster = async (item: Partial<DocumentMaster>): Promise<DocumentMaster> => { await delay(300); return saveData(db.documentMasters, item, 'doc_name'); };

export const fetchDocumentRequirements = async (): Promise<DocumentRequirement[]> => { await delay(200); return processResponse<DocumentRequirement[]>(db.documentRequirements); };
export const onUpdateDocumentRequirements = async (data: DocumentRequirement[]): Promise<DocumentRequirement[]> => { await delay(300); db.documentRequirements = data; return processResponse<DocumentRequirement[]>(db.documentRequirements); };

export const fetchAllMembers = async (): Promise<Member[]> => { await delay(150); return processResponse<Member[]>(db.allMembers); }
export const fetchSchemesMaster = async (): Promise<SchemeMaster[]> => { await delay(150); return processResponse<SchemeMaster[]>(db.schemesMaster); }

export const fetchAgencies = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<Agency>> => {
    await delay(250);
    const companyItems = db.agencies.filter(a => a.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['agency_name']);
    return { ...paginated, data: processResponse<Agency[]>(paginated.data) };
};
export const saveAgency = async (agencyData: Partial<Agency>): Promise<Agency> => { await delay(400); return saveData(db.agencies, agencyData, 'agency_name'); };

export const fetchSchemes = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<Scheme>> => {
    await delay(250);
    const companyItems = db.schemes.filter(s => s.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['scheme_name']);
    return { ...paginated, data: processResponse<Scheme[]>(paginated.data) };
};
export const saveScheme = async (schemeData: Partial<Scheme>): Promise<Scheme> => { await delay(400); return saveData(db.schemes, schemeData, 'scheme_name'); };

export const saveRole = async (roleData: Partial<Role>): Promise<Role> => { await delay(400); return saveData(db.roles, roleData, 'role_desc'); };
export const fetchRoles = async (compId: number, { page = 1, limit = 25, search = '' } = {}): Promise<PaginatedResponse<Role>> => {
    await delay(200);
    const companyItems = db.roles.filter(r => r.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['role_desc']);
    return { ...paginated, data: processResponse<Role[]>(paginated.data) };
};


export const fetchRoutes = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<Route>> => {
    await delay(200);
    const companyItems = db.routes.filter(r => r.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['route_name']);
    return { ...paginated, data: processResponse<Route[]>(paginated.data) };
};
export const saveRoute = async (item: Partial<Route>): Promise<Route> => { await delay(300); return saveData(db.routes, item, 'route_name'); };

export const fetchMaritalStatuses = async ({ page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<MaritalStatus>> => {
    await delay(200);
    const paginated = paginate(db.maritalStatuses, page, limit, search, ['marital_status']);
    return { ...paginated, data: processResponse<MaritalStatus[]>(paginated.data) };
};
export const saveMaritalStatus = async (item: Partial<MaritalStatus>): Promise<MaritalStatus> => { await delay(300); return saveData(db.maritalStatuses, item, 'marital_status'); };

export const fetchGenders = async ({ page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<Gender>> => {
    await delay(200);
    const paginated = paginate(db.genders, page, limit, search, ['gender_name']);
    return { ...paginated, data: processResponse<Gender[]>(paginated.data) };
};
export const saveGender = async (item: Partial<Gender>): Promise<Gender> => { await delay(300); return saveData(db.genders, item, 'gender_name'); };

export const fetchRelationshipTypes = async (compId: number, { page = 1, limit = 25, search = '' } = {}): Promise<PaginatedResponse<RelationshipType>> => {
    await delay(200);
    const companyItems = db.relationshipTypes.filter(rt => rt.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['relationship_name']);
    paginated.data.sort((a,b) => (a.seq_no ?? Infinity) - (b.seq_no ?? Infinity));
    return { ...paginated, data: processResponse<RelationshipType[]>(paginated.data) };
};
export const saveRelationshipType = async (item: Partial<RelationshipType>): Promise<RelationshipType> => {
    await delay(300);
    return saveData(db.relationshipTypes, item, 'relationship_name');
};

export const fetchLeadStages = async (compId: number, { page = 1, limit = 25, search = '' } = {}): Promise<PaginatedResponse<LeadStage>> => {
    await delay(200);
    const companyItems = db.leadStages.filter(ls => ls.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['lead_name']);
    paginated.data.sort((a,b) => (a.seq_no ?? Infinity) - (b.seq_no ?? Infinity));
    return { ...paginated, data: processResponse<LeadStage[]>(paginated.data) };
};
export const saveLeadStage = async (item: Partial<LeadStage>): Promise<LeadStage> => {
    await delay(300);
    return saveData(db.leadStages, item, 'lead_name');
};

export const fetchExpenseCategories = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<ExpenseCategory>> => {
    await delay(150);
    const companyItems = db.expenseCategories.filter(c => c.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['expense_cate_name']);
    return { ...paginated, data: processResponse<ExpenseCategory[]>(paginated.data) };
};
export const saveExpenseCategory = async (item: Partial<ExpenseCategory>): Promise<ExpenseCategory> => { await delay(300); return saveData(db.expenseCategories, item, 'expense_cate_name'); };

export const fetchExpenseHeads = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<ExpenseHead>> => {
    await delay(150);
    const companyItems = db.expenseHeads.filter(h => h.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['expense_head_name']);
    return { ...paginated, data: processResponse<ExpenseHead[]>(paginated.data) };
};
export const saveExpenseHead = async (item: Partial<ExpenseHead>): Promise<ExpenseHead> => { await delay(300); return saveData(db.expenseHeads, item, 'expense_head_name'); };

export const fetchExpenseIndividuals = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<ExpenseIndividual>> => {
    await delay(150);
    const companyItems = db.expenseIndividuals.filter(i => i.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['individual_name']);
    return { ...paginated, data: processResponse<ExpenseIndividual[]>(paginated.data) };
};
export const saveExpenseIndividual = async (item: Partial<ExpenseIndividual>): Promise<ExpenseIndividual> => { await delay(300); return saveData(db.expenseIndividuals, item, 'individual_name'); };

export const fetchIncomeCategories = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<IncomeCategory>> => {
    await delay(150);
    const companyItems = db.incomeCategories.filter(c => c.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['income_cate']);
    return { ...paginated, data: processResponse<IncomeCategory[]>(paginated.data) };
};
export const saveIncomeCategory = async (item: Partial<IncomeCategory>): Promise<IncomeCategory> => { await delay(300); return saveData(db.incomeCategories, item, 'income_cate'); };

export const fetchIncomeHeads = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<IncomeHead>> => {
    await delay(150);
    const companyItems = db.incomeHeads.filter(h => h.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['income_head']);
    return { ...paginated, data: processResponse<IncomeHead[]>(paginated.data) };
};
export const saveIncomeHead = async (item: Partial<IncomeHead>): Promise<IncomeHead> => { await delay(300); return saveData(db.incomeHeads, item, 'income_head'); };

export const fetchCustomerCategories = async (compId: number, { page = 1, limit = 10, search = '' } = {}): Promise<PaginatedResponse<CustomerCategory>> => { 
    await delay(150);
    const companyItems = db.customerCategories.filter(c => c.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['customer_category']);
    return { ...paginated, data: processResponse<CustomerCategory[]>(paginated.data) };
};
export const saveCustomerCategory = async (item: Partial<CustomerCategory>): Promise<CustomerCategory> => { await delay(300); return saveData(db.customerCategories, item, 'customer_category'); };

export const fetchCustomerSubCategories = async (compId: number, { page = 1, limit = 10, search = '' } = {}): Promise<PaginatedResponse<CustomerSubCategory>> => { 
    await delay(150);
    const companyItems = db.customerSubCategories.filter(c => c.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['cust_sub_cate']);
    return { ...paginated, data: processResponse<CustomerSubCategory[]>(paginated.data) };
};
export const saveCustomerSubCategory = async (item: Partial<CustomerSubCategory>): Promise<CustomerSubCategory> => { await delay(300); return saveData(db.customerSubCategories, item, 'cust_sub_cate'); };

export const fetchCustomerGroups = async (compId: number, { page = 1, limit = 10, search = '' } = {}): Promise<PaginatedResponse<CustomerGroup>> => {
    await delay(150);
    const companyItems = db.customerGroups.filter(c => c.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['customer_group']);
    return { ...paginated, data: processResponse<CustomerGroup[]>(paginated.data) };
};
export const saveCustomerGroup = async (item: Partial<CustomerGroup>): Promise<CustomerGroup> => { await delay(300); return saveData(db.customerGroups, item, 'customer_group'); };

export const fetchCustomerTypes = async (compId: number, { page = 1, limit = 10, search = '' } = {}): Promise<PaginatedResponse<CustomerType>> => {
    await delay(150);
    const companyItems = db.customerTypes.filter(c => c.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['cust_type']);
    return { ...paginated, data: processResponse<CustomerType[]>(paginated.data) };
};
export const saveCustomerType = async (item: Partial<CustomerType>): Promise<CustomerType> => { await delay(300); return saveData(db.customerTypes, item, 'cust_type'); };

export const fetchCustomerTiers = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<CustomerTier>> => {
    await delay(150);
    const companyItems = db.customerTiers.filter(ct => ct.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, []);
    return { ...paginated, data: processResponse<CustomerTier[]>(paginated.data) };
};
export const saveCustomerTier = async (item: Partial<CustomerTier>): Promise<CustomerTier> => { await delay(300); return saveData(db.customerTiers, item, 'cust_type_id' as any); };

export const fetchGifts = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<Gift>> => {
    await delay(150);
    const companyItems = db.gifts.filter(g => g.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['gift_name']);
    return { ...paginated, data: processResponse<Gift[]>(paginated.data) };
};
export const saveGift = async (item: Partial<Gift>): Promise<Gift> => { await delay(300); return saveData(db.gifts, item, 'gift_name'); };

export const fetchReligions = async (compId: number, { page = 1, limit = 25, search = '' } = {}): Promise<PaginatedResponse<Religion>> => {
    await delay(150);
    const companyItems = db.religions.filter(r => r.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['religion']);
    paginated.data.sort((a,b) => (a.seq_no ?? Infinity) - (b.seq_no ?? Infinity));
    return { ...paginated, data: processResponse<Religion[]>(paginated.data) };
};
export const saveReligion = async (item: Partial<Religion>): Promise<Religion> => {
    await delay(300);
    return saveData(db.religions, item, 'religion');
};

export const fetchFestivals = async (compId: number, { page = 1, limit = 25, search = '' } = {}): Promise<PaginatedResponse<Festival>> => {
    await delay(150);
    const companyItems = db.festivals.filter(f => f.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['fest_desc']);
    return { ...paginated, data: processResponse<Festival[]>(paginated.data) };
};
export const saveFestival = async (item: Partial<Festival>): Promise<Festival> => {
    await delay(300);
    return saveData(db.festivals, item, 'fest_desc');
};

export const fetchFestivalDates = async (): Promise<FestivalDate[]> => { await delay(150); return processResponse<FestivalDate[]>(db.festivalDates); };
export const onUpdateFestivalDates = async (data: FestivalDate[]): Promise<FestivalDate[]> => { await delay(300); db.festivalDates = data; return processResponse<FestivalDate[]>(db.festivalDates); };
export const saveFestivalDate = async (item: Partial<FestivalDate>): Promise<FestivalDate> => {
    await delay(300);
    return saveData(db.festivalDates, item, 'fest_id' as any);
};

export const fetchFinancialYears = async (compId: number, { page = 1, limit = 25, search = '' } = {}): Promise<PaginatedResponse<FinancialYear>> => { 
    await delay(150);
    const companyItems = db.financialYears.filter(fy => fy.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['fin_year']);
    return { ...paginated, data: processResponse<FinancialYear[]>(paginated.data) };
};
export const saveFinancialYear = async (item: Partial<FinancialYear>): Promise<FinancialYear> => { await delay(300); return saveData(db.financialYears, item, 'fin_year'); };

export const fetchDocumentNumberingRules = async (compId: number, { page = 1, limit = 1000, search = '' } = {}): Promise<PaginatedResponse<DocumentNumberingRule>> => {
    await delay(150);
    const companyItems = db.documentNumberingRules.filter(r => r.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['prefix']);
    return { ...paginated, data: processResponse<DocumentNumberingRule[]>(paginated.data) };
};
export const saveDocumentNumberingRule = async (item: Partial<DocumentNumberingRule>): Promise<DocumentNumberingRule> => { await delay(300); return saveData(db.documentNumberingRules, item, 'prefix' as any); };

export const fetchBanks = async (compId: number, { page = 1, limit = 5, search = '' } = {}): Promise<PaginatedResponse<Bank>> => {
    await delay(150);
    const companyItems = db.banks.filter(b => b.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['bank_name']);
    return { ...paginated, data: processResponse<Bank[]>(paginated.data) };
};
export const saveBank = async (item: Partial<Bank>): Promise<Bank> => { await delay(300); return saveData(db.banks, item, 'bank_name'); };

export const fetchAccountTypes = async (compId: number, { page = 1, limit = 5, search = '' } = {}): Promise<PaginatedResponse<AccountType>> => {
    await delay(150);
    const companyItems = db.accountTypes.filter(at => at.comp_id === compId);
    const paginated = paginate(companyItems, page, limit, search, ['account_type_name']);
    return { ...paginated, data: processResponse<AccountType[]>(paginated.data) };
};
export const saveAccountType = async (item: Partial<AccountType>): Promise<AccountType> => { await delay(300); return saveData(db.accountTypes, item, 'account_type_name'); };
