import React from "react";

import './css/SideBar.css'
import UserInfoAdmin from './UserInfoAdmin';

const SidebarAdmin = ({selectedItem, setSelectedItem, user, isColorChanged, setColorChanged}) => {

    const handleChatClick = (item) => {
        setSelectedItem(item);
        console.log("Открываем пункт меню:", item);
    };
      
    return (
        <div className="side-bar">
            <div className="chat-list-admin">
                <div className={`chat-item-admin ${selectedItem === "statistic" ? "selected-chat-admin" : ""}`} onClick={() => handleChatClick("statistic")}>Статистика</div>
                <div className={`chat-item-admin ${selectedItem === "users" ? "selected-chat-admin" : ""}`} onClick={() => handleChatClick("users")}>Пользователи</div>
                <div className={`chat-item-admin ${selectedItem === "chaty" ? "selected-chat-admin" : ""}`} onClick={() => handleChatClick("chaty")}>Чаты</div>
            </div>
            <div className="line-header"></div>
            <UserInfoAdmin isColorChanged={isColorChanged} selectedItem={selectedItem} setColorChanged={setColorChanged} user={user} />
        </div>
    );
}

export default SidebarAdmin;