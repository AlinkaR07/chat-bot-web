import React, { useState } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import { AuthProvider } from "./contexts/AuthConstext"

import Login from "./component/Login";
import Home from "./component/Home";
// import Chats from "./component/Chats";

function App() {
  const [user, setUser] = useState([]);


  return (
    <div style={{ fontFamily: 'Awenir'}}>
      <Router>
          <Routes>
            <Route path="/" element={<Login user={user} setUser={setUser}/>}/>
            <Route path="/home" element={<Home user={user}/>}/>
          </Routes>
      </Router>
    </div>
  );
}

export default App;
