import React, { useEffect, useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { useTranslation } from '../hooks/useTranslation';
import api from '../services/api';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Convert empty strings to null for optional fields
      const dataToSend = {
        ...formData,
        birthday: formData.birthday || null,
        bio: formData.bio || null,
        location: formData.location || null,
        phone: formData.phone || null,
        website: formData.website || null,
        avatar_url: formData.avatar_url || null,
        full_name: formData.full_name || null,
      };
      const response = await api.put('/profile', dataToSend);
      setProfile(response.data);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile save error:', error.response?.data);
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(t('invalidImageFile'));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t('imageTooLarge'));
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData({ ...formData, avatar_url: result });
      };
      reader.readAsDataURL(file);
    }
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
                <div 
                  onClick={handleAvatarClick}
                  className="relative cursor-pointer group"
                >
                  {(avatarPreview || formData.avatar_url) ? (
                    <img
                      src={avatarPreview || formData.avatar_url}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-2 border-warmGray dark:border-darkCard group-hover:opacity-70 transition-opacity"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold group-hover:opacity-70 transition-opacity">
                      {(formData.full_name || profile.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-charcoal dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray dark:text-darkMuted">
                    {t('clickToUploadAvatar')}
                  </p>
                  <p className="text-xs text-gray dark:text-darkMuted mt-1">
                    JPG, PNG, GIF до 5MB
                  </p>
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
                  setAvatarPreview(null);
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

