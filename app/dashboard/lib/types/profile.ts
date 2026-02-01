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
  name: string | null;
  profile_picture_url: string | null;
  followers: number | null;
  following: number | null;
  posts: number | null;
  instagram_page_id: string | null;
  instagram_page_access_token: string | null;
  webhooks_subscribed: boolean;
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
