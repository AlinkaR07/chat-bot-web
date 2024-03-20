import React, { useState, useEffect } from "react";
import UserAvatar from "./UserAvatar";
import { SettingOutlined } from "@ant-design/icons";
import { Cascader } from "antd"; 

import './css/UserInfo.css'
import useThemeStyles from "./css/useThemeStyles";

let type_nn = [];

const UserInfo = ({isColorChanged, setColorChanged, user}) => {
    const [isSettings, setIsSettings] = useState(false);

    const [isThemeChanged] = useState(localStorage.getItem('isThemeChanged') === false);
    const [isChecked, setChecked] = useState(isColorChanged);
    const [selectedModel, setSelectedModel] = useState(0);

    useThemeStyles(isColorChanged);

    useEffect(() => {
        localStorage.setItem('isColorChanged', isColorChanged);
        localStorage.setItem('isThemeChanged', isThemeChanged);
    }, [isColorChanged, isThemeChanged]);

    useEffect(() => {
        const getTypeNn = async () => {
                /**
                  * определение параметров запроса
                */
            const requestOptions = {
                method: 'GET'
            }

                 /**
                  * отправка GET-запроса на сервер
                */
            return await fetch("http://localhost:8000/type_nn", requestOptions)
                .then(response => response.json())
                .then(
                    (data) => {
                        console.log('Type_nn:', data)
                        for (var i = 0; i < data.data.length; i++) {
                            type_nn[i]=[];
                            for (var j = 0; j < 1; j++) {
                                type_nn[i].value = data.data[i].id;
                                type_nn[i].label = data.data[i].name_nn;
                            }
                        }
                    },
                    (error) => {
                        console.log(error)   // Установить сообщения об ошибках
                    }
                )
        }
        getTypeNn()})
    

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
        setSelectedModel(value[0] - 1);
        console.log(value[0] - 1)
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
                        <Cascader className="cascader-models" size="middle" options={type_nn} dropdownStyle={{ maxHeight: "70px" }} value={type_nn[selectedModel].label} onChange={handleCascaderChange}></Cascader>

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
