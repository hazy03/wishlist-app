import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { Item } from '../../types';
import { getGuestName, setGuestName } from '../../utils/helpers';
import api from '../../services/api';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item;
  onSuccess: () => void;
  isAuthenticated: boolean;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
  isAuthenticated,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      const savedName = getGuestName();
      if (savedName) {
        setName(savedName);
      }
    }
  }, [isOpen, isAuthenticated]);

  const remaining = item.price - (item.total_contributions || 0);
  const minAmount = 1;
  const maxAmount = remaining;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < minAmount) {
      setError(`${t('amountMin')} ${minAmount} ₽`);
      return;
    }
    if (amountNum > maxAmount) {
      setError(`${t('amountMax')} ${maxAmount.toFixed(2)} ₽`);
      return;
    }

    if (!isAuthenticated && !name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/items/${item.id}/contribute`, {
        guest_name: isAuthenticated ? null : name.trim(),
        amount: amountNum,
      });

      if (!isAuthenticated && name.trim()) {
        setGuestName(name.trim());
      }

      onSuccess();
      setAmount('');
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('contributeToGift')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('item')}: {item.title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('total')}: {item.price.toLocaleString('ru-RU')} ₽</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('remaining')}: <span className="font-medium">{remaining.toFixed(2)} ₽</span>
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

        <Input
          type="number"
          label={`${t('amount')} (₽)`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min={minAmount}
          max={maxAmount}
          step="0.01"
          placeholder={`${t('amountMin')}: ${minAmount} ₽, ${t('amountMax')}: ${maxAmount.toFixed(2)} ₽`}
        />

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 {t('contributionInfo')}
          </p>
        </div>

        <div className="flex justify-end items-center gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {t('contribute')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

