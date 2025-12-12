
import React, { useState } from 'react';
import MasterDataLayout from './MasterDataLayout';
import { GenericTableCrud } from '../../components/generic/GenericTableCrud';
import { Religion, Festival, FestivalDate } from '../../types';
import { useFetch } from '../../hooks/useFetch';

const ReligionsPage: React.FC = () => {
  const [selectedReligion, setSelectedReligion] = useState<Religion | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);

  const { data: religions } = useFetch<Religion[]>('/religions');
  
  // Need to pass active religion list to festival form
  const activeReligions = religions?.filter(r => r.status === 1) || [];

  return (
    <MasterDataLayout title="Religions & Festivals">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-8">
        
        {/* 1. Religion */}
        <GenericTableCrud<Religion>
          title="Religions"
          endpoint="/religions"
          columns={[{ header: 'Name', accessor: 'religion_name' }]}
          fields={[{ name: 'religion_name', label: 'Name', type: 'text', required: true }]}
          defaults={{ comp_id: 1001 }}
          searchKeys={['religion_name']}
          onRowClick={(item) => { setSelectedReligion(item); setSelectedFestival(null); }}
          selectedId={selectedReligion?.id}
        />

        {/* 2. Festival */}
        <div className="flex flex-col h-full">
            {selectedReligion ? (
                <div className="contents" key={selectedReligion.id}>
                    <GenericTableCrud<Festival>
                        title="Festivals"
                        endpoint="/festivals"
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
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-slate-400 p-4 text-center">
                    Select a Religion
                </div>
            )}
        </div>

        {/* 3. Dates */}
        <div className="flex flex-col h-full">
            {selectedFestival ? (
                <div className="contents" key={selectedFestival.id}>
                    <GenericTableCrud<FestivalDate>
                        title="Event Dates"
                        endpoint="/festivalDates"
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
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-slate-400 p-4 text-center">
                    Select a Festival
                </div>
            )}
        </div>

      </div>
    </MasterDataLayout>
  );
};

export default ReligionsPage;
