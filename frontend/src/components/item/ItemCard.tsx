import React from 'react';
import { Item } from '../../types';
import { formatPrice } from '../../utils/helpers';
import { useTranslation } from '../../hooks/useTranslation';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';

interface ItemCardProps {
  item: Item;
  isOwner?: boolean;
  onReserve?: () => void;
  onContribute?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isOwner = false,
  onReserve,
  onContribute,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const isReserved = item.is_reserved || item.reserved_by !== null;
  const isFullyFunded = (item.total_contributions ?? 0) >= item.price;

  return (
    <div className="cozy-card overflow-hidden hover:shadow-soft-xl transition-all duration-500 group">
      {item.image_url && (
        <div className="w-full h-64 overflow-hidden mb-6 rounded-soft">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      <div>
        <h3 className="text-soft-2xl font-display text-charcoal dark:text-darkText mb-3 group-hover:text-sage dark:group-hover:text-forest transition-colors font-medium">
          {item.title}
        </h3>
        
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage dark:text-forest hover:opacity-80 text-sm mb-4 block transition-opacity"
          >
            {t('viewProduct')} →
          </a>
        )}

        <div className="mb-6 pb-4 border-b border-warmGray dark:border-darkCard">
          <p className="text-soft-3xl font-display text-charcoal dark:text-darkText font-medium">{formatPrice(item.price)}</p>
        </div>

        {isOwner ? (
          <div className="space-y-4">
            {item.is_group_gift ? (
              <div>
                <p className="text-sm text-gray dark:text-darkMuted mb-4">
                  {t('status')}: <span className="font-medium text-charcoal dark:text-darkText">{item.status || t('notStarted')}</span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray dark:text-darkMuted mb-4">
                  {t('status')}: <span className="font-medium text-charcoal dark:text-darkText">{isReserved ? t('reserved') : t('available')}</span>
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 pt-4 border-t border-warmGray dark:border-darkCard">
              <Button variant="outline" size="sm" onClick={onEdit}>
                {t('edit')}
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete}>
                {t('delete')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {item.is_group_gift ? (
              <>
                <ProgressBar
                  current={item.total_contributions || 0}
                  total={item.price}
                />
                {item.contributions && item.contributions.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-warmGray dark:border-darkCard">
                    <p className="text-sm text-gray dark:text-darkMuted mb-3">{t('contributors')}:</p>
                    <ul className="space-y-2">
                      {item.contributions.map((contrib, idx) => (
                        <li key={idx} className="text-sm text-charcoal dark:text-darkText">
                          {contrib.name} – {formatPrice(contrib.amount)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={onContribute}
                  disabled={isFullyFunded}
                >
                  {isFullyFunded ? t('fullyFunded') : t('contribute')}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                onClick={onReserve}
                disabled={isReserved}
              >
                {isReserved ? `${t('reservedBy')} ${item.reserved_by || t('reservedBySomeone')}` : t('reserve')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

