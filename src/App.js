import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { Spin } from "antd";

import Login from "./component/Login";
import Home from "./component/Home";
import Admin from "./component/Admin"


import './App.css'
import noMessagesImageLight from "./resours/panda-light.png"


function App() {
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isColorChanged, setColorChanged] = useState(localStorage.getItem('isColorChanged') === 'true');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token !== "undefined") {
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
                <Spin style={{ fontSize: 24, marginRight: 8, color: '#072E70'}} />
                  Загрузка...
              </div>
            </div>;
  }

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />}/>
          {user.email_user === 'admin@mail.ru' ? (
            <Route path="/admin" element={<Admin user={user} isColorChanged={isColorChanged} setColorChanged={setColorChanged}/>} />
          ) : (
            <Route path="/home" element={<Home user={user} isColorChanged={isColorChanged} setColorChanged={setColorChanged}/>} />
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
