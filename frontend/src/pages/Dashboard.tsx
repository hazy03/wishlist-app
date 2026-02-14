import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wishlist } from '../types';
import { WishlistCard } from '../components/wishlist/WishlistCard';
import { CreateWishlistModal } from '../components/wishlist/CreateWishlistModal';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      const response = await api.get('/wishlists');
      setWishlists(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistCreated = (wishlist: Wishlist) => {
    setWishlists([wishlist, ...wishlists]);
    navigate(`/wishlist/${wishlist.slug}`);
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <div className="mb-16">
          <span className="text-sm text-sage dark:text-forest font-medium mb-4 block">
            {t('dashboard')}
          </span>
          <div className="flex justify-between items-center">
            <h1 className="section-title mb-0">
              {t('myWishlists')}
            </h1>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              {t('createWishlist')}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : wishlists.length === 0 ? (
          <div className="text-center py-24 animate-fade-in-slow">
            <div className="text-7xl mb-8">🎁</div>
            <h2 className="text-soft-4xl font-display text-charcoal dark:text-darkText mb-4 font-medium">
              {t('noWishlists')}
            </h2>
            <p className="cozy-text-lg mb-10 max-w-md mx-auto">
              {t('welcomeDescription')}
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              {t('createWishlist')}
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlists.map((wishlist) => (
              <WishlistCard key={wishlist.id} wishlist={wishlist} />
            ))}
          </div>
        )}

        <CreateWishlistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleWishlistCreated}
        />
      </div>
    </div>
  );
};

