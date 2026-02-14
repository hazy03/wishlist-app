import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { useTranslation } from '../hooks/useTranslation';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  // const navigate = useNavigate();
  // const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    birthday: '',
    location: '',
    phone: '',
    website: '',
    avatar_url: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        bio: response.data.bio || '',
        birthday: response.data.birthday || '',
        location: response.data.location || '',
        phone: response.data.phone || '',
        website: response.data.website || '',
        avatar_url: response.data.avatar_url || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      const response = await api.put('/profile', formData);
      setProfile(response.data);
      setIsEditing(false);
    } catch (error: any) {
      setError(error.response?.data?.detail || t('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAge = (birthday: string | null): number | null => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <Skeleton className="h-40 w-full mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const age = calculateAge(profile.birthday);

  return (
    <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <div className="cozy-card">
          <div className="mb-10 pb-8 border-b border-warmGray dark:border-darkCard">
            <span className="text-sm text-sage dark:text-forest font-medium mb-4 block">
              {t('profile')}
            </span>
            <div className="flex items-center justify-between">
              <h1 className="text-soft-5xl font-display text-charcoal dark:text-darkText font-medium">
                {t('myProfile')}
              </h1>
              {!isEditing && (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  {t('editProfile')}
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-soft text-red-600 dark:text-red-400">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {formData.avatar_url && (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-warmGray dark:border-darkCard"
                  />
                )}
                <div className="flex-1">
                  <Input
                    label={t('avatarUrl')}
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <Input
                label={t('fullName')}
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder={t('fullName')}
              />

              <div>
                <label className="block text-sm font-medium text-charcoal dark:text-darkText mb-2">
                  {t('bio')}
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={t('bioPlaceholder')}
                  rows={6}
                  className="input resize-none"
                />
              </div>

              <Input
                type="date"
                label={t('birthday')}
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              />

              <Input
                label={t('location')}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('locationPlaceholder')}
              />

              <Input
                type="tel"
                label={t('phone')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('phonePlaceholder')}
              />

              <Input
                type="url"
                label={t('website')}
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />

              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                  {t('save')}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}>
                  {t('cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.email}
                    className="w-24 h-24 rounded-full object-cover border-2 border-warmGray dark:border-darkCard"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {(profile.full_name || profile.email)[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-soft-3xl font-display text-charcoal dark:text-darkText mb-2 font-medium">
                    {profile.full_name || profile.email}
                  </h2>
                  <p className="text-sm text-gray dark:text-darkMuted">{profile.email}</p>
                </div>
              </div>

              {profile.bio && (
                <div className="pt-6 border-t border-warmGray dark:border-darkCard">
                  <h3 className="text-soft-xl font-display text-charcoal dark:text-darkText mb-4 font-medium">
                    {t('about')}
                  </h3>
                  <p className="cozy-text whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-warmGray dark:border-darkCard">
                {profile.birthday && (
                  <div>
                    <h3 className="text-sm text-gray dark:text-darkMuted mb-2 font-medium">
                      {t('birthday')}
                    </h3>
                    <p className="text-charcoal dark:text-darkText">
                      {new Date(profile.birthday).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {age !== null && ` (${age} ${t('yearsOld')})`}
                    </p>
                  </div>
                )}

                {profile.location && (
                  <div>
                    <h3 className="text-sm text-gray dark:text-darkMuted mb-2 font-medium">
                      {t('location')}
                    </h3>
                    <p className="text-charcoal dark:text-darkText">{profile.location}</p>
                  </div>
                )}

                {profile.phone && (
                  <div>
                    <h3 className="text-sm text-gray dark:text-darkMuted mb-2 font-medium">
                      {t('phone')}
                    </h3>
                    <p className="text-charcoal dark:text-darkText">{profile.phone}</p>
                  </div>
                )}

                {profile.website && (
                  <div>
                    <h3 className="text-sm text-gray dark:text-darkMuted mb-2 font-medium">
                      {t('website')}
                    </h3>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage dark:text-forest hover:opacity-80 transition-opacity"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-warmGray dark:border-darkCard">
                <h3 className="text-sm text-gray dark:text-darkMuted mb-2 font-medium">
                  {t('memberSince')}
                </h3>
                <p className="text-charcoal dark:text-darkText">
                  {new Date(profile.created_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

