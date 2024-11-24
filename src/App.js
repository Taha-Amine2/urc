import './App.css';
import { Login } from "./user/Login.tsx";
import React, { useEffect } from 'react';

import { Register } from "./user/Register.tsx";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserList } from './user/UserList.tsx';
import { RoomsList } from './rooms/RoomsList.tsx';
import { MessageChat } from './chat/MessageChat.tsx';
import { GroupeChat } from './chat/GroupeChat.tsx';
import Notifications from './Notifications.js'; // Importer Notifications
import { fetchMessages, fetchMessagesGrp } from './slices/messagesSlice.ts';
import { useDispatch } from 'react-redux';

function App() {
  window.Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log("Notifications autorisées");
    } else {
      console.log("Notifications non autorisées");
    }
  });


  return (
    <Notifications> 
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/rooms" element={<RoomsList />} />
          <Route path="/messages/user/:userId" element={<MessageChat />} />
          <Route path="/messages/room/:roomId" element={<GroupeChat />} />
          <Route path="/messages/" element={<MessageChat />} />
        </Routes>
      </Router>
    </Notifications>
  );
}

export default App;
