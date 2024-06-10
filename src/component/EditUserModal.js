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

const EditUserModal = ({ visible, setIsEditUser, editingUser, setFilteredUsers, handleApplayFilter, filteredUsers }) => {
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [validEmail, setValidEmail] = useState(true);

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
        setEditUserPassword(editingUser.password);
    }
  }, [editingUser]);


  const handleInputChangeName = (e) => {
    setNewUserName(e.target.value);
  };

  const handleInputChangeEmail = (e) => {
    setNewUserEmail(e.target.value);
    setValidEmail(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setValidEmail(emailRegex.test(e.target.value));
  };

  const handleCascaderChange = (value) => {
    console.log(value[0]);
    setSelectedStatus(value[0]);
  }

  const handleCancelEditUser = () => {
    setIsEditUser(false);
    setNewUserName("");
    setNewUserEmail("");
    setSelectedStatus("1");
    setIsPasswordReset(false);
  };

  const handlePasswordResetChange = (checked) => {
    setIsPasswordReset(checked);
    if(checked === true){
      setEditUserPassword(null);
    }
    else if(checked === false){
      setEditUserPassword(editingUser.password);
    }
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

        let date_last;
        if(editingUser.date_lastAuth === undefined){
          date_last = null;
        }
        else date_last = formatDateDash(editingUser.date_lastAuth);

        const newEditUser = {
            name_user: newUserName,
            email_user: newUserEmail,
            photo: "string",
            date_registration: formatDateDash(editingUser.date_registration),
            date_lastAuth: date_last, 
            status: status_user,
            bloking: editingUser.bloking[0].bloking,
            password: editUserPassword,
            confirmed: editingUser.confirmed,
        };

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
                      "confirmed": newEditUser["confirmed"],
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
                                const updatedUsers = filteredUsers.map(user => {
                                  if (user.id === data.data.id) {
                                      user = data.data;
                                      user.bloking = [{ bloking: user.bloking }];
                                      user.status = [{ status: user.status }];
                                      user.date_registration = formatDatePoint(user.date_registration);
                                      user.date_lastAuth = formatDatePoint(user.date_lastAuth);
                                      return user;
                                  }
                                  return user;
                              });
                              console.log("Обновленный список пользователей:", updatedUsers);
                              setFilteredUsers(updatedUsers);
                              handleApplayFilter(updatedUsers); 
                              setIsEditUser(false);
                              setIsPasswordReset(false);
                              message.success('Информация о пользователе успешно обновлена!', 1.3);
                            },
                            (error) => console.log(error)  // Установить сообщения об ошибках
                        )
                }
                update()
        }
  };

  const formatDatePoint = (date) => {
      if(date !== null && date !== undefined) {
        const parts = date.split('.');
        const reconstructedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        const day = String(reconstructedDate.getDate()).padStart(2, '0');
        const month = String(reconstructedDate.getMonth() + 1).padStart(2, '0');
        const year = reconstructedDate.getFullYear();
        return `${day}.${month}.${year}`;
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
      title={<span style={{ color: 'var(--color6-color)', textAlign: 'center', display: 'block', fontSize: '3vh', userSelect: 'none' }}>Редактирование пользователя</span>}
      open={visible}
      width={"35vw"}
      onOk={handleSaveEditUser}
      onCancel={handleCancelEditUser}
      centered
      style={{ padding: "10px"}}
      okButtonProps={{ style: { backgroundColor: 'var(--color1-color)', borderColor: 'var(--color1-color)' } }}
    >
      <div className="new-model-user">Введите фамилию и имя:</div>
      <Input
        className="new-user"
        placeholder="Фамилия и имя пользователя"
        value={newUserName}
        onChange={handleInputChangeName}
      />
      <div className="new-model-user">Введите электронную почту:</div>
      <Input
        className="new-user"
        placeholder="Электронная почта пользователя"
        value={newUserEmail}
        onChange={handleInputChangeEmail}
      />
      {!validEmail && newUserEmail.trim() !== "" && <div className="errorValid">Некорректный формат электронной почты</div>}
      <div className="new-model-user">Выберите статус:</div>
      <CustomCascader options={status_user} value={selectedStatus} onChange={handleCascaderChange} />
      <div className="div-password">
        <div className="new-model-user">Сбросить пароль:</div>
        <Switch
        checked={isPasswordReset}
        onChange={handlePasswordResetChange}
        checkedChildren={<CloseOutlined />}
        unCheckedChildren={<CheckOutlined />}
        defaultChecked
        className="switch-password"
        />
      </div>
    </Modal>
  );
};

export default EditUserModal;
