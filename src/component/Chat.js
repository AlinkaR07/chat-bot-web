import React, { useState} from "react";
import { SendOutlined} from "@ant-design/icons"
import { Input} from "antd"

import './css/Chat.css'
import Messages from './Messages';


const Chat = ({chats, selectedChat, isColorChanged, user}) => {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState([]);
    const [minRows, setMinRows] = useState(1);
   
    
    const handleSend = async () => {
        if (inputText.trim() !== "") {
            const newMessage = {
                content: inputText,
                date_creating: new Date().toISOString(),
            };
            const user_id = user.id;
            const status_message_id = 1;

            const create = async () => {
                /**
                 * определение параметров запроса
                 */
                const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "content" : newMessage["content"],
                        "date_sending" : newMessage["date_creating"],
                    }),
                }      
                /**
                 * отправка POST-запроса на сервер
                 */
                const url = "http://localhost:8000/messages/" + user_id + "/" + selectedChat + "/" + status_message_id
                return await  fetch(url, requestOptions)
                    .then(response => response.json())
                            .then(
                                (data) => {
                                    console.log('Data:', data)
                                    const newMessages = messages.concat({
                                        ...data.data,
                                        user_id: user.id,
                                        status_message_id: status_message_id
                                    });
                                    console.log("newMessage:", newMessages)
                                    setMessages(newMessages);
                                    setInputText("");
                                    setMinRows(1);
                                },
                            (error) => console.log(error)  // Установить сообщения об ошибках
                            )
            }
        create()
        }
    };

    const handleInputKeyPress = (e) => {
        if (e.key === "Enter") {
          handleSend();
        }
    };

       
    return(
        <div className="chat">
            <div className="header">
                {selectedChat !== null ? (
                    <>
                        <div className="chat-header">{chats.find((chat) => chat.id === selectedChat)?.chat_name}</div>
                    </>
                ) : (
                    <>
                        <div className="chat-header" style={{fontSize: "14px"}}>Выберите чат или создайте новый</div>
                    </>
                )}
            </div>
            <Messages selectedChat={selectedChat} messages={messages} setMessages={setMessages} isColorChanged={isColorChanged} minRows={minRows} setMinRows={setMinRows}/>
            {selectedChat !== null ? (
                <div className="input-request">
                    <Input.TextArea className="input" autoSize={{ minRows: minRows, maxRows: 3 }} placeholder="Напишите запрос" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleInputKeyPress}/>
                    <SendOutlined className="send-outlined" type="primary" onClick={handleSend}/>
                </div>
            ) : ("")}
        </div>
    )
}

export default Chat

