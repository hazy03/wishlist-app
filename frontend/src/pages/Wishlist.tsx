import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wishlist, Item } from '../types';
import { ItemCard } from '../components/item/ItemCard';
import { CreateItemModal } from '../components/item/CreateItemModal';
import { ShareButton } from '../components/wishlist/ShareButton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export const WishlistPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchWishlist();
    }
  }, [slug]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get(`/wishlists/${slug}`);
      const data = response.data;
      
      // If user is not owner, redirect to public view
      if (data.owner_id && user && data.owner_id !== user.id) {
        navigate(`/w/${slug}`);
        return;
      }
      
      setWishlist(data);
      setTitle(data.title);
      setDescription(data.description || '');
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemCreated = () => {
    fetchWishlist();
    setIsItemModalOpen(false);
  };

  const handleItemUpdated = () => {
    fetchWishlist();
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleItemDeleted = async () => {
    if (!deletingItem) return;
    
    setDeleteError('');
    try {
      await api.delete(`/items/${deletingItem.id}`);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      await fetchWishlist(); // Refresh after deletion
    } catch (error: any) {
      console.error('Failed to delete item:', error);
      setDeleteError(error.response?.data?.detail || t('error'));
    }
  };

  const handleWishlistUpdate = async () => {
    if (!slug) return;
    
    try {
      await api.put(`/wishlists/${slug}`, {
        title,
        description: description || null,
      });
      fetchWishlist();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <Skeleton className="h-16 w-96 mb-6" />
          <Skeleton className="h-6 w-64 mb-12" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-sm text-sage dark:text-forest font-medium mb-4 block">
                {t('wishlist')}
              </span>
              <h1 className="section-title mb-4">{wishlist.title}</h1>
              {wishlist.description && (
                <p className="section-subtitle max-w-2xl">{wishlist.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ShareButton slug={wishlist.slug} />
              <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
                {t('edit')}
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <Button variant="primary" onClick={() => setIsItemModalOpen(true)}>
            {t('addItem')}
          </Button>
        </div>

        {wishlist.items.length === 0 ? (
          <div className="text-center py-24 cozy-card animate-fade-in-slow">
            <div className="text-7xl mb-8">🎁</div>
            <h2 className="text-soft-4xl font-display text-charcoal dark:text-darkText mb-4 font-medium">
              {t('noItems')}
            </h2>
            <p className="cozy-text-lg mb-6">
              {t('addFirstGift')}
            </p>
            <Button variant="primary" onClick={() => setIsItemModalOpen(true)}>
              {t('createFirstGift')}
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isOwner={true}
                onEdit={() => {
                  setEditingItem(item);
                  setIsEditModalOpen(true);
                }}
                onDelete={() => {
                  setDeletingItem(item);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        <CreateItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          wishlistSlug={slug!}
          onSuccess={handleItemCreated}
        />

        <Modal
          isOpen={isEditModalOpen && !editingItem}
          onClose={() => setIsEditModalOpen(false)}
          title={t('editWishlist')}
        >
          <div className="space-y-4">
            <Input
              label={t('wishlistTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('wishlistDescription')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                rows={3}
              />
            </div>
            <div className="flex justify-end items-center gap-3">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" onClick={handleWishlistUpdate}>
                {t('save')}
              </Button>
            </div>
          </div>
        </Modal>

        {editingItem && (
          <CreateItemModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingItem(null);
            }}
            wishlistSlug={slug!}
            item={editingItem}
            onSuccess={handleItemUpdated}
          />
        )}

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingItem(null);
            setDeleteError('');
          }}
          title={t('deleteItem')}
        >
          <div className="space-y-4">
            {deleteError && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg">
                {deleteError}
              </div>
            )}
            <p className="text-gray-700 dark:text-gray-300">
              {t('deleteItemConfirm')} "{deletingItem?.title}"?
            </p>
            {deletingItem && (deletingItem.is_reserved || (deletingItem.total_contributions && deletingItem.total_contributions > 0)) && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {t('itemHasReservations')}
                </p>
              </div>
            )}
            <div className="flex justify-end items-center gap-3">
              <Button variant="outline" onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingItem(null);
                setDeleteError('');
              }}>
                {t('cancel')}
              </Button>
              <Button variant="danger" onClick={handleItemDeleted}>
                {t('delete')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

