import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import { Wishlist } from '../../types';

interface CreateWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (wishlist: Wishlist) => void;
}

export const CreateWishlistModal: React.FC<CreateWishlistModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/wishlists', {
        title,
        description: description || null,
      });
      onSuccess(response.data);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('createNewWishlist')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label={t('wishlistTitle')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder={t('wishlistTitle')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('wishlistDescription')} ({t('cancel')})
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            rows={3}
            placeholder={t('wishlistDescription')}
          />
        </div>

        <div className="flex justify-end items-center gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {t('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

