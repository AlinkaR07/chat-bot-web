import React, { useState, useEffect } from "react";
import { Modal, Input } from "antd";

import './css/NewChatModal.css'

const NewChatModal = ({ visible, onCreate, onCancel, chats, errorName, setErrorName }) => {
  const [newChatName, setNewChatName] = useState("");
  const [selectedModel, setSelectedModel] = useState(1);
  const [type_nn, setTypeNn] = useState([]);


  const handleInputChange = (e) => {
    setErrorName(false);
    setNewChatName(e.target.value);
    const foundChat = chats.find(chat => chat.chat_name === e.target.value);
    if (foundChat) {
      setErrorName(true);
    }
  };

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


  return (
    <Modal
      className="new-chat-modal"
      title={<span style={{ color: 'var(--color1-color)', textAlign: 'center', display: 'block', fontSize: '2.5vh' }}>Создать новый чат</span>}
      open={visible}
      width={"35vw"}
      onOk={() => onCreate(newChatName, selectedModel)}
      onCancel={onCancel}
      centered
      style={{ padding: "20px"}}
      okButtonProps={{ style: { backgroundColor: 'var(--color1-color)', borderColor: 'var(--color1-color)' } }}
      cancelText="Отменить"
    >
      <div className="settings-model">Введите название чата:</div>
      <Input
        className="name-chat"
        placeholder="Название чата"
        value={newChatName}
        onChange={handleInputChange}
      />
      {!errorName && <div className="settings-model-1">Вы можете ввести нужное название чата или оставить после пустым (в таком случае создатся чат с названием "Новый чат")</div>}
      {errorName && <div className="errorName">Чат с таким названием уже существует</div>}
    </Modal>
  );
};

export default NewChatModal;
