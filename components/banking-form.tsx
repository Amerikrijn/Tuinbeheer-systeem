'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { validateInput } from '@/lib/banking-security';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormData {
  [key: string]: any;
}

export function BankingForm({ 
  onSubmit, 
  schema, 
  children,
  title,
  description 
}: {
  onSubmit: (data: FormData) => Promise<void>;
  schema?: any;
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<FormData>({
    resolver: schema,
    mode: 'onChange' // Real-time validation
  });
  
  const onSubmitHandler = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Client-side validation
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && !validateInput(value, 1000, false)) {
          throw new Error(`Ongeldige invoer in veld: ${key}`);
        }
      }
      
      await onSubmit(data);
      
      // Success feedback
      // Show success message or redirect
      
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Er is een fout opgetreden');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit(onSubmitHandler)}
      className=""banking-form space-y-6 max-w-2xl mx-auto"
      noValidate // We handle validation ourselves
      role="form"
      aria-labelledby="form-title"
      aria-describedby={description ? "form-description" : undefined}
    >
      <div className=""form-header">
        <h1 id="form-title" className=""text-2xl font-bold text-foreground mb-2">
          {title}
        </h1>
        {description && (
          <p id="form-description" className=""text-muted-foreground mb-6">
            {description}
          </p>
        )}
      </div>
      
      <div className=""form-content space-y-4">
        {children}
      </div>
      
      {submitError && (
        <div 
          id="submit-error"
          className=""error-message bg-red-50 dark:bg-red-950 border border-red-200 rounded-md p-4 text-red-700 dark:text-red-300" 
          role="alert"
          aria-live="polite"
        >
          <strong>Fout:</strong> {submitError}
        </div>
      )}
      
      <div className=""form-actions pt-6 border-t border-gray-200 dark:border-gray-600">
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className=""w-full sm:w-auto bg-green-600 dark:bg-green-700 hover:bg-green-700 focus:ring-green-500"
          aria-describedby={submitError ? "submit-error" : undefined}
        >
          {isSubmitting ? (
            <>
              <div className=""h-4 w-4 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mr-2" aria-hidden="true" />
              <span>Bezig met opslaan...</span>
            </>
          ) : (
            'Opslaan'
          )}
        </Button>
      </div>
    </form>
  );
}