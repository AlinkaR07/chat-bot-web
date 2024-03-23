import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {LoadingOutlined} from "@ant-design/icons"

import Login from "./component/Login";
import Home from "./component/Home";


import './App.css'
import noMessagesImageLight from "./resours/panda-light.png"


function App() {
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserInfo(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const userResponse = await fetch(`http://localhost:8000/user_auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("Userdata:", userData);
        setUser(userData);
      } else {
        throw new Error('Ошибка получения информации о пользователе');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="div-loading">
              <img style={{marginTop: "30px", width: "5vw", height: "10vh"}} src={noMessagesImageLight} alt="No messages" />
              <div>
                <LoadingOutlined style={{ fontSize: 24, marginRight: 8, color: '#072E70'}} />
                Loading...
              </div>
            </div>;
  }

  return (
    <div>
      <Router>
          <Routes>
            <Route path="/" element={<Login user={user} setUser={setUser}/>}/>
            {user &&
              <Route path="/home" element={<Home user={user}/>}/>
            }
          </Routes>
      </Router>
    </div>
  );
}

export default App;
