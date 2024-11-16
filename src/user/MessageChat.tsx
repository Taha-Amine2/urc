import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, addMessage } from '../slices/messagesSlice';
import { RootState, AppDispatch } from '../store';
import { useParams } from 'react-router-dom';
import { UserList } from './UserList';
import { RoomsList } from './RoomsList';

export const MessageChat = () => {
  const { userId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { list: messages, loading, error } = useSelector((state: RootState) => state.messages);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (userId) {
      dispatch(fetchMessages({ receiverId: Number(userId), receiverType: 'user' }));
    }
  }, [dispatch, userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      receiver_id: Number(userId),
      content: newMessage.trim(),
      sender_id: Number(sessionStorage.getItem('id')),
      receiver_type: "user",
    };

    const token = sessionStorage.getItem('token');
    
    try {
      const response = await axios.post('/api/messages', messageData);

      if (response.status === 200) {
        const sentMessage = response.data;
        dispatch(addMessage(sentMessage));
        setNewMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300">
        <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-indigo-600 text-white">
          <h1 className="text-2xl font-semibold">UBO Chat Relay</h1>
          <button id="menuButton" className="focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-100" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path d="M2 10a2 2 0 012-2h12a2 2 0 012 2 2 2 0 01-2 2H4a2 2 0 01-2-2z" />
            </svg>
          </button>
        </header>
        <div className="h-full flex flex-col w-[100%]">
          <UserList />
          <RoomsList />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col w-[80%]">
        <div className="flex-1 p-4 overflow-y-auto pb-24">
          {loading ? (
            <div>Chargement des messages...</div>
          ) : error ? (
            <div>Error lors du chargement des messages</div>
          ) : (
            <ul className="space-y-4">
              {messages.map((message) => (
                <li
                  key={message.message_id}
                  className={`flex ${
                    message.sender_id === Number(sessionStorage.getItem('id')) ? 'justify-end' : ''
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender_id === Number(sessionStorage.getItem('id'))
                        ? 'bg-blue-300 text-white'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="bg-white border-t border-gray-300 p-4 flex flex-row w-full justify-between">
          <textarea
            className="h-13 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[92%] resize-none"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={handleSendMessage} className="h-10 w-[6%] mt-2 py-2 bg-blue-500 text-white rounded-lg align-center">
            Send
          </button>
        </footer>
      </div>
    </div>
  );
};
