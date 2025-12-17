
import React, { useState } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Religion, Festival, FestivalDate } from '../../types';
import { useFetch } from '../../hooks/useFetch';
import { API_ENDPOINTS } from '../../config/api.config';

const ReligionsPage: React.FC = () => {
  const { RELIGION, FESTIVAL, FESTIVAL_DATE } = API_ENDPOINTS.MASTER_DATA;

  const [selectedReligion, setSelectedReligion] = useState<Religion | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);

  const { data: religions } = useFetch<Religion[]>(RELIGION);
  
  const activeReligions = religions?.filter(r => r.status === 1) || [];

  return (
    <MasterDataLayout title="Religions & Festivals">
      <div className="flex flex-col gap-6 h-full pb-8">
        
        {}
        <div>
          <GenericTableCrud<Religion>
            title="Religions"
            endpoint={RELIGION}
            columns={[{ header: 'Name', accessor: 'religion_name' }]}
            fields={[{ name: 'religion_name', label: 'Name', type: 'text', required: true }]}
            defaults={{ comp_id: 1001 }}
            searchKeys={['religion_name']}
            onRowClick={(item) => { setSelectedReligion(item); setSelectedFestival(null); }}
            selectedId={selectedReligion?.id}
          />
        </div>

        {}
        <div>
            {selectedReligion ? (
                <div className="contents" key={selectedReligion.id}>
                    <GenericTableCrud<Festival>
                        title={`Festivals (${selectedReligion.religion_name})`}
                        endpoint={FESTIVAL}
                        columns={[{ header: 'Name', accessor: 'festival_name' }]}
                        fields={[
                            { name: 'festival_name', label: 'Name', type: 'text', required: true },
                            { 
                                name: 'religion_id', label: 'Religion', type: 'select', required: true,
                                options: activeReligions.map(r => ({ label: r.religion_name, value: r.id! })) 
                            }
                        ]}
                        defaults={{ comp_id: 1001, religion_id: selectedReligion.id }}
                        transformRawData={(data) => data.filter(f => f.religion_id == selectedReligion.id)}
                        searchKeys={['festival_name']}
                        onRowClick={(item) => setSelectedFestival(item)}
                        selectedId={selectedFestival?.id}
                        emptyMessage="No festivals found."
                    />
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-slate-400 p-8 text-center">
                    Select a Religion above to manage Festivals
                </div>
            )}
        </div>

        {}
        <div>
            {selectedFestival ? (
                <div className="contents" key={selectedFestival.id}>
                    <GenericTableCrud<FestivalDate>
                        title={`Event Dates (${selectedFestival.festival_name})`}
                        endpoint={FESTIVAL_DATE}
                        columns={[
                            { header: 'Date', accessor: 'event_date' },
                            { header: 'Year', accessor: 'year' }
                        ]}
                        fields={[
                            { name: 'event_date', label: 'Date', type: 'date', required: true },
                            { name: 'year', label: 'Year', type: 'text', required: true }
                        ]}
                        defaults={{ festival_id: selectedFestival.id }}
                        transformRawData={(data) => data.filter(d => d.festival_id == selectedFestival.id)}
                        emptyMessage="No dates configured."
                        onSaveTransform={(data) => ({
                            ...data,
                            year: data.event_date ? data.event_date.split('-')[0] : data.year
                        })}
                    />
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-slate-400 p-8 text-center">
                    Select a Festival above to manage Dates
                </div>
            )}
        </div>

      </div>
    </MasterDataLayout>
  );
};

export default ReligionsPage;
