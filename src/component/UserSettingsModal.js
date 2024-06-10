import React, { useState, useEffect } from "react";
import { Modal, Tooltip, Tabs, Button } from "antd";
import { UserOutlined, CheckOutlined, ClockCircleOutlined, InfoOutlined, MessageOutlined } from "@ant-design/icons";

import './css/UserInfo.css'

const { TabPane } = Tabs;

const UserSettingsModal = ({ visible, onCancel, user, isColorChanged, setColorChanged, selectedChat }) => {
    const [isThemeChanged] = useState(localStorage.getItem('isThemeChanged') === false);
    const [isChecked, setChecked] = useState(isColorChanged);
    const [isCopyEmail, setIsCopyEmail] = useState(false);
    const [activeTab, setActiveTab] = useState('user');

    useEffect(() => {
        localStorage.setItem('isColorChanged', isColorChanged);
        localStorage.setItem('isThemeChanged', isThemeChanged);
    }, [isColorChanged, isThemeChanged]);

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

    const copyToEmailRaz = () => {
        navigator.clipboard.writeText("romachca2003@mail.ru");
        setIsCopyEmail(true);
        setTimeout(() => {
            setIsCopyEmail(false); 
        }, 2000);
    };

    const copyToEmailUser = () => {
        navigator.clipboard.writeText(user.email_user);
        setIsCopyEmail(true);
        setTimeout(() => {
            setIsCopyEmail(false); 
        }, 2000);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const truncateTitle = (title, maxLength) => {
        if (title.length > maxLength) {
            return title.substring(0, maxLength) + '...';
        } else {
            return title;
        }
    };

    return (
        <Modal
            className="new-chat-modal"
            title={<span style={{ color: 'var(--color1-color)', textAlign: 'left', display: 'block', fontSize: '2.2vh', marginLeft: '0.6vw' }}>Настройки</span>}
            open={visible}
            width={"40vw"}
            onCancel={onCancel}
            centered
            style={{ padding: "20px"}}
            footer={null}
        >
            <div className="line-header-settings"></div>
            <Tabs activeKey={activeTab} onChange={handleTabChange} tabPosition="left" style={{height:'35vh'}}>
                <TabPane tab={<span style={{fontSize: '1.5vh'}}>{truncateTitle("Информация о пользователе", 15)}</span>} key="user">
                    <div className="userinfo-settings-modal">
                        <div className="user-name-modal"><UserOutlined className="icon"/>Пользователь:<div className="user-name-value">{user.name_user}</div></div>
                        <div className="line-header-tabs"></div>
                        <div className="user-name-modal"><CheckOutlined className="icon"/>Логин/email:
                            <Tooltip style={{ userSelect: "none"}} title={isCopyEmail ? "Email скопирован" : "Скопировать email"} placement="right">
                                <div className="user-email-value" onClick={copyToEmailUser}>{user.email_user}</div>
                            </Tooltip>
                        </div>
                        <div className="line-header-tabs"></div>
                        <div className="user-name-modal"><InfoOutlined className="icon" style={{fontSize: '1.7vh'}}/>Статус:<div className="user-name-value">{user.status}</div></div>
                        <div className="line-header-tabs"></div>
                        <div className="user-name-modal"><ClockCircleOutlined className="icon"/>Дата регистрации:<div className="user-name-value">{new Date(user.date_registration).toLocaleDateString()}</div></div>
                        <div className="line-header-tabs"></div>
                        {user.status === 'Пользователь' && 
                        <>
                            <div className="user-chat-modal"><MessageOutlined className="icon"/>Активный чат: 
                                    <div className="user-chat-value">{selectedChat.chat_name}</div>
                            </div>
                            <div className="user-date-chat-modal">Дата создания:<div className="date-chat-value">{new Date(selectedChat.date_creating).toLocaleDateString()}</div></div>
                            <div className="line-header-tabs"></div>
                        </>
                        }
                    </div>
                </TabPane>
                <TabPane tab={<span style={{fontSize: '1.5vh'}}>{truncateTitle("Общие настройки", 15)}</span>} key="theme">
                        <div className="div-tema-modal">
                            <div className="settings-model-modal">Модель LLM</div>
                            <div className="settings-model-modal-value">llama-2-13b</div>
                        </div>
                        <div className="line-header-tabs"></div>
                        <div className="div-tema-modal">
                            <div className="settings-model-modal">Tемa</div>
                            <div className="container-switch-modal">
                                <label id="switch-modal-user" className="switch">
                                    <input type="checkbox" onChange={toggleTheme} id="slider" checked={isChecked}/>
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                        <div className="line-header-tabs"></div>
                        {user.status !== "Админ" &&
                        <div className="div-tema-modal">
                            <div className="settings-model-modal" style={{marginTop: '1vh'}}>Удалить все чаты</div>
                            <Button type="primary" danger className="settings-button-modal">Удалить</Button>
                        </div>
                        }
                        <div className="line-header-tabs"></div>
                </TabPane>
                <TabPane tab={<span style={{fontSize: '1.5vh'}}>{truncateTitle("Обратная связь", 15)}</span>} key="feedback">
                    <div className="userinfo-settings-modal">
                        <div className="user-name-raz" onClick={copyToEmailRaz}>Оставить отзыв, внести предложения или сообщить об ошибках вы можете, отправив письмо на электронную почту:</div>
                        <Tooltip style={{ userSelect: "none"}} title={isCopyEmail ? "Email скопирован" : "Скопировать email"} placement="right">
                            <div className="user-email-raz" onClick={copyToEmailRaz}>romachca2003@mail.ru</div>
                        </Tooltip>
                        <div className="user-name-raz" onClick={copyToEmailRaz}>Мы ценим ваше мнение и всегда готовы выслушать ваши комментарии!</div>
                    </div>
                </TabPane>
            </Tabs>
        </Modal>
    );
};

export default UserSettingsModal;
