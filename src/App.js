import './App.css';
import {Login} from "./user/Login";
import {Register} from "./user/Register";
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {

  return (
      <Router>
         <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register />} /> 
        </Routes>
      </Router>
  );
}

export default App;
