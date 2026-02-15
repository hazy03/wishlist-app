import React from 'react';
import { Item } from '../../types';
import { formatPrice } from '../../utils/helpers';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguageStore } from '../../store/languageStore';
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
  const { language } = useLanguageStore();
  const locale = language === 'ru' ? 'ru-RU' : 'en-US';
  const isReserved = item.is_reserved || item.reserved_by !== null;
  // Fix: Convert to numbers for proper comparison (backend sends Decimal as string)
  const totalContributions = Number(item.total_contributions || 0);
  const itemPrice = Number(item.price);
  const isFullyFunded = totalContributions >= itemPrice;

  return (
    <div className="cozy-card overflow-hidden hover:shadow-soft-xl transition-all duration-500 group">
      {item.image_url && (
        <div className="w-full h-48 md:h-64 overflow-hidden mb-4 md:mb-6 rounded-soft">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      <div>
        <h3 className="text-xl md:text-2xl font-display text-charcoal dark:text-darkText mb-2 md:mb-3 group-hover:text-sage dark:group-hover:text-forest transition-colors font-medium break-words">
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

        <div className="mb-4 md:mb-6 pb-3 md:pb-4 border-b border-warmGray dark:border-darkCard">
          <p className="text-2xl md:text-3xl font-display text-charcoal dark:text-darkText font-medium">{formatPrice(item.price, locale)}</p>
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
            <div className="flex items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-warmGray dark:border-darkCard">
              <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 md:flex-none">
                {t('edit')}
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete} className="flex-1 md:flex-none">
                {t('delete')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {item.is_group_gift ? (
              <>
                <ProgressBar
                  current={totalContributions}
                  total={itemPrice}
                />
                {item.contributions && item.contributions.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-warmGray dark:border-darkCard">
                    <p className="text-sm text-gray dark:text-darkMuted mb-3">{t('contributors')}:</p>
                    <ul className="space-y-2">
                      {item.contributions.map((contrib, idx) => (
                        <li key={idx} className="text-sm text-charcoal dark:text-darkText">
                          {contrib.name} – {formatPrice(contrib.amount, locale)}
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

