import './App.css';
import {Login} from "./user/Login";
import {Register} from "./user/Register";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { UserList } from './user/UserList';
import { RoomsList } from './user/RoomsList';
import { MessageChat } from './user/MessageChat';


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
          <Route path="/register" element={<Register />} /> 
          <Route path="/users" element={<UserList />} /> 
          <Route path="/rooms" element={<RoomsList />} /> 
          <Route path="/messages/user/:userId" element={<MessageChat />} />
          <Route path="/messages/" element={<MessageChat />} />
        </Routes>
      </Router>
  );
}

export default App;
