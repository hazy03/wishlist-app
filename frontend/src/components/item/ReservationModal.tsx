import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { Item } from '../../types';
import { getGuestName, setGuestName } from '../../utils/helpers';
import api from '../../services/api';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
  onSuccess: () => void;
  isAuthenticated: boolean;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
  isAuthenticated,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      const savedName = getGuestName();
      if (savedName) {
        setName(savedName);
      }
    }
  }, [isOpen, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated && !name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/items/${item.id}/reserve`, {
        guest_name: isAuthenticated ? null : name.trim(),
      });

      if (!isAuthenticated && name.trim()) {
        setGuestName(name.trim());
      }

      onSuccess();
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('reserveGift')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('item')}: {item.title}</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('price')}: {item.price.toLocaleString('ru-RU')} ₽
          </p>
        </div>

        {!isAuthenticated && (
          <Input
            label={t('guestName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t('guestName')}
          />
        )}

        <div className="flex justify-end items-center gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {t('reserve')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

