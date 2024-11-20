import './App.css';
import { Login } from "./user/Login";
import React, { useEffect } from 'react';

import { Register } from "./user/Register";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserList } from './user/UserList';
import { RoomsList } from './user/RoomsList';
import { MessageChat } from './user/MessageChat';
import { GroupeChat } from './user/GroupeChat';
import Notifications from './user/Notifications'; // Importer Notifications

function App() {
  window.Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log("Notifications autorisées");
    } else {
      console.log("Notifications non autorisées");
    }
  });

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
  );
}

export default App;
