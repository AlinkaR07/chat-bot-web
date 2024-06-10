import React, { useState, useEffect } from "react";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar } from 'antd';

import './css/UserInfo.css'
import useThemeStyles from "./css/useThemeStyles";
import UserSettingsModal from "./UserSettingsModal";


const UserInfo = ({isColorChanged, selectedChat, setColorChanged, user}) => {
    const [isSettings, setIsSettings] = useState(false);
    const [isThemeChanged] = useState(localStorage.getItem('isThemeChanged') === false);
    

    useThemeStyles(isColorChanged);

    useEffect(() => {
        localStorage.setItem('isColorChanged', isColorChanged);
        localStorage.setItem('isThemeChanged', isThemeChanged);
    }, [isColorChanged, isThemeChanged]);

    const openSettings = () => {
        setIsSettings(!isSettings);
    }

    const handleCancelSettings = () => {
        setIsSettings(false);
    };
            
    return(
            <div className="info-user">
                <div className="info">
                    <div className="user-avatar"><Avatar className="avatar" icon={<UserOutlined />}/></div>
                    <div className="name">
                        <div className="user-name">{user.name_user}</div>
                        <div className="user-email">{user.email_user}</div>
                    </div>
                    <div className="button-open-settings" onClick={openSettings}><SettingOutlined /></div>
                </div>
                <UserSettingsModal
                    visible={isSettings}
                    onCancel={handleCancelSettings}
                    user={user}
                    isColorChanged={isColorChanged}
                    setColorChanged={setColorChanged}
                    selectedChat={selectedChat}
                />
            </div>
            
    )
}

export default UserInfo
