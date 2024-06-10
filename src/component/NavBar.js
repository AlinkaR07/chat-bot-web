import React from "react";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined} from "@ant-design/icons"
import { Avatar } from "antd";

import './css/NavBar.css'
import avatarChatbotLight from "../resours/avatar-chatbot-light.png"
import avatarChatbotDark from "../resours/avatar-chatbot-dark.png"

const NavBar = ({isColorChanged}) => {
    const navigate = useNavigate();


    const handleLogout = async () => {
        localStorage.removeItem('token');
        navigate("/");
    }

    return(
        <div className="nav-bar">
            <div className="logo-tab">Panda-ОS
                <Avatar className="lapa-nav-bar1" src={isColorChanged ? avatarChatbotDark : avatarChatbotLight} size={40}/>
                <Avatar className="lapa-nav-bar2" src={isColorChanged ? avatarChatbotDark : avatarChatbotLight} size={40}/>
            </div>
            <div className="logout-tab" onClick={handleLogout}>
                Выйти <LogoutOutlined />
            </div>
        </div>
    )
}

export default NavBar

