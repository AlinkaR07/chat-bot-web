import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined, BellOutlined, CloseOutlined, CheckOutlined } from "@ant-design/icons"
import { Avatar, Badge } from "antd";
import ReactDOM from 'react-dom';

import './css/NavBarAdmin.css'
import './css/AlertsModal.css'
import avatarChatbotLight from "../resours/avatar-chatbot-light.png"
import avatarChatbotDark from "../resours/avatar-chatbot-dark.png"
import ConfirmedUserModal from "./ConfirmedUserModal";


const ModalAlerts = ({ onClose, setIsOpenAlertsModal, alertsAll, users, number, setIsConfimUser, setEditingUser, setAlertId }) => {
    alertsAll.sort((a, b) => new Date(b.date_sending) - new Date(a.date_sending));
    const newAlerts = alertsAll.filter(alert => !alert.reading);
    const viewedAlerts = alertsAll.filter(alert => alert.reading).slice(0, 3);

    const handleIsConfirm = (item, id) => {
        setIsConfimUser(true);
        setEditingUser(item);
        setIsOpenAlertsModal(false);
        setAlertId(id);
    }

    const getNotificationTitle = (number) => {
        if (number === 1) {
          return `${number} новое уведомление`;
        } else if (number > 1 && number < 5) {
          return `${number} новых уведомления`;
        } else {
          return `${number} новых уведомлений`;
        }
      };

    return (
        <div className="div-modal-alerts">
            <div className="div-modal-alert">
                <div className="title-modal-alerts">
                    <div>Уведомления</div>
                    <CloseOutlined className="closeoutlined-overlay" onClick={onClose}/>
                </div>
                <div className="alert-list-admin">
                    <div className="alert-group">
                        {number !== 0 && <div className="alert-group-title">{getNotificationTitle(number)}</div>}
                        {newAlerts.map((alert, index) => {
                            const user = users.find(user => user.id === alert.user_id);
                            const userName = user ? user.name_user : 'Unknown User';
                            const userEmail = user ? user.email_user : 'Unknown User';
                            return (
                                <div key={index} className="alert-admin" onClick={() => handleIsConfirm(user, alert.id)}>
                                    <div className="date-user-alert">
                                        <span className="user-name-alert">{userName} ( {userEmail}) запрашивает подтверждение на регистрацию</span>
                                        <span className="date-alert">{new Date(alert.date_sending).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="alert-group">
                        <div className="alert-group-title">Просмотренные </div>
                        {viewedAlerts.map((alert, index) => {
                            const user = users.find(user => user.id === alert.user_id);
                            const userName = user ? user.name_user : 'Unknown User';
                            const userEmail = user ? user.email_user : 'Unknown User';
                            return (
                                <div key={index} className="alert-admin-reading">
                                    <div className="date-user-alert">
                                        <span className="user-name-alert-reading"><CheckOutlined className="icon-reading"/>{userName} ( {userEmail}) запрашивал(а) подтверждение на регистрацию</span>
                                        <span className="date-alert">{new Date(alert.date_sending).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};


const NavBarAdmin = ({isColorChanged}) => {
    const navigate = useNavigate();
    const [alertsAll, setAlertsAll] = useState([]);
    const [users, setUsers] = useState([]);
    const [alertsNoRead, setAlertsNoRead] = useState([]);
    const [isOpenAlertsModal, setIsOpenAlertsModal] = useState(false);
    const [isConfirmUser, setIsConfimUser] = useState(false);
    const [editingUser, setEditingUser] = useState([]);
    const [alertId, setAlertId] = useState("");
    const [number, setNumber] = useState("");

    const handleLogout = async () => {
        localStorage.removeItem('token');
        navigate("/");
    }

    const handleOpenAlertsModal = () => {
        setIsOpenAlertsModal(true);
    };

    useEffect(() => {
        /**
        * Get-запрос на получение чатов
        */
        const getAlert = async () => {
            const requestOptions = {
                method: 'GET'
            }
            return await fetch(`http://localhost:8000/alerts`, requestOptions)
                .then(response => response.json())
                    .then(
                        (data) => {
                            setAlertsNoRead(data.data.filter(alert => !alert.reading));
                            console.log('AlertsNoRead:', data.data.filter(alert => !alert.reading));
                            setAlertsAll(data.data);
                            setNumber(data.data.filter(alert => !alert.reading).length)
                            console.log('Alerts:', data.data);
                        },
                        (error) => {
                            console.log(error)   // Установить сообщения об ошибках
                        }
                    )
        }
        getAlert()
    }, [setAlertsAll, setAlertsNoRead, setNumber])

    useEffect(() => {
        /**
        * Get-запрос на получение пользователей
        */
        const getUsers = async () => {
            const requestOptions = {
                method: 'GET'
            }
            return await fetch(`http://localhost:8000/user`, requestOptions)
                .then(response => response.json())
                    .then(
                        (data) => {
                            console.log('Users:', data.data)
                            setUsers(data.data);
                        },
                        (error) => {
                            console.log(error)   // Установить сообщения об ошибках
                        }
                    )
        }
        getUsers()
    }, [setUsers])

    const closeModal = () => {
        setIsOpenAlertsModal(false);
    };

    return(
        <div className="nav-bar-admin">
            {isOpenAlertsModal && (
                ReactDOM.createPortal(
                    <ModalAlerts
                        onClose={closeModal}
                        setIsOpenAlertsModal={setIsOpenAlertsModal}
                        alertsAll={alertsAll}
                        users={users}
                        number={number}
                        setIsConfimUser={setIsConfimUser}
                        setEditingUser={setEditingUser}
                        setAlertId={setAlertId}
                    />,
                    document.body
                )
            )}
            <div className="logo-tab-admin">
                <div className="logo-tab-name">
                    <div>Panda-ОS</div>
                    <div className="direction">Административная панель</div>
                </div>
                <Avatar className="lapa-nav-bar1-admin" src={isColorChanged ? avatarChatbotDark : avatarChatbotLight} size={40}/>
                <Avatar className="lapa-nav-bar2-admin" src={isColorChanged ? avatarChatbotDark : avatarChatbotLight} size={40}/>
            </div>
            <div className="alerts-button">
                <Badge color="rgb(55, 131, 55)" count={number} size="small">
                    <BellOutlined className="bell" onClick={handleOpenAlertsModal}/>
                </Badge>
            </div>
            <div className="logout-tab-admin" onClick={handleLogout}>
                Выйти <LogoutOutlined />
            </div>
            <ConfirmedUserModal
                visible={isConfirmUser}
                setIsEditUser={setIsConfimUser}
                editingUser={editingUser}
                alertId={alertId}
                alertsAll={alertsAll}
                setAlertsAll={setAlertsAll}
                setNumber={setNumber}
            />
        </div>
    )
}

export default NavBarAdmin

