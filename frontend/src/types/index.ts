export interface User {
  id: string;
  email: string;
  full_name: string | null;
  provider: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Wishlist {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  owner_id?: string;
  created_at: string;
  updated_at: string | null;
  items: Item[];
}

export interface Item {
  id: string;
  wishlist_id: string;
  title: string;
  url: string | null;
  price: number;
  image_url: string | null;
  is_group_gift: boolean;
  created_at: string;
  updated_at: string | null;
  // Owner view
  is_reserved?: boolean;
  status?: string;
  // Public view
  reserved_by?: string | null;
  total_contributions?: number | null;
  contributions?: ContributionInfo[];
}

export interface ContributionInfo {
  name: string;
  amount: number;
}

export interface Reservation {
  id: string;
  item_id: string;
  guest_name: string | null;
}

export interface Contribution {
  id: string;
  item_id: string;
  guest_name: string | null;
  amount: number;
}

export interface AutofillResponse {
  title: string | null;
  image_url: string | null;
  price: number | null;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface FriendWishlist {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  created_at: string;
  updated_at: string | null;
  items_count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  birthday: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
  updated_at: string | null;
}

