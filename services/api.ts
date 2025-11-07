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
import { db } from './mockData';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchCountries = async (): Promise<Country[]> => { await delay(200); return JSON.parse(JSON.stringify(db.countries)); };
export const fetchStates = async (): Promise<State[]> => { await delay(200); return JSON.parse(JSON.stringify(db.states)); };
export const fetchDistricts = async (): Promise<District[]> => { await delay(200); return JSON.parse(JSON.stringify(db.districts)); };
export const fetchCities = async (): Promise<City[]> => { await delay(200); return JSON.parse(JSON.stringify(db.cities)); };
export const fetchAreas = async (): Promise<Area[]> => { await delay(200); return JSON.parse(JSON.stringify(db.areas)); };

export const onUpdateCountries = async (data: Country[]): Promise<Country[]> => { await delay(300); db.countries = data; return db.countries; };
export const onUpdateStates = async (data: State[]): Promise<State[]> => { await delay(300); db.states = data; return db.states; };
export const onUpdateDistricts = async (data: District[]): Promise<District[]> => { await delay(300); db.districts = data; return db.districts; };
export const onUpdateCities = async (data: City[]): Promise<City[]> => { await delay(300); db.cities = data; return db.cities; };
export const onUpdateAreas = async (data: Area[]): Promise<Area[]> => { await delay(300); db.areas = data; return db.areas; };

export const fetchCompanies = async (): Promise<Company[]> => {
    await delay(400);
    return JSON.parse(JSON.stringify(db.companies));
};

export const fetchCurrentUser = async (): Promise<User> => {
    await delay(100);
    return JSON.parse(JSON.stringify(db.currentUser));
};

export const updateCompany = async (data: Company): Promise<Company> => {
    await delay(500);
    const index = db.companies.findIndex(c => c.id === data.id);
    if (index !== -1) {
        const oldStatus = db.companies[index].STATUS;
        const newStatus = data.STATUS;

        db.companies[index] = data;

        if (oldStatus !== newStatus) {
            const compId = data.COMP_ID;

            const updateStatusByCompId = (items: any[], status: number) => {
                items.forEach(item => {
                    if (item.COMP_ID === compId) {
                        item.STATUS = status;
                    }
                });
            };

            updateStatusByCompId(db.branches, newStatus);
            updateStatusByCompId(db.businessVerticals, newStatus);
            updateStatusByCompId(db.insuranceTypes, newStatus);
            updateStatusByCompId(db.insuranceSubTypes, newStatus);
            updateStatusByCompId(db.processFlows, newStatus);
            updateStatusByCompId(db.documentRequirements, newStatus);
            updateStatusByCompId(db.agencies, newStatus);
            updateStatusByCompId(db.schemes, newStatus);
            updateStatusByCompId(db.designations, newStatus);
            updateStatusByCompId(db.roles, newStatus);
            updateStatusByCompId(db.routes, newStatus);
            updateStatusByCompId(db.relationshipTypes, newStatus);
            updateStatusByCompId(db.leadStages, newStatus);
            updateStatusByCompId(db.expenseCategories, newStatus);
            updateStatusByCompId(db.expenseHeads, newStatus);
            updateStatusByCompId(db.expenseIndividuals, newStatus);
            updateStatusByCompId(db.incomeCategories, newStatus);
            updateStatusByCompId(db.incomeHeads, newStatus);
            updateStatusByCompId(db.customerCategories, newStatus);
            updateStatusByCompId(db.customerSubCategories, newStatus);
            updateStatusByCompId(db.customerGroups, newStatus);
            updateStatusByCompId(db.customerTypes, newStatus);
            updateStatusByCompId(db.customerTiers, newStatus);
            updateStatusByCompId(db.gifts, newStatus);
            updateStatusByCompId(db.religions, newStatus);
            updateStatusByCompId(db.festivals, newStatus);
            updateStatusByCompId(db.festivalDates, newStatus);
            updateStatusByCompId(db.financialYears, newStatus);
            updateStatusByCompId(db.documentNumberingRules, newStatus);
            updateStatusByCompId(db.banks, newStatus);
            updateStatusByCompId(db.accountTypes, newStatus);

            const companyInsuranceTypeIds = new Set(
                db.insuranceTypes
                    .filter(it => it.COMP_ID === compId)
                    .map(it => it.ID)
            );

            db.insuranceFields.forEach(field => {
                if (companyInsuranceTypeIds.has(field.INSURANCE_TYPE_ID)) {
                    field.STATUS = newStatus;
                }
            });
        }
    } else {
        throw new Error("Company not found for update");
    }
    return JSON.parse(JSON.stringify(data));
};


export const fetchBranches = async (): Promise<Branch[]> => {
    await delay(350);
    return JSON.parse(JSON.stringify(db.branches));
};

export const saveBranch = async (branchData: Partial<Branch>): Promise<Branch> => {
    await delay(500);
    if (branchData.BRANCH_ID) {
        const index = db.branches.findIndex(b => b.BRANCH_ID === branchData.BRANCH_ID);
        if (index > -1) {
            const updatedBranch = { ...db.branches[index], ...branchData, MODIFIED_ON: new Date().toISOString() } as Branch;
            db.branches[index] = updatedBranch;
            return updatedBranch;
        } else {
            throw new Error("Branch not found");
        }
    } else { 
        const newBranch: Branch = {
            BRANCH_ID: Date.now(),
            COMP_ID: branchData.COMP_ID!,
            BRANCH_CODE: branchData.BRANCH_CODE!,
            BRANCH_NAME: branchData.BRANCH_NAME!,
            STATUS: branchData.STATUS ?? 1,
            DATE_OF_CREATION: branchData.DATE_OF_CREATION || new Date().toISOString().split('T')[0],
            MODIFIED_ON: new Date().toISOString(),
            CREATED_BY: 1,
            ...branchData,
        } as Branch;
        db.branches.push(newBranch);
        return newBranch;
    }
};

export const fetchBusinessVerticals = async (): Promise<BusinessVertical[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(db.businessVerticals));
};

export const saveBusinessVertical = async (verticalData: BusinessVertical): Promise<BusinessVertical> => {
    await delay(400);
    const index = db.businessVerticals.findIndex(v => v.ID === verticalData.ID);
    if (index > -1) {
        db.businessVerticals[index] = { ...verticalData, MODIFIED_ON: new Date().toISOString() };
        return db.businessVerticals[index];
    } else {
        throw new Error("Business Vertical not found");
    }
};

export const fetchInsuranceTypes = async (): Promise<InsuranceType[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.insuranceTypes));
};
export const onUpdateInsuranceTypes = async (data: InsuranceType[]): Promise<InsuranceType[]> => {
    await delay(300);
    db.insuranceTypes = data;
    return db.insuranceTypes;
}

export const fetchInsuranceSubTypes = async (): Promise<InsuranceSubType[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.insuranceSubTypes));
};
export const onUpdateInsuranceSubTypes = async (data: InsuranceSubType[]): Promise<InsuranceSubType[]> => {
    await delay(300);
    db.insuranceSubTypes = data;
    return db.insuranceSubTypes;
}

export const fetchProcessFlows = async (): Promise<ProcessFlow[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.processFlows));
};
export const onUpdateProcessFlows = async (data: ProcessFlow[]): Promise<ProcessFlow[]> => {
    await delay(300);
    db.processFlows = data;
    return db.processFlows;
};


export const fetchInsuranceFields = async (): Promise<InsuranceFieldMaster[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.insuranceFields));
};
export const onUpdateInsuranceFields = async (data: InsuranceFieldMaster[]): Promise<InsuranceFieldMaster[]> => {
    await delay(300);
    db.insuranceFields = data;
    return db.insuranceFields;
};


export const fetchDocumentMasters = async (): Promise<DocumentMaster[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.documentMasters));
};
export const onUpdateDocumentMasters = async (data: DocumentMaster[]): Promise<DocumentMaster[]> => {
    await delay(300);
    db.documentMasters = data;
    return db.documentMasters;
};


export const fetchDocumentRequirements = async (): Promise<DocumentRequirement[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.documentRequirements));
};

export const onUpdateDocumentRequirements = async (data: DocumentRequirement[]): Promise<DocumentRequirement[]> => {
    await delay(300);
    db.documentRequirements = data;
    return db.documentRequirements;
};

export const fetchAllMembers = async (): Promise<Member[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.allMembers));
}

export const fetchSchemesMaster = async (): Promise<SchemeMaster[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.schemesMaster));
}

export const fetchAgencies = async (): Promise<Agency[]> => {
    await delay(250);
    return JSON.parse(JSON.stringify(db.agencies));
};

export const saveAgency = async (agencyData: Partial<Agency>): Promise<Agency> => {
    await delay(400);
    if (agencyData.ID) {
        const index = db.agencies.findIndex(a => a.ID === agencyData.ID);
        if (index > -1) {
            const updated = { ...db.agencies[index], ...agencyData, MODIFIED_ON: new Date().toISOString() } as Agency;
            db.agencies[index] = updated;
            return updated;
        } else {
            throw new Error("Agency not found");
        }
    } else {
        const newAgency: Agency = {
            ID: Date.now(),
            COMP_ID: 1, 
            AGENCY_NAME: agencyData.AGENCY_NAME!,
            STATUS: agencyData.STATUS ?? 1,
            CREATED_ON: new Date().toISOString(),
            MODIFIED_ON: new Date().toISOString(),
            CREATED_BY: 1,
            MODIFIED_BY: 1,
        };
        db.agencies.push(newAgency);
        return newAgency;
    }
};

export const fetchSchemes = async (): Promise<Scheme[]> => {
    await delay(250);
    return JSON.parse(JSON.stringify(db.schemes));
};

export const saveScheme = async (schemeData: Partial<Scheme>): Promise<Scheme> => {
    await delay(400);
    if (schemeData.ID) { 
        const index = db.schemes.findIndex(s => s.ID === schemeData.ID);
        if (index > -1) {
            const updated = { ...db.schemes[index], ...schemeData, MODIFIED_ON: new Date().toISOString() } as Scheme;
            db.schemes[index] = updated;
            return updated;
        } else {
            throw new Error("Scheme not found");
        }
    } else { 
        const newScheme: Scheme = {
            ID: Date.now(),
            COMP_ID: 1, 
            AGENCY_ID: schemeData.AGENCY_ID!,
            SCHEME_NAME: schemeData.SCHEME_NAME!,
            INSURANCE_TYPE_ID: schemeData.INSURANCE_TYPE_ID!,
            INSURANCE_SUB_TYPE_ID: schemeData.INSURANCE_SUB_TYPE_ID,
            STATUS: schemeData.STATUS ?? 1,
            CREATED_ON: new Date().toISOString(),
            MODIFIED_ON: new Date().toISOString(),
            CREATED_BY: 1,
            MODIFIED_BY: 1,
        };
        db.schemes.push(newScheme);
        return newScheme;
    }
};

export const updateSchemeOrder = async (schemes: Scheme[]): Promise<Scheme[]> => {
    await delay(300);
    schemes.forEach(schemeToUpdate => {
        const index = db.schemes.findIndex(s => s.ID === schemeToUpdate.ID);
        if (index !== -1) {
            db.schemes[index].SEQ_NO = schemeToUpdate.SEQ_NO;
        }
    });
    return schemes;
};

export const fetchDesignations = async (): Promise<Designation[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.designations));
};

export const saveDesignation = async (designationData: Partial<Designation>): Promise<Designation> => {
    await delay(400);
    if (designationData.ID) { 
        const index = db.designations.findIndex(d => d.ID === designationData.ID);
        if (index > -1) {
            const updated = { ...db.designations[index], ...designationData, MODIFIED_ON: new Date().toISOString() } as Designation;
            db.designations[index] = updated;
            return updated;
        } else {
            throw new Error("Designation not found");
        }
    } else { 
        const newDesignation: Designation = {
            ID: Date.now(),
            COMP_ID: 1,
            DESIGNATION_NAME: designationData.DESIGNATION_NAME!,
            RANK: designationData.RANK,
            STATUS: designationData.STATUS ?? 1,
            CREATED_ON: new Date().toISOString(),
            MODIFIED_ON: new Date().toISOString(),
            CREATED_BY: 1,
            MODIFIED_BY: 1,
        };
        db.designations.push(newDesignation);
        return newDesignation;
    }
};

export const fetchRoles = async (): Promise<Role[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.roles));
};

export const saveRole = async (roleData: Partial<Role>): Promise<Role> => {
    await delay(400);
    if (roleData.ID) { 
        const index = db.roles.findIndex(r => r.ID === roleData.ID);
        if (index > -1) {
            const updated = { ...db.roles[index], ...roleData, MODIFIED_ON: new Date().toISOString() } as Role;
            db.roles[index] = updated;
            return updated;
        } else {
            throw new Error("Role not found");
        }
    } else { 
        const newRole: Role = {
            ID: Date.now(),
            COMP_ID: 1,
            ROLE_DESC: roleData.ROLE_DESC!,
            IS_ADVISOR_ROLE: roleData.IS_ADVISOR_ROLE ?? 0,
            STATUS: roleData.STATUS ?? 1,
            CREATED_ON: new Date().toISOString(),
            MODIFIED_ON: new Date().toISOString(),
            CREATED_BY: 1,
            MODIFIED_BY: 1,
        };
        db.roles.push(newRole);
        return newRole;
    }
};

export const fetchRoutes = async (): Promise<Route[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.routes));
};

export const onUpdateRoutes = async (data: Route[]): Promise<Route[]> => {
    await delay(300);
    db.routes = data;
    return db.routes;
};

export const fetchMaritalStatuses = async (): Promise<MaritalStatus[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.maritalStatuses));
};

export const onUpdateMaritalStatuses = async (data: MaritalStatus[]): Promise<MaritalStatus[]> => {
    await delay(300);
    db.maritalStatuses = data;
    return data;
};

export const fetchGenders = async (): Promise<Gender[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.genders));
};

export const onUpdateGenders = async (data: Gender[]): Promise<Gender[]> => {
    await delay(300);
    db.genders = data;
    return data;
};

export const fetchRelationshipTypes = async (): Promise<RelationshipType[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.relationshipTypes));
};

export const onUpdateRelationshipTypes = async (data: RelationshipType[]): Promise<RelationshipType[]> => {
    await delay(300);
    db.relationshipTypes = data;
    return data;
};

export const fetchLeadStages = async (): Promise<LeadStage[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(db.leadStages));
};

export const onUpdateLeadStages = async (data: LeadStage[]): Promise<LeadStage[]> => {
    await delay(300);
    db.leadStages = data;
    return data;
};

const saveData = <T extends { ID: number; MODIFIED_ON?: string; CREATED_ON?: string; CREATED_BY?: number; MODIFIED_BY?: number; }>(dataArray: T[], item: Partial<T>): T => {
    if (item.ID && item.ID > 0) {
        const index = dataArray.findIndex(d => d.ID === item.ID);
        if (index > -1) {
            const updated = { ...dataArray[index], ...item, MODIFIED_ON: new Date().toISOString(), MODIFIED_BY: 1 } as T;
            dataArray[index] = updated;
            return updated;
        } else {
            throw new Error("Item not found");
        }
    } else {
        const newItem = {
            ...item,
            ID: Date.now(),
            CREATED_ON: new Date().toISOString(),
            MODIFIED_ON: new Date().toISOString(),
            CREATED_BY: 1,
            MODIFIED_BY: 1,
        } as T;
        dataArray.push(newItem);
        return newItem;
    }
};

export const fetchExpenseCategories = async (): Promise<ExpenseCategory[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.expenseCategories));
};
export const saveExpenseCategory = async (item: Partial<ExpenseCategory>): Promise<ExpenseCategory> => {
    await delay(300);
    return saveData(db.expenseCategories, item);
};

export const fetchExpenseHeads = async (): Promise<ExpenseHead[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.expenseHeads));
};
export const saveExpenseHead = async (item: Partial<ExpenseHead>): Promise<ExpenseHead> => {
    await delay(300);
    return saveData(db.expenseHeads, item);
};

export const fetchExpenseIndividuals = async (): Promise<ExpenseIndividual[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.expenseIndividuals));
};
export const saveExpenseIndividual = async (item: Partial<ExpenseIndividual>): Promise<ExpenseIndividual> => {
    await delay(300);
    return saveData(db.expenseIndividuals, item);
};

export const fetchIncomeCategories = async (): Promise<IncomeCategory[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.incomeCategories));
};
export const saveIncomeCategory = async (item: Partial<IncomeCategory>): Promise<IncomeCategory> => {
    await delay(300);
    return saveData(db.incomeCategories, item);
};

export const fetchIncomeHeads = async (): Promise<IncomeHead[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.incomeHeads));
};
export const saveIncomeHead = async (item: Partial<IncomeHead>): Promise<IncomeHead> => {
    await delay(300);
    return saveData(db.incomeHeads, item);
};

export const fetchCustomerCategories = async (): Promise<CustomerCategory[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.customerCategories));
};
export const saveCustomerCategory = async (item: Partial<CustomerCategory>): Promise<CustomerCategory> => {
    await delay(300);
    return saveData(db.customerCategories, item);
};

export const fetchCustomerSubCategories = async (): Promise<CustomerSubCategory[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.customerSubCategories));
};
export const saveCustomerSubCategory = async (item: Partial<CustomerSubCategory>): Promise<CustomerSubCategory> => {
    await delay(300);
    return saveData(db.customerSubCategories, item);
};

export const fetchCustomerGroups = async (): Promise<CustomerGroup[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.customerGroups));
};
export const saveCustomerGroup = async (item: Partial<CustomerGroup>): Promise<CustomerGroup> => {
    await delay(300);
    return saveData(db.customerGroups, item);
};

export const fetchCustomerTypes = async (): Promise<CustomerType[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.customerTypes));
};
export const saveCustomerType = async (item: Partial<CustomerType>): Promise<CustomerType> => {
    await delay(300);
    return saveData(db.customerTypes, item);
};

export const fetchCustomerTiers = async (): Promise<CustomerTier[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.customerTiers));
};
export const saveCustomerTier = async (item: Partial<CustomerTier>): Promise<CustomerTier> => {
    await delay(300);
    return saveData(db.customerTiers, item);
};
export const onUpdateCustomerTiers = async (data: CustomerTier[]): Promise<CustomerTier[]> => {
    await delay(300);
    db.customerTiers = data;
    return data;
};

export const fetchGifts = async (): Promise<Gift[]> => {
    await delay(150);
    return JSON.parse(JSON.stringify(db.gifts));
};
export const saveGift = async (item: Partial<Gift>): Promise<Gift> => {
    await delay(300);
    return saveData(db.gifts, item);
};
export const onUpdateGifts = async (data: Gift[]): Promise<Gift[]> => {
    await delay(300);
    db.gifts = data;
    return data;
};

export const fetchReligions = async (): Promise<Religion[]> => { await delay(150); return JSON.parse(JSON.stringify(db.religions)); };
export const onUpdateReligions = async (data: Religion[]): Promise<Religion[]> => { await delay(300); db.religions = data; return db.religions; };

export const fetchFestivals = async (): Promise<Festival[]> => { await delay(150); return JSON.parse(JSON.stringify(db.festivals)); };
export const onUpdateFestivals = async (data: Festival[]): Promise<Festival[]> => { await delay(300); db.festivals = data; return db.festivals; };

export const fetchFestivalDates = async (): Promise<FestivalDate[]> => { await delay(150); return JSON.parse(JSON.stringify(db.festivalDates)); };
export const onUpdateFestivalDates = async (data: FestivalDate[]): Promise<FestivalDate[]> => { await delay(300); db.festivalDates = data; return db.festivalDates; };

export const fetchFinancialYears = async (): Promise<FinancialYear[]> => { await delay(150); return JSON.parse(JSON.stringify(db.financialYears)); };
export const onUpdateFinancialYears = async (data: FinancialYear[]): Promise<FinancialYear[]> => { await delay(300); db.financialYears = data; return db.financialYears; };
export const fetchDocumentNumberingRules = async (): Promise<DocumentNumberingRule[]> => { await delay(150); return JSON.parse(JSON.stringify(db.documentNumberingRules)); };
export const onUpdateDocumentNumberingRules = async (data: DocumentNumberingRule[]): Promise<DocumentNumberingRule[]> => { await delay(300); db.documentNumberingRules = data; return db.documentNumberingRules; };

export const fetchBanks = async (): Promise<Bank[]> => { await delay(150); return JSON.parse(JSON.stringify(db.banks)); };
export const saveBank = async (item: Partial<Bank>): Promise<Bank> => {
    await delay(300);
    return saveData(db.banks, item);
};

export const fetchAccountTypes = async (): Promise<AccountType[]> => { await delay(150); return JSON.parse(JSON.stringify(db.accountTypes)); };
export const saveAccountType = async (item: Partial<AccountType>): Promise<AccountType> => {
    await delay(300);
    return saveData(db.accountTypes, item);
};
