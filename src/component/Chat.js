import React, { useState} from "react";
import { SendOutlined} from "@ant-design/icons"
import { Input} from "antd"

import './css/Chat.css'
import Messages from './Messages';


const Chat = ({chats, selectedChat, isColorChanged, user}) => {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState([]);
    const [minRows, setMinRows] = useState(1);
    const [loadingAnswer, setLoadingAnswer] = useState(false);
   
    
    const handleSend = async () => {
        if (inputText.trim() !== "") {
            const newMessage = {
                content: inputText,
                date_creating: new Date().toISOString(),
            };
            const user_id = user.id;
            const status_message_id = 1;
            const status_answer_id = 2;

            let newMessages = [];

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
                                    console.log('Messages Data:', data)
                                    newMessages = messages.concat({
                                        ...data.data_message,
                                        user_id: user.id,
                                        status_message_id: status_message_id
                                    });
                                    console.log("newMessage:", newMessages)
                                    setMessages(newMessages);
                                    setLoadingAnswer(true);
                                    setInputText("");
                                    setMinRows(1);

                                },
                            (error) => console.log(error)  // Установить сообщения об ошибках
                            )
            }
        create().then(() => {
            const newAnswer = {
                content: inputText,
                date_creating: new Date().toISOString(),
            };
            /**
             * определение параметров запроса для получения ответа
             */
            const answerRequestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "content" : newAnswer["content"],
                    "date_sending" : newAnswer["date_creating"],
                }),
            };

            /**
             * отправка POST-запроса на сервер для получения ответа
             */
            const answerUrl = "http://localhost:8000/messages_answer/" + user_id + "/" + selectedChat + "/" + status_answer_id;
            return fetch(answerUrl, answerRequestOptions)
                .then(response => response.json())
                .then(
                    (data) => {
                        console.log('Answer Data:', data);
                        newMessages = newMessages.concat({
                            ...data.data_answer,
                            user_id: user.id,
                            status_message_id: status_answer_id
                        });
                        console.log("newAnswer:", newMessages)
                        setMessages(newMessages);
                        setLoadingAnswer(false);
                    },
                    (error) => console.log(error) // Установить сообщения об ошибках
                );
        });
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
            <Messages selectedChat={selectedChat} user={user} messages={messages} setMessages={setMessages} loadingAnswer={loadingAnswer} setLoadingAnswer={setLoadingAnswer} isColorChanged={isColorChanged} minRows={minRows} setMinRows={setMinRows}/>
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

