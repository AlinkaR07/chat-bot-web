import React, { useState } from "react";
import { SendOutlined } from "@ant-design/icons"
import { Input } from "antd"

import './css/Chat.css'
import Messages from './Messages';

const Chat = ({chats, setChats, selectedChat, isColorChanged, user}) => {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState([]);
    const [minRows, setMinRows] = useState(1);
    const [loadingAnswer, setLoadingAnswer] = useState(false);
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const [isGenerate, setIsGenerate] = useState(false);  

    const handleSend = async () => {
        if (inputText.trim() !== "") {
            const newMessage = {
                content: inputText,
                date_sending: new Date().toISOString(),
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
                        "date_sending" : newMessage["date_sending"],
                    }),
                }      
                /**
                 * отправка POST-запроса на сервер
                 */
                const url = "http://localhost:8000/messages/" + user_id + "/" + selectedChat.id + "/" + status_message_id
                return await  fetch(url, requestOptions)
                    .then(response => response.json())
                            .then(
                                (data) => {
                                    newMessages = (messages || []).concat({
                                        ...data.data_message,
                                        user_id: user.id,
                                        status_message_id: status_message_id
                                    });
                                    console.log("Обновленный список сообщений:", newMessages)
                                    setMessages(newMessages);
                                    updateLastMessageInChat(selectedChat.id, data.data_message);
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
                    date_sending: new Date().toISOString(),
                };
                /**
                 * определение параметров запроса для получения ответа
                 */
                const answerRequestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "content" : newAnswer["content"],
                        "date_sending" : newAnswer["date_sending"],
                    }),
                };

                console.log("answerRequest", answerRequestOptions)
                /**
                 * отправка POST-запроса на сервер для получения ответа
                 */
                const answerUrl = "http://localhost:8000/messages_answer/" + user_id + "/" + selectedChat.id + "/" + status_answer_id;
                return fetch(answerUrl, answerRequestOptions)
                    .then(response => response.json())
                    .then(
                        (data) => {
                            newMessages = newMessages.concat({
                                ...data.data_answer,
                                user_id: user.id,
                                status_message_id: status_answer_id
                            });
                            console.log("Обновленный список сообщений после ответ llm:", newMessages)
                            setMessages(newMessages);
                            setIsGenerate(true);
                            updateLastMessageInChat(selectedChat.id, data.data_answer);
                            setLoadingAnswer(false);
                            setNewMessagesCount(1);
                        },
                        (error) => {
                            console.log(error); // Установить сообщения об ошибках
                            setLoadingAnswer(false); // Corrected placement
                        }
                    );
            });
        }
    };

    const handleInputKeyPress = (e) => {
        if (e.key === "Enter") {
          handleSend();
        }
    };

    const updateLastMessageInChat = (chatId, newLastMessage) => {
        const updatedChats = chats.map(chat => {
            if (chat.id === chatId) {
                chat.last_message = newLastMessage;
            }
            return chat;
        });
        setChats(updatedChats);
    };
       
    return(
        <div className="chat">
            <div className="header">
                {selectedChat.id !== 0 && selectedChat.id !== undefined ? (
                    <>
                        <div className="chat-header">{chats.find((chat) => chat.id === selectedChat.id)?.chat_name}</div>
                    </>
                ) : (
                    <>
                        <div className="chat-header-nomessage" style={{fontSize: "14px"}}>Выберите чат или создайте новый</div>
                    </>
                )}
            </div>
            <Messages selectedChat={selectedChat} chats={chats} setChats={setChats} user={user} messages={messages} setMessages={setMessages} loadingAnswer={loadingAnswer} setLoadingAnswer={setLoadingAnswer} isColorChanged={isColorChanged} minRows={minRows} setMinRows={setMinRows} newMessagesCount={newMessagesCount} setNewMessagesCount={setNewMessagesCount} isGenerate={isGenerate} setIsGenerate={setIsGenerate}/>
            {selectedChat.id !== null && selectedChat.id !== undefined ? (
                <>
                    <div className="input-request">
                        <Input.TextArea className="input" autoSize={{ minRows: minRows, maxRows: 3 }} placeholder="Напишите запрос" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleInputKeyPress}/>
                        {!loadingAnswer && <SendOutlined className="send-outlined" type="primary" onClick={handleSend}/>}
                    </div>
                </>
            ) : ("")}
        </div>
    )
}

export default Chat

