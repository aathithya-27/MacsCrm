import React, { createContext, useContext, useState, useEffect } from 'react';
import { companyMasterApi } from '../services/masterDataApi/companyMaster.api';
import { CompanyMaster } from '../types';
import { logError } from '../utils/errorUtils';

interface CompanyContextType {
  company: CompanyMaster | null;
  refreshCompany: () => Promise<void>;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyMaster | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    try {
      // Defaulting to Company ID 1 as per current application logic
      const response = await companyMasterApi.getById(1);
      if (response && response.data) {
        setCompany(response.data);
      }
    } catch (error) {
      logError(error, 'CompanyContext_Fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  // Update Document Title when company name changes
  useEffect(() => {
    if (company?.comp_name) {
      document.title = `${company.comp_name} - Finroots CRM`;
    }
  }, [company]);

  return (
    <CompanyContext.Provider value={{ company, refreshCompany: fetchCompany, loading }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
