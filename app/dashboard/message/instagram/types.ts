// Types for Instagram Messages API responses

export interface Participant {
  username: string;
  id: string;
}

export interface LastMessage {
  id: string;
  created_time: string;
  text: string;
  from: Participant;
  to: Participant[];
}

export interface Conversation {
  platform: string;
  conversation_id: string;
  updated_time: string;
  participants: Participant[];
  last_message: LastMessage;
  buyer_id?: string;
  buyer_username?: string;
}

export interface MessagesOverviewResponse {
  instagram_user_id: string;
  instagram_username: string;
  page_id: string;
  platform: string;
  conversations: Conversation[];
}

export interface Postback {
  title: string;
  payload: string;
}

export interface Attachment {
  type: string;
  url: string;
  media?: any;
}

export interface Message {
  id: string;
  created_time: string;
  text: string | null;
  from: Participant;
  to: Participant[];
  is_from_business: boolean;
  postback?: Postback | null;
  attachments?: Attachment[] | null;
  sticker?: string | null;
}

export interface ConversationDetailResponse {
  instagram_user_id: string;
  instagram_username: string;
  page_id: string;
  platform: string;
  conversation_id: string;
  messages: Message[];
  total?: number;
  limit?: number;
  offset?: number;
  has_more?: boolean;
}
