import React, { useState, useEffect, useRef } from "react";
import { UserOutlined, EditOutlined, CloseOutlined, CopyOutlined, CheckOutlined, RedoOutlined, UpOutlined, DownOutlined } from "@ant-design/icons"
import { Input, Avatar, Tooltip, Spin, Checkbox, Badge, Space } from "antd"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactDOM from 'react-dom';

import noMessagesImageLight from "../resours/panda-light.png"
import noMessagesImageDark from "../resours/panda-dark.png"
import avatarChatbot from "../resours/avatar-chatbot-light.png"

import './css/Chat.css'
import './css/Messages.css'

const customVsLight = {
    ...vs,
    'pre[class*="language-"]': {
      ...vs['pre[class*="language-"]'],
      border: 'none', 
      overflowX: 'hidden',
      whiteSpace: 'pre-line', 
      wordWrap: 'break-all',
      fontSize: '1.8vh',
      backgroundColor: 'var(--color5-color)',
      transition: 'background-color 0.3s ease',
    },
  };

  const SearchOverlay = ({ searchText, setSearchText, onClose, onChange, numMatches, handlePrevMatch, handleNextMatch, currentMatchIndex}) => {
    return (
        <div className="search-ovarlay">
            <div className="div-overlay">
                <div className="title-overlay">
                    <div>Поиск по запросам</div>
                    <CloseOutlined className="closeoutlined-overlay" onClick={onClose}/>
                </div>
                <div className="input-overlay-wrapper">
                    <Input
                        className="input-overlay"
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Какое слово найти?"
                        suffix={
                            <>
                            {numMatches > 0 && (
                                <span>{currentMatchIndex + 1} из {numMatches}</span>
                            )}
                            {numMatches === 0 && searchText !== "" && (<span style={{color: 'red'}}>0 из 0</span>)}
                            <UpOutlined onClick={handlePrevMatch}/>
                            <DownOutlined onClick={handleNextMatch}/>
                            </>
                        }
                    />
                </div>
                <Checkbox className="checkbox-overlay" onChange={onChange}>Учитывать регистр</Checkbox>
            </div>
        </div>
    );
};


const Messages = ({ selectedChat, chats, setChats, user, messages, setMessages, loadingAnswer, setLoadingAnswer, isColorChanged, minRows, setMinRows, newMessagesCount, setNewMessagesCount, isGenerate, setIsGenerate}) => {
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [copiedCodMessageId, setCopiedCodMessageId] = useState(null);
    const messagesEndRef = useRef(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [regeneratingMessage, setRegeneratingMessage] = useState(null);
    const [inputEditingText, setInputEditingText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [numMatches, setNumMatches] = useState(0);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
    const [matchingMessages, setMatchingMessages] = useState([]);
    const [isRegister, setIsRegister] = useState(false); 

    const [showScrollButton, setShowScrollButton] = useState(false);
    

    useEffect(() => {
        const messagesContainer = document.querySelector('.messages');
    
        const handleScrollVisibility = () => {
            if (messagesContainer) {
                const isScrolledToBottom = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight;
                setShowScrollButton(!isScrolledToBottom);
                if (isScrolledToBottom)  {
                    setNewMessagesCount(0);
                }
            }
        };
    
        if (messagesContainer) {
            messagesContainer.addEventListener('scroll', handleScrollVisibility);
            return () => {
                messagesContainer.removeEventListener('scroll', handleScrollVisibility);
            };
        }
    }, [messages]);    

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setNewMessagesCount(0);
    };

    let id_regenerate = 0;

    useEffect(() => {
        if (!searchText.trim()) {
            setMatchingMessages([]);
            setNumMatches(0);
            setCurrentMatchIndex(-1);
            return;
        }

        setMatchingMessages([]);
        const regexFlags = isRegister ? '' : 'i';
        const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Экранируем специальные символы
        const regex = new RegExp(escapedSearchText, regexFlags);
        const filtered = messages.filter(message => message.status_message_id === 1 && regex.test(message.content));
        setMatchingMessages(filtered);
        setNumMatches(filtered.length);
        setCurrentMatchIndex(filtered.length > 0 ? 0 : -1);
    }, [searchText, messages]);

    useEffect(() => {
        if (currentMatchIndex !== -1 && matchingMessages.length > 0) {
            const currentMatchingMessage = matchingMessages[currentMatchIndex];
            const currentMatchingMessageElement = document.getElementById(`message-${currentMatchingMessage.id}`);
            if (currentMatchingMessageElement) {
                currentMatchingMessageElement.scrollIntoView({ behavior: "auto" });
            }
        }
    }, [currentMatchIndex, matchingMessages]);

    const handlePrevMatch = () => {
        setCurrentMatchIndex((prevIndex) => (prevIndex <= 0 ? numMatches - 1 : prevIndex - 1));
    };

    const handleNextMatch = () => {
        setCurrentMatchIndex((prevIndex) => (prevIndex >= numMatches - 1 ? 0 : prevIndex + 1));
    };

    const highlightMatch = (content, messageId) => {
        if (!searchText.trim()) return content;
    
        const regex = new RegExp(`(${searchText})`, 'gi');
        return content.split(regex).map((part, index) => {
            const isMatch = isRegister ? (part === searchText) : (part.toLowerCase() === searchText.toLowerCase());
    
            if (isMatch) {
                if (matchingMessages[currentMatchIndex] && messageId === matchingMessages[currentMatchIndex].id) {
                    return <span key={index} style={{ backgroundColor: 'gold' }}>{part}</span>;
                } else {
                    return <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span>;
                }
            } else {
                return <span key={index}>{part}</span>;
            }
        });
    };
    
    const onChange = (e) => {
        setIsRegister(!isRegister);
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey && event.key === 'f') || (event.ctrlKey && event.key === 'F') || (event.ctrlKey && event.key === 'А') || (event.ctrlKey && event.key === 'а')) {
                event.preventDefault();
                setIsSearchVisible(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const closeSearch = () => {
        setMatchingMessages([]);
        setCurrentMatchIndex(-1);
        setIsSearchVisible(false);
        setSearchText("");
        setIsRegister(false);
    };


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
                        setLoading(false);
                }
            }
        };
        getMessages()
    }, [setMessages, selectedChat])  

    useEffect(() => {
        console.log("isEditing1:", isEditing);
    }, [isEditing]);

    useEffect(() => {
        console.log("isEditing2:", isRegenerating);
    }, [isRegenerating]);

    useEffect(() => {
        if(!isRegenerating && !isEditing && !isGenerate) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
        else {
            setIsRegenerating(false);
            setIsEditing(false);
            setIsGenerate(false);
        }
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
        navigator.clipboard.writeText(text.trim()
        .split("\n")
        .map(line => line.trim().split(/(?<=[.:!?{}[\]<"";])\s+/))
        .flat()
        .filter(sentence => {
            const trimmedSentence = sentence.trim();
            return trimmedSentence !== "" && !trimmedSentence.startsWith("Ответ") && !trimmedSentence.startsWith("Ответ на вопрос") && !trimmedSentence.startsWith("answer") && !trimmedSentence.startsWith("Answer") && /[.:!?{}[\]<"";]$/.test(trimmedSentence);
        }));
        setCopiedMessageId(messageId);
        setTimeout(() => {
            setCopiedMessageId(null); 
        }, 2000);
    };

    const copyToCodeClipboard = (text, messageId) => {
        navigator.clipboard.writeText(text.trim());
        setCopiedCodMessageId(messageId);
        setTimeout(() => {
            setCopiedCodMessageId(null); 
        }, 2000);
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

    const handleEdit = () => {
        setIsEditing(true);
        if (inputEditingText.trim() !== "") {
            const updateMessage = {
                content: inputEditingText,
                date_sending: new Date().toISOString(),
            };
        console.log("Измененное сообщение", updateMessage)
        console.log("id-изменяемого сообщения:", editingMessage);

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
                            updatedMessages = messages.filter(message => message.id !== editingMessage && message.id !== editingMessage + 1);
                            const message = { ...data.data, user_id: user.id, status_message_id: 1 };
                            updatedMessages.push(message);
                            const answer = messages.find(message => message.id === editingMessage + 1);
                            if (answer) {
                                answer.date_sending = new Date().toISOString();
                            }
                            updatedMessages.push(answer);
                            console.log("Обновленный список сообщений:", updatedMessages);
                            setMessages(updatedMessages);
                            updateLastMessageInChat(selectedChat.id, data.data);
                            setEditingMessage(null);
                            id_regenerate = data.data.id + 1;
                            console.log("id-ответа на сообщение:", id_regenerate);
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
                                // updatedMessages = updatedMessages.map(message => {
                                //     if (message.id === data.data.id) {
                                //         message = data.data;
                                //         message.user_id = user.id;
                                //         message.status_message_id = 2;
                                //         return message;
                                //     }
                                //     return message;
                                // });
                                updatedMessages = updatedMessages.filter(message => message.id !== id_regenerate);
                                const message = { ...data.data, user_id: user.id, status_message_id: 2 };
                                updatedMessages.push(message);
                                console.log("Обновленный список сообщений:", updatedMessages);
                                setIsRegenerating(true);
                                setLoadingAnswer(false);
                                setNewMessagesCount(1);
                                setRegeneratingMessage(null);
                                setMessages(updatedMessages);
                                updateLastMessageInChat(selectedChat.id, data.data);
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
                headers: { "Content-Type" : "application/json" },
            }      
            /**
             * отправка PUT-запроса на сервер
             */
            const url = "http://localhost:8000/messages_answer_regenerate/" + id
            console.log("url", url)
            return await  fetch(url, requestOptions)
                .then(response => response.json())
                        .then(
                            (data) => {
                            const updatedMessages = messages.map(message => {
                                if (message.id === data.data.id) {
                                    message = data.data;
                                    message.user_id = user.id;
                                    message.status_message_id = 2;
                                    return message;
                                }
                                return message;
                            });
                            console.log("Обновленный список сообщений:", updatedMessages);
                            setLoadingAnswer(false);
                            setNewMessagesCount(1);
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

<<<<<<< HEAD
    if (loading) {
        return <div className="div-loading-show-chat">
                  <div>
                    <Spin style={{ fontSize: 16, marginRight: 8, color: '#072E70'}} />
                       Загрузка...
                  </div>
                </div>;
    }

    return(
    <div className="messages">
    {isSearchVisible && (
        ReactDOM.createPortal(
            <SearchOverlay
                searchText={searchText}
                setSearchText={setSearchText}
                onClose={closeSearch}
                onChange={onChange}
                numMatches={numMatches}
                handlePrevMatch={handlePrevMatch}
                handleNextMatch={handleNextMatch}
                highlightMatch={highlightMatch}
                currentMatchIndex={currentMatchIndex}
            />,
            document.body
        )
    )}
    {selectedChat.id !== null && selectedChat.id !== undefined && messages && messages.length > 0 ? (
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
                                                <>
                                                    <div className="massage-div-edit">
                                                            <CloseOutlined className="close-edit-message-button" onClick={cancelEdit}/>
                                                        <div className="save-edit-message-button" onClick={handleEdit}>Сохранить</div>
                                                        <Input.TextArea className="input-editing" autoSize={{ minRows: minRows, maxRows: 3 }} placeholder="Напишите запрос" value={inputEditingText} onChange={(e) => setInputEditingText(e.target.value)} onKeyDown={handleInputEditingKeyPress}/>
                                                    </div> 
                                                    <div className="massage-div-request-edit">
                                                        <div className="date-sending-message-request">{new Date(message.date_sending).toLocaleTimeString()}</div>
                                                    </div> 
                                                </>) : 
                                            (
                                                <>
                                                    <div id={`message-${message.id}`} className="message-request" >{highlightMatch(message.content, message.id)}</div>
                                                    
                                                    <div className="massage-div-request-edit">
                                                        <Tooltip title="Редактировать" placement="bottom">
                                                            <EditOutlined className="edit-message-button" onClick={() => setEditingMessage(message.id)}/>
                                                        </Tooltip>
                                                        {copiedMessageId === message.id ? ( 
                                                                    <CheckOutlined className="confirmation-copy-message-request"/>) : (
                                                                    <>
                                                                        <Tooltip title="Копировать" placement="bottom">
                                                                            <CopyOutlined className="copy-message-button-request" onClick={() => copyToClipboard(message.content, message.id)}/>
                                                                        </Tooltip>
                                                                    </>
                                                        )}
                                                        <div className="date-sending-message-request">{new Date(message.date_sending).toLocaleTimeString()}</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            { regeneratingMessage === message.id ? (
                                                <div className="massage-div-answer">
                                                    <div className="massage-div-answer-text-avatar"> 
                                                        <Avatar className="massage-div-answer-avatar" src={avatarChatbot} size={40}><img src={avatarChatbot} size={20} alt="No messages" /></Avatar>
                                                        <div style={{marginTop: "8px", fontSize: "2.2vh", fontWeight: "bolder"}}>Panda-OS</div>
                                                    </div>
                                                    <div className="message-answer-loading" ><div className="loading">Генерирую для Вас ответ . . .</div></div>              
                                                </div>
                                            ) : (
                                                <div className="massage-div-answer" key={message.id}>
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
                                                                            return trimmedSentence !== "" && !trimmedSentence.startsWith("Ответ") && !trimmedSentence.startsWith("Ответ на вопрос") && !trimmedSentence.startsWith("answer") && !trimmedSentence.startsWith("Answer") && /[.:!?{}[\]<"";]$/.test(trimmedSentence);
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
                                                                <SyntaxHighlighter key={index} language="javascript" style={customVsLight}>
                                                                    {block.trim()}
                                                                </SyntaxHighlighter>
                                                                {copiedCodMessageId === index ? ( 
                                                                        <div className="copy-cod-button"><CheckOutlined className="copy-icon"/>  Скопировано!</div>) : (
                                                                        <>
                                                                            <div className="copy-cod-button" onClick={() => copyToCodeClipboard(block, index)}><CopyOutlined className="copy-icon"/>  Копировать код</div>
                                                                        </>
                                                                )}
                                                            </div>
                                                            );
                                                        })) : (
                                                            <div>Не могу дать ответ на Ваш вопрос. Попробуйте его уточнить или заменить.</div>
                                                        )}
                                                        </div>
                                                        <div className="massage-div-answer-settings">
                                                                    <div className="date-sending-message-answer">{new Date(message.date_sending).toLocaleTimeString()}</div>
                                                                {copiedMessageId === message.id ? ( 
                                                                    <CheckOutlined className="confirmation-copy-message"/>) : (
                                                                    <>
                                                                        <Tooltip title="Копировать" placement="bottom">
                                                                            <CopyOutlined className="copy-message-button" onClick={() => copyToClipboard(message.content, message.id)}/>
                                                                        </Tooltip>
                                                                    </>
                                                                )}
                                                                <Tooltip title="Регенерировать" placement="bottom">
                                                                    <RedoOutlined className="regenerate-message-button" onClick={()=>handleRegenerate(message.id)}/>
                                                                </Tooltip>       
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
    {showScrollButton && newMessagesCount === 0 && (<DownOutlined className="scroll-to-bottom-button" onClick={scrollToBottom}/>)}
    {newMessagesCount > 0 && showScrollButton && <Badge dot className="scroll-span" status="processing"><DownOutlined className="scroll-to-bottom-button-barge" onClick={scrollToBottom}/></Badge>}
    </div>
=======
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
                                                <div className="massage-div-answer">
                                                    <div className="massage-div-answer-text-avatar"> 
                                                        <Avatar className="massage-div-answer-avatar" src={avatarChatbot} size={40}><img src={avatarChatbot} size={20} alt="No messages" /></Avatar>
                                                        <div style={{marginTop: "8px", fontSize: "2.5vh", fontWeight: "bolder"}}>Chat Bot</div>
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
                                                        <RedoOutlined className="regenerate-message-button"/>
                                                    </div>
                                                </div>
                                            )}
                                </div>
                                
                            ))}
                        </div>
                    ))}
                    </>
                ) : (
                    <div className="div-image-no-messages">
                        Чем я могу Вам помочь?
                        <img style={{marginTop: "30px", width: "10vw", height: "17vh"}} src={isColorChanged ? noMessagesImageDark : noMessagesImageLight} alt="No messages" />
                    </div>
                )}
        <div id="messagesEndRef" ref={messagesEndRef} />
        </div>
>>>>>>> 2a1949bc795f4b122bc18afa76bb3fb425da6716
    )
};

export default Messages;