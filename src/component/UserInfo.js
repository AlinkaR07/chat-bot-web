import React, { useState, useEffect } from "react";
import UserAvatar from "./UserAvatar";
import { SettingOutlined } from "@ant-design/icons";

import './css/UserInfo.css'
import useThemeStyles from "./css/useThemeStyles";


// Компонент для каскадного меню
const CustomCascader = ({ options, value, onChange }) => {
    console.log("options", options)
    return (
        <select className="cascader-models" value={value} onChange={(e) => onChange([e.target.value])}>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    );
}

const UserInfo = ({isColorChanged, setColorChanged, user}) => {
    const [isSettings, setIsSettings] = useState(false);

    const [isThemeChanged] = useState(localStorage.getItem('isThemeChanged') === false);
    const [isChecked, setChecked] = useState(isColorChanged);
    const [selectedModel, setSelectedModel] = useState(0);
    const [type_nn, setTypeNn] = useState([]);

    useThemeStyles(isColorChanged);

    useEffect(() => {
        localStorage.setItem('isColorChanged', isColorChanged);
        localStorage.setItem('isThemeChanged', isThemeChanged);
    }, [isColorChanged, isThemeChanged]);

    useEffect(() => {
        console.log("Type_nn:", selectedModel);
    }, [selectedModel]);

    useEffect(() => {
        const getTypeNn = async () => {
            const requestOptions = {
                method: 'GET'
            }
    
            try {
                const response = await fetch("http://localhost:8000/type_nn", requestOptions);
                const data = await response.json();
                console.log('Type_nn:', data)
                setTypeNn(data.data.map(item => ({ value: item.id, label: item.name_nn })));
            } catch (error) {
                console.log(error);
            }
        }
    
        getTypeNn();
    }, []);
    

    const openSettings = () => {
        setIsSettings(!isSettings);
    }

    function setTheme(themeName) {
        localStorage.setItem('theme', themeName);
        document.documentElement.className = themeName;
    }

    const toggleTheme = () => {
        if (isThemeChanged) {
            setTheme('dark'); // Устанавливаем темную тему
        } else {
            setTheme('light'); // Устанавливаем светлую тему
        }
        setColorChanged(!isColorChanged); // Инвертируем значение isColorChanged
        setChecked(!isColorChanged); // Инвертируем значение isChecked
    };

        
    const handleCascaderChange = (value) => {
        console.log(value);
        setSelectedModel(value[0]);
    }

    return(
            <div className="user-info">
                <div className="user-avatar"><UserAvatar/></div>
                <div className="user-name">{user.name_user}</div>
                <div className="user-email">{user.email_user}</div>
                <div className="line"></div>
                {isSettings &&
                    <>
                        <div className="settings-model">Выберите модель нейросети:</div>
                        <CustomCascader options={type_nn} onChange={handleCascaderChange} />

                        <div className="settings-model">Выберите тему:</div>
                        <div className="container-switch">
                                <label id="switch" className="switch">
                                    <input type="checkbox" onChange={toggleTheme} id="slider" checked={isChecked}/>
                                    <span className="slider round"></span>
                                </label>
                        </div>
                    </>
                }

                <div className="button-open-settings" onClick={openSettings}><SettingOutlined /> Настройки</div>
            </div>
            
    )
}

export default UserInfo
