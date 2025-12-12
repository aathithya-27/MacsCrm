import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Select, Toggle } from '../ui';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'toggle' | 'email' | 'tel';
  required?: boolean;
  options?: { label: string; value: string | number }[];
  disabled?: boolean;
  placeholder?: string;
  validation?: any;
}

interface SmartFormProps {
  fields: FormField[];
  defaultValues?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SmartForm: React.FC<SmartFormProps> = ({ 
  fields, 
  defaultValues, 
  onSubmit, 
  onCancel, 
  isLoading 
}) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: defaultValues || {}
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <Controller
              name={field.name}
              control={control}
              rules={{ 
                required: field.required ? `${field.label} is required` : false,
                ...field.validation
              }}
              render={({ field: { onChange, value } }) => {
                switch (field.type) {
                  case 'select':
                    return (
                      <Select
                        label={field.label}
                        options={field.options || []}
                        value={value}
                        onChange={onChange}
                        error={errors[field.name]?.message as string}
                        disabled={field.disabled}
                        placeholder={field.placeholder}
                      />
                    );
                  case 'toggle':
                    return (
                      <div className="flex items-center justify-between pt-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {field.label}
                        </label>
                        <Toggle
                          checked={!!value}
                          onChange={onChange}
                          disabled={field.disabled}
                        />
                      </div>
                    );
                  default:
                    return (
                      <Input
                        label={field.label}
                        type={field.type}
                        value={value || ''}
                        onChange={onChange}
                        error={errors[field.name]?.message as string}
                        disabled={field.disabled}
                        placeholder={field.placeholder}
                      />
                    );
                }
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="success" isLoading={isLoading}>
          Save
        </Button>
      </div>
    </form>
  );
};
