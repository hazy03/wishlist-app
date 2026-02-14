import React, { useState } from 'react';
import { Button } from '../ui/Button';
import api from '../../services/api';
import { AutofillResponse } from '../../types';

interface AutofillButtonProps {
  url: string;
  onSuccess: (data: AutofillResponse) => void;
  onError: (error: string) => void;
}

export const AutofillButton: React.FC<AutofillButtonProps> = ({
  url,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAutofill = async () => {
    if (!url.trim()) {
      onError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/autofill', { url });
      onSuccess(response.data);
    } catch (err: any) {
      onError(err.response?.data?.detail || 'Failed to fetch product information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleAutofill}
      isLoading={isLoading}
      disabled={!url.trim()}
    >
      Auto-fill
    </Button>
  );
};

