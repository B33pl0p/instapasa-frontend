export interface SellerProfile {
  email: string;
  customer_id: string;
  business_name: string | null;
  brand_description: string | null;
  tone: string | null;
  phone: string | null;
  website: string | null;
  company_contact_person: string | null;
  contact_person_role: string | null;
  instagram_connected: boolean;
  instagram_username: string | null;
  instagram_id: string | null;
  instagram_name: string | null;
  instagram_profile_picture_url: string | null;
  instagram_followers: number | null;
  instagram_following: number | null;
  instagram_posts: number | null;
  instagram_page_id: string | null;
  instagram_page_access_token: string | null;
  webhook_subscribed: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  business_name?: string;
  brand_description?: string;
  tone?: string;
  phone?: string;
  website?: string;
  company_contact_person?: string;
  contact_person_role?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ProfileUpdateResponse {
  message: string;
  updated_fields: string[];
}
