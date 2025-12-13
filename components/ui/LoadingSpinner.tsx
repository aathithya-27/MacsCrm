import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full w-full min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);