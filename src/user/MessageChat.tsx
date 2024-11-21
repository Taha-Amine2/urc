import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage, uploadImageMessage } from '../slices/messagesSlice';
import { RootState, AppDispatch } from '../store';
import { useParams } from 'react-router-dom';
import { UserList } from './UserList';
import { RoomsList } from './RoomsList';

export const MessageChat = () => {
  const { userId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { list: messages, loading, error } = useSelector((state: RootState) => state.messages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchMessages({ receiverId: Number(userId), receiverType: 'user' }));
    }
  }, [dispatch, userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const newMessageObj = {
      message_id: Date.now(),
      sender_id: Number(sessionStorage.getItem('id')),
      receiver_id: Number(userId),
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      image_url: null,
    };

    setNewMessage('');

    await dispatch(sendMessage({
      receiverId: Number(userId),
      content: newMessageObj.content,
    }));
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
      const messageimage = newMessage.trim() === '' ? 'IMAGE' : newMessage.trim();
      await dispatch(uploadImageMessage({ file, receiverId: Number(userId), receiverType: 'user', content: messageimage }));
      setSelectedFile(null);
      setNewMessage('');
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-1/4 bg-white border-r border-gray-300">
        <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-black text-white">
          <h1 className="text-2xl font-semibold">UBO Chat Relay</h1>
        </header>
        <div className="flex flex-col w-[100%]">
          <div className="p-4 text-xl font-semibold">Utilisateurs</div>
          <UserList />
          <div className="p-4 text-xl font-semibold">Groupes</div>
          <RoomsList />
        </div>
      </div>

      <div className="flex flex-col w-[80%]">
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black border-solid"></div>

              <div className="text-center">
                <p className="mt-4 ml-5 text-slate-600 text-lg font-semibold">Chargement des messages...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <p className="text-red-500 text-lg font-semibold">Erreur lors du chargement des messages</p>
                <p className="text-gray-500 text-sm">Veuillez réessayer plus tard.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {messages.map((message, index) => (
                <li
                  key={message.message_id ? message.message_id : `message-${index}`}
                  className={`flex ${message.sender_id === Number(sessionStorage.getItem('id')) ? 'justify-end' : ''}`}
                >
                  <div
                    className={`p-3 rounded-lg ${message.sender_id === Number(sessionStorage.getItem('id')) ? 'bg-slate-700 text-white' : 'bg-gray-200 text-black'}`}
                  >
                    {message.image_url ? (
                      <img src={message.image_url} alt="Message attachment" className="max-w-xs max-h-60 rounded" />
                    ) : (
                      <p>{message.content}</p>
                    )}
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>

                  {index === messages.length - 1 && <div ref={scrollRef} />}
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="bg-white border-t border-gray-300 p-4 flex items-center w-full justify-between">
          <textarea
            className="h-13 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-[84%] resize-none"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />

          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
            ref={fileInputRef}
          />

          <button onClick={handleFileButtonClick} className="bg-black text-white rounded-lg px-4 py-2 ml-2 w-[10%]">
            Upload Image
          </button>

          <button onClick={handleSendMessage} className="bg-green-500 text-white rounded-lg px-4 py-2 ml-2 w-[6%]">
            Send
          </button>
        </footer>
      </div>
    </div>
  );
};
