import React, {  useState } from "react";
import { CloseCircleOutlined, PlusSquareOutlined, DeleteOutlined, EditOutlined, CloseOutlined, CheckOutlined} from "@ant-design/icons"
import { Input } from "antd"

import './css/SideBar.css'

const Sidebar = ({chats, setChats, selectedChat, setSelectedChat, user}) => {

    const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
    const [newChatName, setNewChatName] = useState("");

    const handleNewChat = () => {
        setIsCreatingNewChat(true);
    };

    const handleSaveNewChat = () => {
        if (newChatName.trim() !== "") {
        const newChat = {
            chat_name: newChatName,
            date_creating: new Date().toJSON().substring(0,10),
        };
        const user_id = user.id;
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
                "date_creating" : newChat["date_creating"]
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
                          console.log('Data:', data)
                          setChats(prevChats => prevChats.concat(data.data))
                          setNewChatName("");
                          setIsCreatingNewChat(false);
                          setSelectedChat(data.data.id);
                    },
                       (error) => console.log(error)  // Установить сообщения об ошибках
                  )
            }
             create()
        }
    };

    const handleCancelNewChat = () => {
        setNewChatName("");
        setIsCreatingNewChat(false);
    };

    const handleChatClick = (chatId) => {
        setSelectedChat(chatId);
        console.log("Открываем чат с ID:", chatId);
    };

    const handleInputKeyPress = (e) => {
        if (e.key === "Enter") {
          handleSaveNewChat();
        }
    };

    const handleDeleteChat = async (e, chatId) => {
        e.stopPropagation(); 
        const requestOptions = {
            method: 'DELETE'
        }
        /**
         * отправка DELETE-запроса на сервер
         */
        return await fetch(`http://localhost:8000/chats/${chatId}`, requestOptions)
            .then((response) => {
                if (response.ok) {
                    console.log("Удален чат с ID:", chatId);
                    setChats(chats.filter(chat => chat.id !== chatId)); // Удаляем удаленный чат из состояния
                    if (selectedChat === chatId) {
                    setSelectedChat(null); // Сбрасываем выбранный чат, если удаленный чат был выбран
                    }
                } else {
                    throw new Error("Ошибка при удалении чата");
                }
            },
                (error) => console.log(error)  // Установить сообщения об ошибках
            )
    };

      


    return(
        <div className="side-bar">
            <div>  Чаты 
                {isCreatingNewChat ? (
                    <div style={{display: "flex"}}>
                        <Input
                            placeholder="Введите название чата"
                            value={newChatName}
                            onChange={(e) => setNewChatName(e.target.value)}
                            onKeyDown={handleInputKeyPress}
                            style={{marginTop: "1vh"}}
                        />
                        <CloseCircleOutlined onClick={handleCancelNewChat} className="button-cancel-new-chat"/>
                    </div>
                ) : (
                    <PlusSquareOutlined type="primary" className="button-new-chat" onClick={handleNewChat}/>
                )}
            </div>
            <div className="chat-list">
                { chats ? (
                    <>
                        {chats.map((chat) => (
                            <div key={chat.id} className={`chat-item ${selectedChat === chat.id ? "selected-chat" : ""}`} onClick={() => handleChatClick(chat.id)}>
                                <div className="chat-item-header">
                                    {chat.chat_name || `Чат ${chat.id}`}
                                    <div className="chat-settings-div">
                                        <DeleteOutlined className="delete-chat-button" onClick={(e) => handleDeleteChat(e, chat.id)}/>
                                    </div>
                                </div>
                                <div style={{display: "flex", flexDirection: "row"}}>
                                    <div className="chat-name">{chat.chat_name}</div>
                                    <div className="chat-createdAt">{new Date(chat.date_creating).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : ("")}
            </div>
    </div>
    )
}

export default Sidebar