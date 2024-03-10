import React from "react";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined} from "@ant-design/icons"
import { Avatar } from "antd";

import './css/NavBar.css'
import avatarChatbot from "../resours/avatar-chatbot-light.png"

const NavBar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        navigate("/");
    }

    return(
        <div className="nav-bar">
            <div className="logo-tab">Chat bot
                <Avatar className="lapa-nav-bar1" src={avatarChatbot} size={40}><img src={avatarChatbot}/></Avatar>
                <Avatar className="lapa-nav-bar2" src={avatarChatbot} size={35}><img src={avatarChatbot}/></Avatar>
                <Avatar className="lapa-nav-bar3" src={avatarChatbot} size={37}><img src={avatarChatbot}/></Avatar>
            </div>
            <div className="logout-tab" onClick={handleLogout}>
                Выйти <LogoutOutlined />
            </div>
        </div>
    )
}

export default NavBar

