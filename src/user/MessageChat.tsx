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
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State type is File or null

  const fileInputRef = useRef<HTMLInputElement>(null);
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
  
    dispatch({
      type: 'messages/addMessage', 
      payload: newMessageObj,
    });
  
    // Clear input
    setNewMessage('');
  
    // Send the message
    await dispatch(sendMessage({
      receiverId: Number(userId),
      content: newMessageObj.content,
    }));
  };
  

  // Correctly type the event to be ChangeEvent<HTMLInputElement>
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0]; // Get the first selected file
      setSelectedFile(file); // Set the selected file in state

      // Trigger image upload automatically when file is selected
      await handleUploadImage(file); 
    }
  };

  const handleUploadImage = async (file: File) => {
    if (file) {
      await dispatch(uploadImageMessage({ file, receiverId: Number(userId),receiverType:'user',content: newMessage.trim(), }));
      setSelectedFile(null);
      setNewMessage('');
    }
  };

  const handleFileButtonClick = () => {
    // Trigger the file input click programmatically when the button is clicked
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-1/4 bg-white border-r border-gray-300">
        {/* Sidebar */}
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
            <div>Erreur lors du chargement des messages</div>
          ) : (
            <ul className="space-y-4">
              {messages.map((message, index) => (
  <li
    key={message.message_id ? message.message_id : `message-${index}`}  // Fallback to index if message_id is missing
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
      {message.image_url ? (
        <img src={message.image_url} alt="Message attachment" className="max-w-xs max-h-60 rounded" />
      ) : (
        <p>{message.content}</p>
      )}
      <span className="text-xs text-gray-500">{message.timestamp}</span>
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
          
          {/* Hidden file input element */}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
            ref={fileInputRef} // Associate the ref with the input
          />
          
          {/* Button triggers the file input */}
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
