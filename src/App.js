import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import { AuthProvider } from "./contexts/AuthConstext"

import Login from "./component/Login";
import Home from "./component/Home";
// import Chats from "./component/Chats";

function App() {
  return (
    <div style={{ fontFamily: 'Awenir'}}>
      <Router>
          <Routes>
            <Route path="/" Component={Login}/>
            <Route path="/home" Component={Home}/>
          </Routes>
      </Router>
    </div>
  );
}

export default App;
