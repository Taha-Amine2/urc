import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage, uploadImageMessage } from '../slices/messagesSlice';
import { RootState, AppDispatch } from '../store';
import { useNavigate, useParams } from 'react-router-dom';
import { UserList } from '../user/UserList';
import { RoomsList } from '../rooms/RoomsList';

export const MessageChat = () => {
  const { userId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { list: messages, loading, error } = useSelector((state: RootState) => state.messages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate(); 

  useEffect(() => {
    if (userId) {
      dispatch(fetchMessages({ receiverId: Number(userId), receiverType: 'user' }));
    }

    const sw = navigator.serviceWorker;
    if (sw != null) {
      sw.onmessage = (event) => {
        console.log("Got event from sw: " + JSON.stringify(event.data));
        dispatch(fetchMessages({ receiverId: Number(userId), receiverType: 'user' }));
      };
    }
  }, [dispatch, userId]);

  const handleLogout = () => {
    sessionStorage.clear(); // Clear session storage
    navigate('/'); // Rediriger vers la racine
  };

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
    <div className="flex h-screen w-screen overflow-y-hidden">
      <div className="w-1/4 bg-white border-r border-gray-300 sticky top-0">
        <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-black text-white ">
          <h1 className="text-2xl font-semibold">UBO Chat Relay</h1>
          <button
        onClick={handleLogout}
        className="flex items-center gap-2  hover:bg-gray-400 hover:text-black text-white py-2 px-4 rounded transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
          />
        </svg>
        Déconnexion
      </button>
        </header>
        <div className="flex flex-col w-[100%] h-full">
  {/* Section pour "Utilisateurs" */}
  <div className="p-4 text-xl font-semibold flex-shrink-0 text-center">Utilisateurs</div>
  <div className="flex-1 overflow-y-auto">
    <UserList />
  </div>

  {/* Section pour "Groupes" */}
  <div className="p-4 text-xl font-semibold flex-shrink-0 text-center">Groupes</div>
  <div className="flex-1 overflow-y-auto">
    <RoomsList />
  </div>
</div>
</div>
      <div className="flex flex-col w-[80%] sticky top-0">
        <div className="flex-1 p-4 overflow-y-auto h-screen">
          {!userId ? (
    // Affichage du message lorsque userId est vide
    <div className="flex items-center justify-center h-full text-gray-500 text-xl">
      Sélectionnez une conversation pour commencer
    </div>
  ) :(
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
            placeholder="Ecrire un message..."
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
            Envoyer
          </button>
        </footer>
      </div>
    </div>
  );
};
