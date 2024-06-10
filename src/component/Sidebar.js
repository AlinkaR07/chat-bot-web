import React, { useState } from "react";
import { DeleteOutlined, PlusOutlined, SearchOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons"
import { Input, Tooltip } from "antd"

import './css/SideBar.css'
import UserInfo from './UserInfo';
import NewChatModal from './NewChatModal';

const Sidebar = ({chats, setChats, selectedChat, setSelectedChat, user, isColorChanged, setColorChanged}) => {
    const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [editingChatId, setEditingChatId] = useState(null);
    const [newChatName, setNewChatName] = useState("");
    const [errorName, setErrorName] = useState(false);

    const handleNewChat = () => {
        setIsCreatingNewChat(true);
    };

    const handleSaveNewChat = (newChatName, selectedModel) => {
        console.log(newChatName, selectedModel);
        let chatname;
        if (newChatName.trim() === "") {
            chatname = "Новый чат"
        }
        else chatname = newChatName;
        if (!errorName) {
        const newChat = {
            chat_name: chatname,
            date_creating: new Date().toISOString(),
            date_deleting: null,
            deleting: false,
        };
        const user_id = user.id;
        const type_nn_id = selectedModel;

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
                          let chat = data.data;
                            chat.user_id = user_id;
                            chat.type_nn_id = type_nn_id;
                          setChats(prevChats => prevChats.concat(data.data))
                          setIsCreatingNewChat(false);
                          setSelectedChat(chat);
                    },
                       (error) => console.log(error)  // Установить сообщения об ошибках
                  )
            }
             create()
        }
    };

    const handleCancelNewChat = () => {
        setIsCreatingNewChat(false);
    };

    const handleChatClick = (chat) => {
        setSelectedChat(chat);
        console.log("Открываем чат с ID:", chat.id);
    };


    const handleDeleteChat = (chatId) => {
        console.log(chatId);
        let updateChat = [];
        const indexToUpdate = chats.findIndex(chat => chat.id === chatId);
        updateChat = {
            chat_name: chats[indexToUpdate].chat_name,
            date_creating: chats[indexToUpdate].date_creating,
            date_deleting: new Date().toISOString(),
            deleting: true,
        };
        const update = async () => {
            /**
             * определение параметров запроса
             */
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "chat_name" : updateChat["chat_name"],
                    "date_creating" : updateChat["date_creating"],
                    "date_deleting" : updateChat["date_deleting"],
                    "deleting" : updateChat["deleting"],
                }),
            }      
            /**
             * отправка PUT-запроса на сервер
             */
            const url = "http://localhost:8000/chats/" + chatId
            console.log("url", url)
            return await  fetch(url, requestOptions)
                .then(response => response.json())
                        .then(
                            (data) => {
                            const updatedChats = chats.filter(chat => chat.id !== data.data.id);
                            console.log("Обвновленный список чатов:", updatedChats);
                            setChats(updatedChats);
                            if (selectedChat.id === chatId) {
                                setSelectedChat([]); // Сбрасываем выбранный чат, если удаленный чат был выбран
                            }
                        },
                        (error) => console.log(error)  // Установить сообщения об ошибках
                    )
            }
          update()
    };

    const groupChatsByDate = (chats) => {
        if (!Array.isArray(chats) || chats.length === 0) {
            return {};
        }

        const groupedChats = {};
        const months = {};
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
    
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
    
        chats.forEach(chat => {
            let chatDate;
            if(chat.last_message && chat.last_message.date_sending) {
                chatDate = new Date(chat.last_message.date_sending);
            } else {
                chatDate = new Date(chat.date_creating);
            }
            chatDate.setHours(0, 0, 0, 0);
    
            if (chatDate.getTime() === today.getTime()) {
                if (!groupedChats["Сегодня"]) {
                    groupedChats["Сегодня"] = [];
                }
                groupedChats["Сегодня"].push(chat);
            } else if (chatDate.getTime() === yesterday.getTime()) {
                if (!groupedChats["Вчера"]) {
                    groupedChats["Вчера"] = [];
                }
                groupedChats["Вчера"].push(chat);
            } else if (chatDate.getTime() > lastWeek.getTime()) {
                if (!groupedChats["Неделя назад"]) {
                    groupedChats["Неделя назад"] = [];
                }
                groupedChats["Неделя назад"].push(chat);
            } else {
                const monthYear = chatDate.toLocaleString('default', { month: 'long'}).charAt(0).toUpperCase() + chatDate.toLocaleString('default', { month: 'long'}).slice(1) + ' ' + chatDate.getFullYear();
                if (!months[monthYear]) {
                    months[monthYear] = [];
                }
                months[monthYear].push(chat);
            }
        });
    
        // Упорядочиваем чаты в каждой группе по убыванию
        Object.keys(groupedChats).forEach(key => {
            groupedChats[key].sort((a, b) => {
                if (a.last_message && a.last_message.date_sending && b.last_message && b.last_message.date_sending) {
                    return new Date(b.last_message.date_sending) - new Date(a.last_message.date_sending);
                } else {
                    return new Date(b.date_creating) - new Date(a.date_creating);
                }
            });
        });

        Object.keys(months).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateB - dateA;
        }).forEach(month => {
            groupedChats[month] = months[month];
        });
    
        return groupedChats;
    };
    
    const groupedChats = groupChatsByDate(chats);

    const handleEditChat = (chatId, chatName) => {
        setEditingChatId(chatId);
        setNewChatName(chatName);
    };

    const handleSaveEditChat = (chatId) => {
        if (newChatName.trim() !== "") {
            const chatToUpdate = chats.find(chat => chat.id === chatId);
        
        if (chatToUpdate) {
            const updatedChat = {
                ...chatToUpdate,
                chat_name: newChatName,
            };
        console.log("Измененный данные о чате:", updatedChat)

        let updatedChats = [];

        const update = async () => {
            /**
             * определение параметров запроса
             */
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "chat_name" : updatedChat["chat_name"],
                    "date_creating" : updatedChat["date_creating"],
                    "date_deleting" : updatedChat["date_deleting"],
                    "deleting" : updatedChat["deleting"]
                }),
            }      
            /**
             * отправка PUT-запроса на сервер
             */
            const url = "http://localhost:8000/chats/" + chatId
            return await  fetch(url, requestOptions)
                .then(response => response.json())
                        .then(
                            (data) => {
                            updatedChats = chats.map(chat => {
                                if (chat.id === data.data.id) {
                                    chat.chat_name = newChatName;
                                    return chat;
                                }
                                return chat;
                            });
                            console.log("Обновленный список чатов:", updatedChats);
                            setChats(updatedChats);
                            setEditingChatId(null);
                            setNewChatName("");
                        },
                        (error) => console.log(error)  // Установить сообщения об ошибках
                    )
            }
            update()
            }
        }
    };

    const handleCancelEditChat = () => {
        setEditingChatId(null);
        setNewChatName("");
    };

    const handleCancelSearch = () => {
        setIsSearchOpen(false);
        setSearchTerm("");
    }

    return (
        <div className="side-bar">
            <div className="div-create-new">
                <div className="chaty">Чаты</div>
                { !isSearchOpen  ? 
                    (<>
                        <Tooltip title="Поиск чата" placement="top">
                            <SearchOutlined className="button-search" onClick={() => setIsSearchOpen(!isSearchOpen)} />
                        </Tooltip> 
                    </>): 
                    (<>
                        <Tooltip title="Закрыть поиск" placement="top">
                            <CloseOutlined className="close-search" onClick={handleCancelSearch} />
                        </Tooltip> 
                    </>
                    )
                }
                <Tooltip title="Новый чат" placement="top">
                    <PlusOutlined type="primary" className="button-new-chat" onClick={handleNewChat} />
                </Tooltip>
            </div>
            {isSearchOpen && (
                <div className="search-bar">
                    <Input
                        className="search-bar-input"
                        type="text"
                        placeholder="Поиск..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            )}
            <div className="chat-list">
                {Object.entries(groupedChats).map(([date, chats]) => {
                    const filteredChats = chats.filter(chat => chat.chat_name.toLowerCase().includes(searchTerm.toLowerCase()));
                    if (filteredChats.length > 0) {
                        return (
                            <div key={date}>
                                <div className="date-group-chats">{date}</div>
                                {filteredChats.map((chat) => (
                                    <div key={chat.id} className={`chat-item ${selectedChat.id === chat.id ? "selected-chat" : ""}`} onClick={() => handleChatClick(chat)}>
                                        <div className="chat-item-header">
                                            {editingChatId === chat.id ? (
                                                <div className="chat-settings-div">
                                                    <Input
                                                        className="input-edit-chat"
                                                        value={newChatName}
                                                        onChange={(e) => setNewChatName(e.target.value)}
                                                        onPressEnter={() => handleSaveEditChat(chat.id)}
                                                        onBlur={handleCancelEditChat}
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    {chat.chat_name || `Чат ${chat.id}`}
                                                    <div className="chat-settings-div">
                                                        <Tooltip style={{ userSelect: "none"}} title="Удалить" placement="right">
                                                            <DeleteOutlined className="delete-chat-button" onClick={(event) =>{ event.stopPropagation(); handleDeleteChat(chat.id)}} />
                                                        </Tooltip>
                                                        <Tooltip style={{ userSelect: "none"}} title="Переименовать" placement="top">
                                                            <EditOutlined className="edit-chat-button" onClick={(event) =>{ event.stopPropagation(); handleEditChat(chat.id, chat.chat_name)}} />
                                                        </Tooltip>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "row" }}>
                                            <div className="chat-name">{chat.last_message && chat.last_message.date_sending ? (<>{chat.last_message.content.replace(/(?:Answer|Ответ|Ответ на вопрос):/i, '').substring(0, 25)}...</> ): (<></>)}</div>
                                            <div className="chat-createdAt">
                                                { chat.last_message && chat.last_message.date_sending ? ( 
                                                    <>
                                                        {new Date(chat.last_message.date_sending).toDateString() === new Date().toDateString() || new Date(chat.last_message.date_sending).toDateString() === new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toDateString() ? (
                                                            new Date(chat.last_message.date_sending).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                            ) : (new Date(chat.last_message.date_sending).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }))
                                                        }
                                                    </> ) : ( 
                                                        <>
                                                            {new Date(chat.date_creating).toDateString() === new Date().toDateString() || new Date(chat.date_creating).toDateString() === new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toDateString() ? (
                                                                new Date(chat.date_creating).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                                ) : (new Date(chat.date_creating).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }))
                                                            }
                                                        </>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    } else {
                        return null;
                    }
                })}
            </div>
            <div className="line-header"></div>
            <UserInfo isColorChanged={isColorChanged} selectedChat={selectedChat} setColorChanged={setColorChanged} user={user} />
            <NewChatModal
                visible={isCreatingNewChat}
                onCreate={handleSaveNewChat}
                onCancel={handleCancelNewChat}
                chats={chats}
                errorName={errorName}
                setErrorName={setErrorName}
            />
        </div>
    );
}

export default Sidebar;