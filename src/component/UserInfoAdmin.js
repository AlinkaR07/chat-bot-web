import React, { useState, useEffect } from "react";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar } from 'antd';

import './css/UserInfoAdmin.css'
import useThemeStyles from "./css/useThemeStyles";
import UserSettingsModal from "./UserSettingsModal";


const UserInfoAdmin = ({isColorChanged, selectedChat, setColorChanged, user}) => {
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
        <div className="info-admin-user">
            <div className="info-admin">
                <div className="user-avatar-admin"><Avatar className="avatar-admin" icon={<UserOutlined />}/></div>
                <div className="name-admin">
                    <div className="user-name-admin">{user.name_user}</div>
                    <div className="user-email-admin">{user.email_user}</div>
                </div>
                <div className="button-open-settings-admin" onClick={openSettings}><SettingOutlined /></div>
            </div>
            <UserSettingsModal
                visible={isSettings}
                onCancel={handleCancelSettings}
                user={user}
                isColorChanged={isColorChanged}
                setColorChanged={setColorChanged}
            />
        </div>
        
        )
}

export default UserInfoAdmin
