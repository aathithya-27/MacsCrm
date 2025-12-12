import React from 'react';
import MasterDataLayout from './MasterDataLayout';
import { Hammer } from 'lucide-react';

interface Props {
  title: string;
}

const UnderConstruction: React.FC<Props> = ({ title }) => {
  return (
    <MasterDataLayout title={title}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center h-[60vh]">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <Hammer size={48} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Module Under Construction</h2>
        <p className="text-slate-500 max-w-md">
          The <strong>{title}</strong> module is currently being developed. Please check back later or use the Branch or Company Master modules.
        </p>
      </div>
    </MasterDataLayout>
  );
};

export default UnderConstruction;