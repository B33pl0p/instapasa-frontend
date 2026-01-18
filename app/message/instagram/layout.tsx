'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/app/lib/apiClient';
import type { Conversation, MessagesOverviewResponse } from './types';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function InstagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get('conversation') || undefined;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessUsername, setBusinessUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<MessagesOverviewResponse>(
          '/dashboard/messages-overview?platform=instagram'
        );
        setConversations(response.data.conversations || []);
        setBusinessUsername(response.data.instagram_username);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number } };
          if (axiosError.response?.status === 400) {
            setError('Instagram not connected');
          } else {
            setError('Failed to load conversations');
          }
        } else {
          setError('Failed to load conversations');
        }
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchConversations();
  }, []);

  const handleSelectConversation = (conversationId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('conversation', conversationId);
    router.push(`/message/instagram?${params.toString()}`);
  };

  const getParticipantName = (conversation: Conversation): string => {
    if (!businessUsername) {
      return conversation.participants[1]?.username || conversation.participants[0]?.username || 'Unknown User';
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.username !== businessUsername
    );
    return otherParticipant?.username || 'Unknown User';
  };

  const formatTime = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      {/* Left Panel - Conversation List (Fixed Width) */}
      <div className="w-80 shrink-0 border-r border-gray-200 overflow-hidden">
        <div className="flex h-full flex-col bg-white overflow-hidden">
          <div className="border-b border-gray-200 px-4 py-3 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Instagram Chats</h2>
          </div>
          
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-[#8A38F5] border-t-transparent"></div>
                <p className="text-sm text-gray-500">Loading conversations...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-center text-sm text-red-500">{error}</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-center text-sm text-gray-500">No conversations yet</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0">
              {conversations.map((conversation) => {
                const participantName = getParticipantName(conversation);
                const isSelected = selectedConversationId === conversation.conversation_id;

                return (
                  <div
                    key={conversation.conversation_id}
                    onClick={() => handleSelectConversation(conversation.conversation_id)}
                    className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AccountCircleIcon
                        sx={{
                          width: 40,
                          height: 40,
                          color: 'text.secondary',
                          flexShrink: 0,
                        }}
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {participantName}
                          </p>
                          <span className="ml-2 shrink-0 text-xs text-gray-500">
                            {formatTime(conversation.updated_time)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {conversation.last_message?.text || 'No messages'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Page Content (Flexible) */}
      {/* Right Panel - Page Content (Flexible, NOT scrollable) */}
<div className="flex min-w-0 flex-1 min-h-0 overflow-hidden">
  {children}
</div>


    </div>
  );
}
