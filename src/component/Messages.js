import React, { useState, useEffect, useRef } from "react";
import { UserOutlined, EditOutlined, CloseOutlined, CopyOutlined, CheckOutlined, RedoOutlined} from "@ant-design/icons"
import { Input, Avatar} from "antd"

import noMessagesImageLight from "../resours/panda-light.png"
import noMessagesImageDark from "../resours/panda-dark.png"
import avatarChatbot from "../resours/avatar-chatbot-light.png"

import './css/Chat.css'


const Messages = ({ selectedChat, user, messages, setMessages, loadingAnswer, setLoadingAnswer, isColorChanged, minRows, setMinRows}) => {
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const messagesEndRef = useRef(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [regeneratingMessage, setRegeneratingMessage] = useState(null);
    const [inputEditingText, setInputEditingText] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    let id_regenerate = 0;

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
  
    // useEffect(() => {
    //         messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    // }, [messages]);

    useEffect(() => {
        console.log("isEditing1:", isEditing);
    }, [isEditing]);

    useEffect(() => {
        console.log("isEditing2:", isRegenerating);
    }, [isRegenerating]);

    useEffect(() => {
        if(!isRegenerating && !isEditing) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
        else {
            setIsRegenerating(false);
            setIsEditing(false);
        }
        console.log("UseEffect:", isEditing, isRegenerating)
    }, [messages]);

    useEffect(() => {
        if (editingMessage !== null) {
            const selectedMessage = messages.find(message => message.id === editingMessage);
            setInputEditingText(selectedMessage.content);
        } else {
            setInputEditingText("");
        }
    }, [editingMessage, messages]);

    useEffect(() => {
        setEditingMessage(null);
        setInputEditingText("");
    }, [selectedChat]);


    const handleInputEditingKeyPress = (e) => {
        if (e.key === "Enter") {
          handleEdit();
        }
    };
    

    const cancelEdit = () => {
        setEditingMessage(null);
        setInputEditingText("");
    };
    
    
    const copyToClipboard = (text, messageId) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(messageId);
        setTimeout(() => {
            setCopiedMessageId(null); 
        }, 2000);
    };
    
    
    // Функция для группировки сообщений по дате
    const groupMessagesByDate = () => {
        const groupedMessages = {};
        console.log(messages);
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

    const handleEdit = () => {
        setIsEditing(true);
        if (inputEditingText.trim() !== "") {
            const updateMessage = {
                content: inputEditingText,
                date_sending: new Date().toISOString(),
            };
        console.log("UpdateMessage", updateMessage)
        console.log("id-request:", editingMessage);

        let updatedMessages = [];

        const update = async () => {
            /**
             * определение параметров запроса
             */
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "content" : updateMessage["content"],
                    "date_sending" : updateMessage["date_sending"],
                }),
            }      
            /**
             * отправка PUT-запроса на сервер
             */
            const url = "http://localhost:8000/messages/" + editingMessage
            console.log("url", url)
            return await  fetch(url, requestOptions)
                .then(response => response.json())
                        .then(
                            (data) => {
                            console.log('Data:', data.data)
                            updatedMessages = messages.map(message => {
                                if (message.id === data.data.id) {
                                    message = data.data;
                                    message.user_id = 1;
                                    message.status_message_id = 1;
                                    return message;
                                }
                                return message;
                            });
                            console.log("updatedMessages:", updatedMessages);
                            setMessages(updatedMessages);
                            setEditingMessage(null);
                            id_regenerate = data.data.id + 1;
                            console.log("id-answer:", id_regenerate);
                            setInputEditingText("");
                            setMinRows(1);
                        },
                        (error) => console.log(error)  // Установить сообщения об ошибках
                    )
            }
          update().then( () => {
            console.log("handeEdit1",isRegenerating)
            setLoadingAnswer(true);
            setRegeneratingMessage(id_regenerate);
            const regenerate = async () => {
                /**
                 * определение параметров запроса
                 */
                const requestOptions = {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                }      
                /**
                 * отправка PUT-запроса на сервер
                 */
                const url = "http://localhost:8000/messages_answer/" + id_regenerate
                console.log("url", url)
                return await  fetch(url, requestOptions)
                    .then(response => response.json())
                            .then(
                                (data) => {
                                console.log('Data:', data.data)
                                updatedMessages = updatedMessages.map(message => {
                                    if (message.id === data.data.id) {
                                        message = data.data;
                                        message.user_id = user.id;
                                        message.status_message_id = 2;
                                        return message;
                                    }
                                    return message;
                                });
                                console.log("updatedMessages:", updatedMessages);
                                setIsRegenerating(true);
                                setLoadingAnswer(false);
                                setRegeneratingMessage(null);
                                setMessages(updatedMessages);
                                setInputEditingText("");
                                setMinRows(1);
                            },
                            (error) => console.log(error)  // Установить сообщения об ошибках
                        )
                }
                regenerate()      
            })    
        }
    };

    const handleRegenerate = (id) => {
        setIsRegenerating(true);
        setLoadingAnswer(true);
        setRegeneratingMessage(id);
        const update = async () => {
            /**
             * определение параметров запроса
             */
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            }      
            /**
             * отправка PUT-запроса на сервер
             */
            const url = "http://localhost:8000/messages_answer/" + id
            console.log("url", url)
            return await  fetch(url, requestOptions)
                .then(response => response.json())
                        .then(
                            (data) => {
                            console.log('Data:', data.data)
                            const updatedMessages = messages.map(message => {
                                if (message.id === data.data.id) {
                                    message = data.data;
                                    message.user_id = user.id;
                                    message.status_message_id = 2;
                                    return message;
                                }
                                return message;
                            });
                            console.log("updatedMessages:", updatedMessages);
                            setLoadingAnswer(false);
                            setRegeneratingMessage(null);
                            setMessages(updatedMessages);
                            setEditingMessage(null);
                            setInputEditingText("");
                            setMinRows(1);
                        },
                        (error) => console.log(error)  // Установить сообщения об ошибках
                    )
            }
            update()
    };

    return(
    <div className="messages">
    {selectedChat !== null && messages && messages.length > 0 ? (
        <>
            {Object.entries(groupMessagesByDate()).map(([date, messages]) => (
                <div key={date}>
                    <div className="div-date-header-divider">
                        <hr className="date-divider"/>
                        <div className="date-header">{getDateText(date)}</div>
                        <hr className="date-divider"/>
                    </div>
                    {messages.map((message) => (
                        <div key={message.id}>
                                    { message.status_message_id === 1 ? (
                                        <div className="massage-div-request">
                                            <div className="massage-div-request-text-avatar"> 
                                                <div className="massage-div-request-text">Вы</div>
                                                <Avatar className="massage-div-request-avatar" size={40}><UserOutlined/></Avatar>
                                            </div>

                                            {editingMessage === message.id ? ( 
                                                <div className="massage-div-edit">
                                                    <CloseOutlined className="close-edit-message-button" onClick={cancelEdit}/>
                                                    <div className="save-edit-message-button" onClick={handleEdit}>Сохранить</div>
                                                    <Input.TextArea className="input-editing" autoSize={{ minRows: minRows, maxRows: 3 }} placeholder="Напишите запрос" value={inputEditingText} onChange={(e) => setInputEditingText(e.target.value)} onKeyDown={handleInputEditingKeyPress}/>
                                                </div> ) : 
                                            (
                                                <div className="massage-div-request-text-avatar"> 
                                                    <EditOutlined className="edit-message-button" onClick={() => setEditingMessage(message.id)}/>
                                                    <div className="message-request">{message.content}</div> 
                                                </div>
                                            )}

                                            <div className="message-div-request-date-sending"> 
                                                <div className="date-sending-message-request">{new Date(message.date_sending).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            { regeneratingMessage === message.id ? (
                                                <div className="massage-div-answer">
                                                    <div className="massage-div-answer-text-avatar"> 
                                                        <Avatar className="massage-div-answer-avatar" src={avatarChatbot} size={40}><img src={avatarChatbot} size={20} alt="No messages" /></Avatar>
                                                        <div style={{marginTop: "8px", fontSize: "2.5vh", fontWeight: "bolder"}}>Panda-OS</div>
                                                    </div>
                                                    <div className="message-answer-loading" ><div className="loading">Генерирую для Вас ответ . . .</div></div>              
                                                </div>
                                            ) : (
                                                <div className="massage-div-answer">
                                                    <div className="massage-div-answer-text-avatar"> 
                                                        <Avatar className="massage-div-answer-avatar" src={avatarChatbot} size={40}><img src={avatarChatbot} size={20} alt="No messages" /></Avatar>
                                                        <div style={{marginTop: "8px", fontSize: "2.5vh", fontWeight: "bolder"}}>Panda-OS</div>
                                                    </div>
                                                            <div className="message-answer" >{message.content}</div>
                                                            <div className="massage-div-answer-text-avatar">
                                                                <div className="message-div-answer-date-sending"> 
                                                                    <div className="date-sending-message-answer">{new Date(message.date_sending).toLocaleTimeString()}</div>
                                                                </div>
                                                                {copiedMessageId === message.id ? ( 
                                                                    <CheckOutlined className="confirmation-copy-message"/>) : (
                                                                    <>
                                                                        <CopyOutlined className="copy-message-button" onClick={() => copyToClipboard(message.content, message.id)}/>
                                                                    </>
                                                                )}
                                                                <RedoOutlined className="regenerate-message-button" onClick={()=>handleRegenerate(message.id)}/>
                                                            </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                        </div>
                    ))}
                </div>
            ))}
            {loadingAnswer && regeneratingMessage === null ? (
                <div className="massage-div-answer">
                    <div className="massage-div-answer-text-avatar"> 
                        <Avatar className="massage-div-answer-avatar" src={avatarChatbot} size={40}><img src={avatarChatbot} size={20} alt="No messages" /></Avatar>
                        <div style={{marginTop: "8px", fontSize: "2.5vh", fontWeight: "bolder"}}>Panda-OS</div>
                    </div>
                    <div className="message-answer-loading" ><div className="loading">Генерирую для Вас ответ . . .</div></div>              
                </div>
            ) : ( "" )}
        </>
    ) : (
        <div className="div-image-no-messages">
            Чем я могу Вам помочь?
            <img style={{marginTop: "30px", width: "10vw", height: "17vh"}} src={isColorChanged ? noMessagesImageDark : noMessagesImageLight} alt="No messages" />
        </div>
    )}
    <div id="messagesEndRef" ref={messagesEndRef} />
    </div>
    )
};

export default Messages;