import React from 'react';
import { Link } from 'react-router-dom';
import { Wishlist } from '../../types';
import { formatDate } from '../../utils/helpers';

interface WishlistCardProps {
  wishlist: Wishlist;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({ wishlist }) => {
  return (
    <Link
      to={`/wishlist/${wishlist.slug}`}
      className="block cozy-card hover:shadow-soft-xl transition-all duration-500 animate-fade-in group"
    >
      <h3 className="text-soft-2xl font-display text-charcoal dark:text-darkText mb-4 group-hover:text-sage dark:group-hover:text-forest transition-colors font-medium">
        {wishlist.title}
      </h3>
      {wishlist.description && (
        <p className="cozy-text mb-6 line-clamp-3">{wishlist.description}</p>
      )}
      <div className="flex items-center justify-between text-sm text-gray dark:text-darkMuted pt-4 border-t border-warmGray dark:border-darkCard">
        <span>{wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'}</span>
        <span>{formatDate(wishlist.created_at)}</span>
      </div>
    </Link>
  );
};

