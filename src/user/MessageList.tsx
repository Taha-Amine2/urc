// MessageList.tsx
import React from 'react';
import { Message } from '../model/common';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message: Message) => (
        <div key={message.message_id} className="message-item">
          <strong>{message.sender}</strong>: {message.content}
        </div>
      ))}
    </div>
  );
};
