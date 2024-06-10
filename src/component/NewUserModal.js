import React, { useState } from "react";
import { Modal, Input, message } from "antd";

import './css/NewChatModal.css'

const CustomCascader = ({ options, value, onChange }) => {
  console.log("options", options)
  return (
      <select className="cascader-models-status-user" value={value} onChange={(e) => onChange([e.target.value])}>
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

const NewUserModal = ({ visible, users, setUsers, setIsCreatingNewUser }) => {
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("1");
  const [validEmail, setValidEmail] = useState(true);
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorNoName, setErrorNoName] = useState(false);
  const [errorNoEmail, setErrorNoEmail] = useState(false);


  const handleInputChangeName = (e) => {
    setErrorNoName(false);
    setNewUserName(e.target.value);
  };

  const handleInputChangeEmail = (e) => {
    setErrorNoEmail(false);
    setValidEmail(true);
    setErrorEmail(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setValidEmail(emailRegex.test(e.target.value));
    setNewUserEmail(e.target.value);
    const foundUser = users.find(user => user.email_user === e.target.value);
    if (foundUser) {
      setErrorEmail(true);
    }
  };

  const handleCascaderChange = (value) => {
    console.log(value[0]);
    setSelectedStatus(value[0]);
  }

  const handleCancelNewUser = () => {
    setIsCreatingNewUser(false);
    setNewUserName("");
    setNewUserEmail("");
    setSelectedStatus("1");
};


  const handleSaveNewUser = async () => {
    if (newUserName.trim() !== "" && newUserEmail.trim() !== "" && selectedStatus !== null && validEmail && !errorEmail) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
        const day = String(currentDate.getDate()).padStart(2, '0'); 
        const formattedDate = `${year}-${month}-${day}`;

        let status_user;
        if (selectedStatus) {
            if (selectedStatus === '1'){
                console.log(selectedStatus)
                status_user = 'Пользователь';
            }
            else if (selectedStatus === '2'){
                console.log(selectedStatus)
                status_user = 'Админ';
            }
        }
        const newUser = {
            name_user: newUserName,
            email_user: newUserEmail,
            photo: "string",
            date_registration: formattedDate,
            date_lastAuth: null,
            status: status_user,
            bloking: false,
            confirmed: true,
            password: null,
        };

        let userId;

        console.log(newUser)


            const create = async () => {
                /**
                 * определение параметров запроса
                 */
                const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "name_user": newUser["name_user"],
                        "password": newUser["password"],
                        "email_user": newUser["email_user"],
                        "photo": newUser["photo"],
                        "date_registration": newUser["date_registration"],
                        "date_lastAuth": newUser["date_lastAuth"],
                        "status": newUser["status"],
                        "bloking": false,
                        "confirmed": true,
                    }),
                }      

                console.log(requestOptions)
                /**
                 * отправка POST-запроса на сервер
                 */
                const url = "http://localhost:8000/user"
                return await  fetch(url, requestOptions)
                    .then(response => response.json())
                            .then(
                                (data) => {
                                    console.log('Новый пользователь:', data.data)
                                    let user = data.data;
                                    userId = data.data.id;
                                    user.bloking = [{ bloking: user.bloking }];
                                    user.status = [{ status: user.status }];
                                    setUsers(prevUsers => prevUsers.concat(user))
                                    console.log('Обновленный список пользвателей:', users)
                                    setIsCreatingNewUser(false);
                                    message.success('Пользователь успешно добавлен!', 1.3);
                                },
                                (error) => console.log(error)  // Установить сообщения об ошибках
                            )
            }
            create().then(() => {
              if(newUser.status === "Пользователь") {
                const newChat = {
                    chat_name: "Новый чат",
                    date_creating: new Date().toISOString(),
                    date_deleting: null,
                    deleting: false,
                };
                const user_id = userId;
                const type_nn_id = 1;
        
                const create = async () => {
                    /**
                     * определение параметров запроса
                     */
                  const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "chat_name" : newChat["chat_name"],
                        "date_creating" : newChat["date_creating"],
                        "date_deleting" : newChat["date_deleting"],
                        "deleting" : newChat["deleting"],
                    }),
                  }      
                  /**
                   * отправка POST-запроса на сервер
                   */
                  const url = "http://localhost:8000/chats/" + user_id + "/" + type_nn_id
                  return await  fetch(url, requestOptions)
                    .then(response => response.json())
                            .then(
                                (data) => {
                                  console.log('Новый чат:', data)
                            },
                              (error) => console.log(error)  // Установить сообщения об ошибках
                          )
                    }
                    create()
              }
            })
        }
        else {
          if (newUserName.trim() === ""){
            setErrorNoName(true);
          }
          if (newUserEmail.trim() === ""){
          setErrorNoEmail(true);
          }
        }
    };


  return (
    <Modal
      className="new-chat-modal"
      title={<span style={{ color: 'var(--color1-color)', textAlign: 'center', display: 'block', fontSize: '2.5vh', userSelect: 'none' }}>Новый пользователь</span>}
      open={visible}
      width={"35vw"}
      onOk={handleSaveNewUser}
      onCancel={handleCancelNewUser}
      centered
      style={{ padding: "10px"}}
      okButtonProps={{ style: { backgroundColor: 'var(--color1-color)', borderColor: 'var(--color1-color)' } }}
      cancelText="Отменить"
    >
      <div className="new-model-user">Введите фамилию и имя:</div>
      <Input
        className="new-user"
        placeholder="Фамилия и имя пользователя"
        value={newUserName}
        onChange={handleInputChangeName}
      />
      {errorNoName && <div className="errorValid">Заполните поле</div>}
      <div className="new-model-user">Введите электронную почту:</div>
      <Input
        className="new-user"
        placeholder="Электронная почта пользователя"
        value={newUserEmail}
        onChange={handleInputChangeEmail}
      />
      {errorNoEmail && <div className="errorValid">Заполните поле</div>}
      {errorEmail && <div className="errorValid">Пользователь с такой электронной почтой уже существует</div>}
      {!validEmail && newUserEmail.trim() !== "" && <div className="errorValid">Некорректный формат электронной почты</div>}
      <div className="new-model-user">Выберите статус:</div>
      <CustomCascader options={status_user} onChange={handleCascaderChange} />

    </Modal>
  );
};

export default NewUserModal;
