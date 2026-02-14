import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Friendship, FriendWishlist } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { useTranslation } from '../hooks/useTranslation';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export const Friends: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [friendWishlists, setFriendWishlists] = useState<FriendWishlist[]>([]);
  const [isWishlistsLoading, setIsWishlistsLoading] = useState(false);
  const [isWishlistsModalOpen, setIsWishlistsModalOpen] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/friends');
      setFriends(response.data);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/friends/pending');
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      await api.post('/friends/request', { addressee_id: userId });
      fetchPendingRequests();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      alert(error.response?.data?.detail || t('error'));
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await api.put(`/friends/${friendshipId}`, { status: 'accepted' });
      fetchFriends();
      fetchPendingRequests();
    } catch (error: any) {
      alert(error.response?.data?.detail || t('error'));
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      await api.put(`/friends/${friendshipId}`, { status: 'rejected' });
      fetchPendingRequests();
    } catch (error: any) {
      alert(error.response?.data?.detail || t('error'));
    }
  };

  const handleDeleteFriendship = async (friendshipId: string) => {
    try {
      await api.delete(`/friends/${friendshipId}`);
      fetchFriends();
    } catch (error: any) {
      alert(error.response?.data?.detail || t('error'));
    }
  };

  const viewFriendWishlists = async (friend: User) => {
    setSelectedFriend(friend);
    setIsWishlistsLoading(true);
    setIsWishlistsModalOpen(true);
    try {
      const response = await api.get(`/friends/${friend.id}/wishlists`);
      setFriendWishlists(response.data);
    } catch (error: any) {
      alert(error.response?.data?.detail || t('error'));
    } finally {
      setIsWishlistsLoading(false);
    }
  };

  const getPendingRequestForUser = (userId: string) => {
    return pendingRequests.find(
      (req) =>
        (req.requester_id === userId || req.addressee_id === userId) &&
        req.status === 'pending'
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <Skeleton className="h-16 w-96 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        <div className="mb-16">
          <span className="text-sm text-sage dark:text-forest font-medium mb-4 block">
            {t('friends')}
          </span>
          <h1 className="section-title">
            {t('myFriends')}
          </h1>

          {/* Search Users */}
          <div className="mb-6">
            <Input
              type="text"
              label={t('searchUsers')}
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('searchUsersPlaceholder')}
            />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                {searchResults.map((user) => {
                  const pendingRequest = getPendingRequestForUser(user.id);
                  const isFriend = friends.some((f) => f.id === user.id);
                  return (
                    <div
                      key={user.id}
                      className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      {isFriend ? (
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {t('alreadyFriends')}
                        </span>
                      ) : pendingRequest ? (
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">
                          {t('requestPending')}
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => sendFriendRequest(user.id)}
                        >
                          {t('addFriend')}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Requests */}
          {pendingRequests.filter(req => user && req.addressee_id === user.id).length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t('pendingRequests')}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRequests
                  .filter(req => user && req.addressee_id === user.id)
                  .map((request) => (
                    <div
                      key={request.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {t('receivedRequest')}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          {t('accept')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          {t('reject')}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('myFriends')} ({friends.length})
          </h2>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-16 card animate-fade-in">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('noFriends')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('noFriendsDesc')}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {friend.full_name || friend.email}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{friend.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => viewFriendWishlists(friend)}
                  >
                    {t('viewWishlists')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Friend Wishlists Modal */}
        <Modal
          isOpen={isWishlistsModalOpen}
          onClose={() => {
            setIsWishlistsModalOpen(false);
            setSelectedFriend(null);
            setFriendWishlists([]);
          }}
          title={selectedFriend ? `${t('wishlistsOf')} ${selectedFriend.full_name || selectedFriend.email}` : t('wishlists')}
          size="lg"
        >
          {isWishlistsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : friendWishlists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">{t('noWishlists')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friendWishlists.map((wishlist) => (
                <Link
                  key={wishlist.id}
                  to={`/w/${wishlist.slug}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {wishlist.title}
                  </h3>
                  {wishlist.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {wishlist.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {t('itemsCount')}: {wishlist.items_count}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

