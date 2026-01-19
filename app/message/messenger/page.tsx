'use client';

import { useSearchParams } from 'next/navigation';
import ConversationView from './components/ConversationView';

export default function Messenger() {
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get('conversation');

  return (
    <ConversationView conversationId={selectedConversationId} />
  );
}
