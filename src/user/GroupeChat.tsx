import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessagesGrp, uploadImageMessage, addMessage } from '../slices/messagesSlice';
import { RootState, AppDispatch } from '../store';
import { useParams } from 'react-router-dom';
import { UserList } from './UserList';
import { RoomsList } from './RoomsList';

export const GroupeChat = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { listgrp: messages, loading, error } = useSelector((state: RootState) => state.messages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedRoomId = Number(roomId);

  useEffect(() => {
    if (!isNaN(parsedRoomId)) {
      dispatch(fetchMessagesGrp({ receiverId: parsedRoomId, receiverType: 'group' }));
    } else {
      console.error('Invalid room ID:', roomId);
    }
  }, [dispatch, parsedRoomId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      receiver_id: parsedRoomId,
      image_url: '',
      content: newMessage.trim(),
      sender_id: Number(sessionStorage.getItem('id')),
      receiver_type: 'group',
    };

    const token = sessionStorage.getItem('token');
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Authentication': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (response.ok) {
      const sentMessage = await response.json();
      dispatch(addMessage(sentMessage));
      setNewMessage('');
      dispatch(fetchMessagesGrp({ receiverId: parsedRoomId, receiverType: 'group' }));
    } else {
      console.error('Failed to send message');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setSelectedFile(file);
      await handleUploadImage(file);
    }
  };

  const handleUploadImage = async (file: File) => {
    if (file) {
      await dispatch(uploadImageMessage({ file, receiverId: parsedRoomId, receiverType: 'group' }));
      setSelectedFile(null);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300">
        <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-indigo-600 text-white">
          <h1 className="text-2xl font-semibold">UBO Chat Relay</h1>
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
                <li key={message.message_id} className={`flex ${message.sender_id === Number(sessionStorage.getItem('id')) ? 'justify-end' : ''}`}>
                  <div className={`p-3 rounded-lg ${message.sender_id === Number(sessionStorage.getItem('id')) ? 'bg-blue-300 text-white' : 'bg-gray-200 text-black'}`}>
                    {message.image_url ? (
                      <img src={message.image_url} alt="Attachment" className="max-w-xs max-h-60 rounded" />
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <span className="text-xs text-gray-500">{message.sender_name} {message.timestamp}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="bg-white border-t border-gray-300 p-4 flex items-center w-full justify-between">
          <textarea
            className="h-13 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[70%] resize-none"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />

          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button onClick={handleFileButtonClick} className="bg-blue-500 text-white rounded-lg px-4 py-2 ml-2">
            Upload Image
          </button>

          <button onClick={handleSendMessage} className="bg-green-500 text-white rounded-lg px-4 py-2 ml-2">
            Send
          </button>
        </footer>
      </div>
    </div>
  );
};
