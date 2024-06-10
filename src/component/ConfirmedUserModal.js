import React, { useState, useEffect } from "react";
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Modal, Input, Switch, message } from "antd";

import './css/NewChatModal.css'

const CustomCascader = ({ options, value, onChange }) => {
  return (
      <select className="cascader-models-status-user-edit" value={value} onChange={(e) => onChange([e.target.value])}>
          {options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
          ))}
      </select>
  );
}

const status_user = [
    {
      value: '1',
      label: 'Пользователь',
    },
    {
      value: '2',
      label: 'Админ',
    },
];

const ConfirmedUserModal = ({ visible, setIsEditUser, editingUser, alertId, alertsAll, setAlertsAll, setNumber }) => {
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("1");

  useEffect(() => {
    if (editingUser !== null) {
        setNewUserName(editingUser.name_user || "");
        setNewUserEmail(editingUser.email_user || "");
        if (editingUser.status !== undefined) {
          if (editingUser.status[0].status === 'Пользователь'){
            setSelectedStatus("1");
          }
          else if (editingUser.status[0].status === 'Админ'){
            setSelectedStatus("2");
          }
        }
    }
  }, [editingUser]);


  const handleCascaderChange = (value) => {
    console.log(value[0]);
    setSelectedStatus(value[0]);
  }

  const handleCancelEditUser = async () => {
    let chatId;
    const deleteUser = async () => {
        const requestOptions = {
            method: 'GET'
        };

        try {
            // Получаем список чатов
            const chatResponse = await fetch(`http://localhost:8000/chats/user/${editingUser.id}`, requestOptions);
            if (!chatResponse.ok) {
                throw new Error('Failed to fetch chats');
            }
            const chatData = await chatResponse.json();
            console.log('Чат пользователя при подтверждении регистрации:', chatData.data[0]);
            chatId=chatData.data[0].id;
        } catch (error) {
            console.error('Error fetching chats:', error);
        }

    const requestOptionsChatDelete = {
        method: 'DELETE'
    };
    try {
        const response = await fetch(`http://localhost:8000/chats/${chatId}`, requestOptionsChatDelete);
        if (response.ok) {
            console.log("Удален чат с ID:", chatId);
        } else {
            throw new Error("Ошибка при удалении чата");
        }
    } catch (error) {
        console.error('Ошибка удаления чата:', error);
    }

    const requestOptionsAlert = {
      method: 'DELETE'
    };
    try {
        const response = await fetch(`http://localhost:8000/alerts/${alertId}`, requestOptionsAlert);
        if (response.ok) {
            console.log("Удалено уведомление с ID:", alertId);
            setAlertsAll(alertsAll.filter(alert => alert.id !== alertId)); 
            setNumber(prevNumber => prevNumber - 1);
        } else {
            throw new Error("Ошибка при удалении уведомления");
        }
    } catch (error) {
        console.error('Ошибка удаления уведомления:', error);
    }

    const requestOptionsUser = {
      method: 'DELETE'
    };
    try {
        const response = await fetch(`http://localhost:8000/user/${editingUser.id}`, requestOptionsUser);
        if (response.ok) {
            console.log("Удален пользователь с ID:", editingUser.id);
        } else {
            throw new Error("Ошибка при удалении пользователя");
        }
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
    }
  };
  deleteUser();
    setIsEditUser(false);
  };


  const handleSaveEditUser = async () => {
    if (newUserName.trim() !== "" && newUserEmail.trim() !== "" && selectedStatus !== null) {
        let status_user;
        if (selectedStatus) {
            if (selectedStatus === '1'){
                console.log("Выбранный статус для пользователя:", selectedStatus)
                status_user = 'Пользователь';
            }
            else if (selectedStatus === '2'){
                console.log("Выбранный статус для пользователя:", selectedStatus)
                status_user = 'Админ';
            }
        }

        const newEditUser = {
            name_user: editingUser.name_user,
            email_user: editingUser.email_user,
            photo: "string",
            date_registration: formatDateDash(editingUser.date_registration),
            date_lastAuth: null, 
            status: status_user,
            bloking: editingUser.bloking,
            password: editingUser.password,
            confirmed: true,
        };

        console.log("updatePUTConfirm", newEditUser);

            const update = async () => {
                /**
                 * определение параметров запроса
                 */
                const requestOptions = {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                      "name_user": newEditUser["name_user"],
                      "password": newEditUser["password"],
                      "email_user": newEditUser["email_user"],
                      "photo": newEditUser['photo'],
                      "date_registration": newEditUser["date_registration"],
                      "date_lastAuth": newEditUser["date_lastAuth"],
                      "status": newEditUser["status"],
                      "bloking": newEditUser["bloking"],
                      "confirmed": true,
                  }),
              }      
              /**
               * отправка PUT-запроса на сервер
               */
                const url = "http://localhost:8000/user/" + editingUser.id;
                console.log("url", url)
                return await  fetch(url, requestOptions)
                    .then(response => response.json())
                            .then(
                                (data) => {
                              console.log(data);
                              setIsEditUser(false);
                            },
                            (error) => console.log(error)  // Установить сообщения об ошибках
                        )
                }
                update().then(() => {
                    const editAlert = {
                      date_sending: new Date().toISOString(),
                      reading: true,
                    }

                    console.log("updateAlert", editAlert);

                    const update = async () => {
                      /**
                       * определение параметров запроса
                       */
                      const requestOptions = {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "date_sending": editAlert["date_sending"],
                            "reading": editAlert["reading"],
                        }),
                    }      
                    /**
                     * отправка PUT-запроса на сервер
                     */
                      const url = "http://localhost:8000/alerts/" + alertId;
                      return await  fetch(url, requestOptions)
                          .then(response => response.json())
                                  .then(
                                      (data) => {
                                      console.log('Измененные данные об уведомлении:', data.data)
                                      const updatedAlerts = alertsAll.map(alert => {
                                        if (alert.id === data.data.id) {
                                            alert.id = data.data.id;
                                            alert.date_sending = data.data.date_sending;
                                            alert.reading = data.data.reading;
                                            alert.user_id = alert.user_id;
                                            return alert;
                                        }
                                        return alert;
                                    });
                                    console.log("Обновленный список уведомлений:", updatedAlerts);
                                    setAlertsAll(updatedAlerts);
                                    setNumber(prevNumber => prevNumber - 1);
                                  },
                                  (error) => console.log(error)  // Установить сообщения об ошибках
                              )
                      }
                       update()
                })
        }
  };

  const formatDateDash = (date) => {
    if(date !== null && date !== undefined){
      const parts = date.split('.');
      const reconstructedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      const day = String(reconstructedDate.getDate()).padStart(2, '0');
      const month = String(reconstructedDate.getMonth() + 1).padStart(2, '0');
      const year = reconstructedDate.getFullYear();
      return `${year}-${month}-${day}`;
    }
  };

  return (
    <Modal
      className="new-chat-modal"
      title={<span style={{ color: 'var(--color6-color)', textAlign: 'center', display: 'block', fontSize: '3vh', userSelect: 'none' }}>Подтверждение регистрации</span>}
      open={visible}
      width={"35vw"}
      onOk={handleSaveEditUser}
      onCancel={handleCancelEditUser}
      centered
      style={{ padding: "10px"}}
      okButtonProps={{ style: { backgroundColor: 'var(--color1-color)', borderColor: 'var(--color1-color)' } }}
      cancelText="Отклонить"
      okText="Подтвердить" 
      closeIcon={null}
    >
      <div className="new-model-user">Фамилия и имя:</div>
      <Input
        className="new-user"
        placeholder="Фамилия и имя пользователя"
        value={newUserName}
        disabled 
      />
      <div className="new-model-user">Электронную почта:</div>
      <Input
        className="new-user"
        placeholder="Электронная почта пользователя"
        value={newUserEmail}
        disabled 
      />
      <div className="new-model-user">Выберите статус:</div>
      <CustomCascader options={status_user} value={selectedStatus} onChange={handleCascaderChange} />
    </Modal>
  );
};

export default ConfirmedUserModal;
