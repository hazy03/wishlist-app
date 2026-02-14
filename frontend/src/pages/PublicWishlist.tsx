import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wishlist, Item } from '../types';
import { ItemCard } from '../components/item/ItemCard';
import { ReservationModal } from '../components/item/ReservationModal';
import { ContributionModal } from '../components/item/ContributionModal';
import { Skeleton } from '../components/ui/Skeleton';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';
import { WebSocketManager } from '../services/websocket';
import { useAuthStore } from '../store/authStore';

export const PublicWishlist: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservationModalItem, setReservationModalItem] = useState<Item | null>(null);
  const [contributionModalItem, setContributionModalItem] = useState<Item | null>(null);
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    if (slug) {
      fetchWishlist();
      connectWebSocket();
    }

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, [slug]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get(`/wishlists/${slug}`);
      const data = response.data;
      
      // If user is owner, redirect to edit view
      if (data.owner_id && user && data.owner_id === user.id) {
        navigate(`/wishlist/${slug}`);
        return;
      }
      
      setWishlist(data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!slug) return;
    
    const manager = new WebSocketManager(slug);
    manager.connect((data) => {
      if (data.type === 'wishlist_updated') {
        fetchWishlist();
      }
    });
    wsManagerRef.current = manager;
  };

  const handleReserve = (item: Item) => {
    setReservationModalItem(item);
  };

  const handleContribute = (item: Item) => {
    setContributionModalItem(item);
  };

  const handleReservationSuccess = () => {
    fetchWishlist();
  };

  const handleContributionSuccess = () => {
    fetchWishlist();
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
    return (
      <div className="min-h-screen bg-cream dark:bg-charcoal flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-soft-4xl font-display text-charcoal dark:text-darkText mb-4 font-medium">
            {t('wishlistNotFound')}
          </h2>
          <p className="cozy-text">{t('wishlistNotFoundDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <div className="mb-16">
          <span className="text-sm text-sage dark:text-forest font-medium mb-4 block">
            {t('wishlist')}
          </span>
          <h1 className="section-title mb-4">{wishlist.title}</h1>
          {wishlist.description && (
            <p className="section-subtitle max-w-2xl">{wishlist.description}</p>
          )}
        </div>

        {wishlist.items.length === 0 ? (
          <div className="text-center py-16 card animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce-subtle">🎁</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('thisWishlistEmpty')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('checkBackLater')}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isOwner={false}
                onReserve={() => handleReserve(item)}
                onContribute={() => handleContribute(item)}
              />
            ))}
          </div>
        )}

        {reservationModalItem && (
          <ReservationModal
            isOpen={!!reservationModalItem}
            onClose={() => setReservationModalItem(null)}
            item={reservationModalItem}
            onSuccess={handleReservationSuccess}
            isAuthenticated={isAuthenticated}
          />
        )}

        {contributionModalItem && (
          <ContributionModal
            isOpen={!!contributionModalItem}
            onClose={() => setContributionModalItem(null)}
            item={contributionModalItem}
            onSuccess={handleContributionSuccess}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    </div>
  );
};

