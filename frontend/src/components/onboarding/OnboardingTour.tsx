import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';

interface OnboardingStep {
  title: string;
  content: string;
  image?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      title: t('onboardingWelcome'),
      content: t('onboardingWelcomeDesc'),
    },
    {
      title: t('onboardingWishlists'),
      content: t('onboardingWishlistsDesc'),
      action: {
        label: t('createWishlist'),
        onClick: () => {
          navigate('/dashboard');
          onComplete();
        },
      },
    },
    {
      title: t('onboardingItems'),
      content: t('onboardingItemsDesc'),
    },
    {
      title: t('onboardingSharing'),
      content: t('onboardingSharingDesc'),
    },
    {
      title: t('onboardingFriends'),
      content: t('onboardingFriendsDesc'),
      action: {
        label: t('exploreFriends'),
        onClick: () => {
          navigate('/friends');
          onComplete();
        },
      },
    },
    {
      title: t('onboardingReady'),
      content: t('onboardingReadyDesc'),
      action: {
        label: t('getStarted'),
        onClick: () => {
          navigate('/dashboard');
          onComplete();
        },
      },
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <Modal
      isOpen={true}
      onClose={handleSkip}
      title={currentStepData.title}
      size="lg"
    >
      <div className="space-y-10">
        <div className="text-center">
          <div className="text-7xl mb-8">
            {currentStep === 0 && '👋'}
            {currentStep === 1 && '📝'}
            {currentStep === 2 && '🎁'}
            {currentStep === 3 && '🔗'}
            {currentStep === 4 && '👥'}
            {currentStep === 5 && '🚀'}
          </div>
          <p className="cozy-text text-center max-w-lg mx-auto">
            {currentStepData.content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-8 border-t-2 border-ink dark:border-cream">
          <div className="flex space-x-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-8 ${
                  index === currentStep
                    ? 'bg-ink dark:bg-cream'
                    : 'bg-gray-300 dark:bg-gray-600'
                } transition-all duration-300`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                {t('back')}
              </Button>
            )}
            <Button variant="secondary" onClick={handleSkip}>
              {t('skip')}
            </Button>
            {currentStepData.action ? (
              <Button variant="primary" onClick={currentStepData.action.onClick}>
                {currentStepData.action.label}
              </Button>
            ) : (
              <Button variant="primary" onClick={handleNext}>
                {currentStep === steps.length - 1 ? t('finish') : t('next')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

