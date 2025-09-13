import { Message } from '../../../../src/lib/api-client';

export const hasUnreadMessages = (messages: Message[]) =>
  messages.some(m => !m.isRead);

export const filterUnread = (messages: Message[]) =>
  messages.filter(m => !m.isRead);
