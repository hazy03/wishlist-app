import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AutofillButton } from './AutofillButton';
import { useTranslation } from '../../hooks/useTranslation';
import { Item, AutofillResponse } from '../../types';
import api from '../../services/api';

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistSlug: string;
  item?: Item;
  onSuccess: () => void;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  isOpen,
  onClose,
  wishlistSlug,
  item,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGroupGift, setIsGroupGift] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setUrl(item.url || '');
      setPrice(item.price.toString());
      setImageUrl(item.image_url || '');
      setImagePreview(item.image_url || null);
      setIsGroupGift(item.is_group_gift);
    } else {
      setTitle('');
      setUrl('');
      setPrice('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null);
      setIsGroupGift(false);
    }
  }, [item, isOpen]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(t('invalidImageFile'));
        e.target.value = ''; // Reset input
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('imageTooLarge'));
        e.target.value = ''; // Reset input
        return;
      }
      setError(''); // Clear any previous errors
      setImageFile(file);
      setImageUrl(''); // Clear URL if file is selected
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    // For now, we'll use a data URL approach
    // In production, you'd upload to a service like Cloudinary, AWS S3, etc.
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAutofillSuccess = (data: AutofillResponse) => {
    if (data.title) setTitle(data.title);
    if (data.image_url) setImageUrl(data.image_url);
    if (data.price) setPrice(data.price.toString());
  };

  const handleAutofillError = (err: string) => {
    setError(err);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError(t('priceRequired'));
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl = imageUrl;
      
      // Upload image file if selected
      if (imageFile) {
        setIsUploadingImage(true);
        finalImageUrl = await uploadImage(imageFile);
        setIsUploadingImage(false);
      }

      if (item) {
        await api.put(`/items/${item.id}`, {
          title,
          url: url || null,
          price: priceNum,
          image_url: finalImageUrl || null,
          is_group_gift: isGroupGift,
        });
      } else {
        await api.post(`/wishlists/${wishlistSlug}/items`, {
          title,
          url: url || null,
          price: priceNum,
          image_url: finalImageUrl || null,
          is_group_gift: isGroupGift,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || t('error'));
      setIsUploadingImage(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? t('editItem') : t('addItem')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('productUrlOptional')}
          </label>
          <div className="flex space-x-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/product"
              className="flex-1"
            />
            <AutofillButton
              url={url}
              onSuccess={handleAutofillSuccess}
              onError={handleAutofillError}
            />
          </div>
        </div>

        <Input
          label={t('itemTitle')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder={t('itemTitle')}
        />

        <Input
          type="number"
          label={`${t('itemPrice')} (₽)`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          step="0.01"
          placeholder="0.00"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('itemImage')} ({t('optional')})
          </label>
          
          {/* Image Preview */}
          {(imagePreview || imageUrl) && (
            <div className="mb-3">
              <img
                src={imagePreview || imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
            </div>
          )}

          {/* Upload from URL */}
          <div className="mb-3">
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                const url = e.target.value;
                setImageUrl(url);
                if (url) {
                  setImageFile(null);
                  setImagePreview(url);
                } else {
                  setImagePreview(null);
                }
              }}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Upload from file */}
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {t('uploadImage')}
              </Button>
            </label>
            {imageFile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                {t('remove')}
              </Button>
            )}
          </div>
          {imageFile && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isGroupGift"
            checked={isGroupGift}
            onChange={(e) => setIsGroupGift(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label htmlFor="isGroupGift" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {t('enableGroupContributions')}
          </label>
        </div>

        <div className="flex justify-end items-center gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {item ? t('update') : t('addItem')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

