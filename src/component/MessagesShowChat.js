import React, { useState, useEffect, useRef } from "react";
import { UserOutlined } from "@ant-design/icons"
import {  Avatar, Empty, Spin  } from "antd"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

import avatarChatbot from "../resours/avatar-chatbot-light.png"

import './css/Chat.css'

const customVsLight = {
    ...vs,
    'pre[class*="language-"]': {
      ...vs['pre[class*="language-"]'],
      border: 'none', 
      overflowX: 'hidden',
      whiteSpace: 'pre-line', 
      wordWrap: 'break-all',
      fontSize: '2vh',
      backgroundColor: 'var(--color5-color)',
      transition: 'background-color 0.3s ease',
    },
  };


const MessagesShowChat = ({ selectedChat }) => {
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getMessages = async () => {
            if (selectedChat.id !== null && selectedChat.id !== undefined) {
                try {
                    const response = await fetch(`http://localhost:8000/messages/chat/${selectedChat.id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch messages');
                    }
                    const data = await response.json();
                    setMessages(data.data);
                    setLoading(false);
                } catch (error) {
                        console.error('Error fetching messages:', error);
                }
            }
        };
        getMessages()
    }, [setMessages, selectedChat])  
    
    
    // Функция для группировки сообщений по дате
    const groupMessagesByDate = () => {
        const groupedMessages = {};
        messages.forEach((message) => {
            if (message.date_sending !== undefined) {
                const date = message.date_sending.split('T')[0];
                if (!groupedMessages[date]) {
                    groupedMessages[date] = [];
                }
                groupedMessages[date].push(message);
            }
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

    if (loading) {
        return <div className="div-loading-show-chat">
                  <div>
                    <Spin  style={{ fontSize: 16, marginRight: 8, color: '#072E70'}} />
                       Загрузка...
                  </div>
                </div>;
    }

    return(
    <div className="messages-show-chat">
    {selectedChat.id !== null && selectedChat.id !== undefined && messages && messages.length > 0 && 
        <>
            {Object.entries(groupMessagesByDate()).map(([date, messages]) => (
                <div key={date}>
                    <div className="div-date-header-divider">
                        <hr className="date-divider"/>
                        <div className="date-header">{getDateText(date)}</div>
                        <hr className="date-divider"/>
                    </div>
                    {messages.map((message) => (
                        <div key={`message_${message.id}`}>
                                    { message.status_message_id === 1 ? (
                                        <div className="massage-div-request">
                                            <div className="massage-div-request-text-avatar"> 
                                                <div className="massage-div-request-text">{selectedChat.user_name}</div>
                                                <Avatar className="massage-div-request-avatar" size={40}><UserOutlined/></Avatar>
                                            </div>
                                            <div className="message-request">{message.content}</div> 
                                            <div className="massage-div-request-edit">
                                                    <div className="date-sending-message-request">{new Date(message.date_sending).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                    ) : (
                                                <div className="massage-div-answer">
                                                    <div className="massage-div-answer-text-avatar"> 
                                                        <Avatar className="massage-div-answer-avatar" src={avatarChatbot} size={40}><img src={avatarChatbot} size={20} alt="No messages" /></Avatar>
                                                        <div style={{marginTop: "8px", fontSize: "2.2vh", fontWeight: "bolder"}}>Panda-OS</div>
                                                    </div>
                                                        <div className="message-answer">
                                                        {message.content.trim() ? ( message.content.split("```").map((block, index) => {
                                                            return index % 2 === 0 ? (
                                                            <div key={index}>
                                                                  <div>
                                                                    {block
                                                                        .trim()
                                                                        .split("\n")
                                                                        .map(line => line.trim().split(/(?<=[.:!?{}[\]<"";])\s+/))
                                                                        .flat()
                                                                        .filter(sentence => {
                                                                            const trimmedSentence = sentence.trim();
                                                                            return trimmedSentence !== "" && !trimmedSentence.startsWith("Ответ") && !trimmedSentence.startsWith("Answer") && /[.:!?{}[\]<"";]$/.test(trimmedSentence);
                                                                        })
                                                                        .map((sentence, idx, array) => {
                                                                            const isNewLineNeeded = /^\d+\./.test(sentence); // Проверяем, начинается ли строка с номера списка
                                                                            return (
                                                                                <span key={idx}>
                                                                                    {isNewLineNeeded && idx !== 0 ? <br /> : null}
                                                                                    {sentence}
                                                                                    {idx !== array.length - 1 ? ' ' : ''} {/* Добавляем пробел после предложения, кроме последнего */}
                                                                                </span>
                                                                            );
                                                                        })
                                                                    }
                                                                </div>
                                                            </div>
                                                            ) : (
                                                            <div className="copy-cod">
                                                                <SyntaxHighlighter language="javascript" style={customVsLight}>
                                                                    {block.trim()}
                                                                </SyntaxHighlighter>
                                                            </div>
                                                            );
                                                        })) : (
                                                            <div>Не могу дать ответ на Ваш вопрос. Попробуйте его уточнить или заменить.</div>
                                                        )}
                                                        </div>
                                                </div>
                                    )}
                        </div>
                    ))}
                </div>
            ))}
        </> 
        }
        {!messages && (<div className="div-empty"><Empty description="Нет данных"/></div>)}
    <div id="messagesEndRef" ref={messagesEndRef} />
    </div>
    )
};

export default MessagesShowChat;