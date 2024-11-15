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

  useEffect(() => {
    // Assurez-vous que le service worker est disponible
    if ('serviceWorker' in navigator) {
      const sw = navigator.serviceWorker;

      // Écouter le message envoyé depuis le service worker
      sw.onmessage = (event) => {
        console.log('Got event from SW:', event.data);

        // Vous pouvez traiter le message ici. Par exemple, vous pouvez afficher un toast, une alerte ou mettre à jour l'état
        const { title, message } = event.data;  // Assurez-vous que `event.data` contient les bonnes informations
        alert(`New Notification: ${title} - ${message}`);
      };
    }
  }, []);
  return (
    <Notifications> {/* Notifications doit envelopper toute l'application */}
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
