import React, { useState, useEffect, useRef } from "react";
import { SendOutlined, UserOutlined} from "@ant-design/icons"
import { Input, Avatar} from "antd"

import './css/Chat.css'
import noMessagesImageLight from "../resours/panda-light.png"
import noMessagesImageDark from "../resours/panda-dark.png"
import avatarChatbot from "../resours/avatar-chatbot-light.png"


const Chat = ({chats, selectedChat, isColorChanged}) => {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState([]);
    const [minRows, setMinRows] = useState(1);
    const messagesEndRef = useRef(null);


    useEffect(() => {
        const getMessages = async () => {
            if (selectedChat !== null) {
                try {
                    const response = await fetch(`http://localhost:8000/messages/chat/${selectedChat}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch messages');
                    }
                    const data = await response.json();
                    setMessages(data.data);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };
        getMessages()
    }, [setMessages, selectedChat])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);
        
    const handleSend = async () => {
        if (inputText.trim() !== "") {
            const newMessage = {
                content: inputText,
                date_creating: new Date().toISOString(),
            };
            const user_id = 1;
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
                            setMessages(prevMessages => prevMessages.concat(data.data));
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



    // Функция для группировки сообщений по дате
    const groupMessagesByDate = () => {
        const groupedMessages = {};
        messages.forEach((message) => {
            const date = message.date_sending.split('T')[0];
            if (!groupedMessages[date]) {
                groupedMessages[date] = [];
            }
            groupedMessages[date].push(message);
        });
        return groupedMessages;
    };

    const getDateText = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
    
        if (new Date(date).toLocaleDateString() === new Date(today).toLocaleDateString()) {
            return 'Сегодня';
        } else if (new Date(date).toLocaleDateString() === new Date(yesterday).toLocaleDateString()) {
            return 'Вчера';
        } else {
            return new Date(date).toLocaleDateString();
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
            <div className="messages">
                {selectedChat !== null && messages && messages.length > 0 ? (
                    <>
                    {/* Отображение групп сообщений */}
                    {Object.entries(groupMessagesByDate()).map(([date, messages]) => (
                        <div key={date}>
                            <div className="div-date-header-divider">
                                <hr className="date-divider"/>
                                <div className="date-header">{getDateText(date)}</div>
                                <hr className="date-divider"/>
                            </div>
                            {messages.map((message) => (
                                <div key={message.id}>
                                    <div className="massage-div-request">
                                        <div className="massage-div-request-text-avatar"> 
                                            <div className="massage-div-request-text">Вы</div>
                                            <Avatar className="massage-div-request-avatar" size={40}><UserOutlined/></Avatar>
                                        </div>
                                        <div className="message-request">{message.content}</div>
                                        <div className="message-div-request-date-sending"> 
                                            <div className="date-sending-message-request">{new Date(message.date_sending).toLocaleTimeString()}</div>
                                        </div>
                                    </div>

                                    <div className="massage-div-answer">
                                        <div className="massage-div-answer-text-avatar"> 
                                            <Avatar className="massage-div-answer-avatar" src={avatarChatbot} size={40}><img src={avatarChatbot} size={20} alt="No messages" /></Avatar>
                                            <div style={{marginTop: "8px", fontSize: "2.5vh", fontWeight: "bolder"}}>Chat Bot</div>
                                        </div>
                                        <div className="message-answer" >{message.content}</div>
                                        <div className="message-div-answer-date-sending"> 
                                            <div className="date-sending-message-answer">{new Date(message.date_sending).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                </div>
                                
                            ))}
                        </div>
                    ))}
                    </>
                ) : (
                    <div className="div-image-no-messages">
                        Чем я могу Вам помочь?
                        <img style={{marginTop: "30px", width: "5vw", height: "10vh"}} src={isColorChanged ? noMessagesImageDark : noMessagesImageLight} alt="No messages" />
                    </div>
                )}
                <div id="messagesEndRef" ref={messagesEndRef} />
            </div>
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

