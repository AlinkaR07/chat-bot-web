import React, { useState, useEffect } from "react";
import { CloseOutlined, InboxOutlined, SortAscendingOutlined, SortDescendingOutlined, CaretRightOutlined } from "@ant-design/icons"
import { Input, Button, Table, Tag, Space, DatePicker, Empty, Spin } from "antd"

import './css/PanelAdmin.css'
import MessagesShowChat from "./MessagesShowChat";

const { Column } = Table;


const CustomCascader = ({ options, value, onChange }) => {
    console.log("options", options)
    return (
        <select className="cascader-group-chats" value={value} onChange={(e) => onChange([e.target.value])}>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    );
  }

const PanelAdminUser = ({isColorChanged}) => {
    const [selectedGroup, setSelectedGroup] = useState("1");
    const [searchNameUser, setSearchNameUser] = useState("");
    const [searchNameChat, setSearchNameChat] = useState("");
    const [users, setUsers] = useState([]);
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState([]);
    const [creationDateFilter, setCreationDateFilter] = useState(null);
    const [deletionDateFilter, setDeletionDateFilter] = useState(null);
    const [creationDatePickerValue, setCreationDatePickerValue] = useState(null);
    const [deletionDatePickerValue, setDeletionDatePickerValue] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [pageSize, setPageSize] = useState(Math.floor(window.innerHeight / 130));
    const [showChat, setShowChats] = useState(null);
    const [loading, setLoading] = useState(true);

    const group = [
        {
          value: '1',
          label: 'Все',
        },
        {
          value: '2',
          label: 'Активные',
        },
        {
            value: '3',
            label: 'Архив',
          },
      ];
    
    useEffect(() => {
        /**
        * Get-запрос на получение пользователей
        */
        const getUsers = async () => {
            const requestOptions = {
                method: 'GET'
            }
            return await fetch(`http://localhost:8000/user`, requestOptions)
                .then(response => response.json())
                    .then(
                        (data) => {
                            const usersPanelChat = data.data.map((user, index) => {
                                return {
                                    ...user,
                                    key: user.id,
                                };
                            });
                            console.log('Пользователи в панели чатов:', usersPanelChat);
                            setUsers(usersPanelChat);
                            return usersPanelChat; 
                        },
                        (error) => {
                            console.log(error)   // Установить сообщения об ошибках
                        }
                    )
        }
        getUsers().then((usersPanelChat) => { 
            const getChats = async () => {
                const requestOptions = {
                    method: 'GET'
                }
                return await fetch(`http://localhost:8000/chats`, requestOptions)
                    .then(response => response.json())
                        .then(
                            (data) => {
                                const Chats = data.data.map((chat) => {
                                    const user = usersPanelChat.find((user) => user.id === chat.user_id); 
                                    return {
                                        ...chat,
                                        key: chat.id,
                                        user_name: user ? user.name_user : "Unknown",
                                        deleting: [{deleting: chat.deleting}],
                                        date_creating: formatDatePoint(chat.date_creating),
                                        date_deleting: formatDatePoint(chat.date_deleting)
                                    };
                                });
                                console.log('Чаты в панели чатов:', Chats);
                                setChats(Chats);
                                setFilteredChats(Chats);
                                setLoading(false);
                            },
                            (error) => {
                                console.log(error)   // Установить сообщения об ошибках
                            }
                        )
            }
            getChats()

            const handleResize = () => {
                setPageSize(Math.floor(window.innerHeight / 130));
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        });
    }, [setUsers, setChats])
    

      const handleApplayFilter = (items, selectedGroup, searchNameChat, searchNameUser, dateCreating, dateDeleting) => {
        let filtered = items;

        if (selectedGroup) {
            if (selectedGroup[0] === '2'){
            filtered = filtered.filter(chat => chat.deleting[0].deleting === false);
            }
            else if (selectedGroup[0] === '3'){
                filtered = filtered.filter(chat => chat.deleting[0].deleting === true);
            }
        }

        if (searchNameUser.trim() !== '') {
            filtered = filtered.filter(chat => chat.user_name.toLowerCase().includes(searchNameUser.toLowerCase()));
        }

        if (searchNameChat.trim() !== '') {
            filtered = filtered.filter(chat => chat.chat_name.toLowerCase().includes(searchNameChat.toLowerCase()));
        }

        if (dateCreating !== null) {
            filtered = filtered.filter(chat => {
                const formattedDate = formatDate(chat.date_creating); 
                return formattedDate === dateCreating;
            });
            console.log(filtered);
        }

        if (dateDeleting !== null) {
            filtered = filtered.filter(chat => {
                if (chat.date_deleting) {
                    const formattedDate = formatDate(chat.date_deleting);
                    return formattedDate === dateDeleting;
                } else {
                    return false; 
                }
            });
            console.log(filtered);
        }

        setChats(filtered);
    }

    const formatDate = (dateTimeString) => {
        const parts = dateTimeString.split(',').map(part => part.trim()); 
        const date = parts[0];
        return date;
    };

    const handleClearFilter = () => {
        setSearchNameUser("");
        setSearchNameChat("");
        setSelectedGroup("1");
        setCreationDateFilter(null);
        setDeletionDateFilter(null);
        setCreationDatePickerValue(null); // Очистить значение DatePicker
        setDeletionDatePickerValue(null); // Очистить значение DatePicker
        setChats(filteredChats);
    }

    const formatDatePoint = (dateString) => {
        const date = new Date(dateString);
        if (dateString === null) {
            return null;
        } else {
            date.setHours(date.getHours() + 3);

            const options = {
                hour: 'numeric',
                minute: 'numeric',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                timeZone: 'UTC' 
            };
            const formatter = new Intl.DateTimeFormat('ru-RU', options);
            return formatter.format(date);
        }
    };

    const formatDatePointFilter = (dateString) => {
        const date = new Date(dateString);
        if(dateString === null){
            return null
        } else {
            const options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            };
            const formatter = new Intl.DateTimeFormat('ru-RU', options); 
            return formatter.format(date);
        }
    };

    const handleDeleteChat = async (chatId) => {    
        let deleteMessages=[];
    
        const getMessages = async () => {
            if (chatId !== null && chatId !== undefined) {
                try {
                    const response = await fetch(`http://localhost:8000/messages/chat/${chatId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch messages');
                    }
                    const data = await response.json();
                    deleteMessages = data.data;
                    console.log("Удаленные сообщения из чата:", deleteMessages);
                    await deleteSelectedMessages();
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };
        
        const deleteSelectedMessages = async () => {
            try {
                for (const message of deleteMessages) {
                    const deleteResponse = await fetch(`http://localhost:8000/messages/${message.id}`, {
                        method: 'DELETE'
                    });
                    if (!deleteResponse.ok) {
                        throw new Error(`Failed to delete message with id ${message.id}`);
                    }
                    console.log(`Сообщения с id ${message.id} успешно удалены!`);
                }
            } catch (error) {
                console.error('Ошибка удаления сообщений:', error);
            }
        };
    
        await getMessages(); 
    
        const requestOptions = {
            method: 'DELETE'
        };
        
        try {
            const response = await fetch(`http://localhost:8000/chats/${chatId}`, requestOptions);
            if (response.ok) {
                console.log("Удален чат с ID:", chatId);
                setChats(chats.filter(chat => chat.id !== chatId)); 
                if (selectedChat.id === chatId) {
                    setSelectedChat([]); 
                }
            } else {
                throw new Error("Ошибка при удалении чата");
            }
        } catch (error) {
            console.error('Ошибка удаления чата:', error);
        }
    }; 

    const handleCascaderChange = (value) => {
        setSelectedGroup(value);
        console.log("selectedGroup", selectedGroup)
        handleApplayFilter(filteredChats, value, searchNameChat, searchNameUser, creationDateFilter, deletionDateFilter);
    }

    const handleSearchChangeUser = (e) => {
        setSearchNameUser(e.target.value);
        handleApplayFilter(filteredChats, selectedGroup, searchNameChat, e.target.value, creationDateFilter, deletionDateFilter);
    }

    const handleSearchChangeChat = (e) => {
        setSearchNameChat(e.target.value);
        handleApplayFilter(filteredChats, selectedGroup, e.target.value, searchNameUser, creationDateFilter, deletionDateFilter);
    }

    const handleCreationDateChange = (date) => {
        const formattedDate = formatDatePointFilter(date);
        setCreationDateFilter(formattedDate);
        setCreationDatePickerValue(date);
        handleApplayFilter(filteredChats, selectedGroup, searchNameChat, searchNameUser, formattedDate, deletionDateFilter);
    };

    const handleDeletionDateChange = (date) => {
        const formattedDate = formatDatePointFilter(date);
        setDeletionDateFilter(formattedDate);
        setDeletionDatePickerValue(date);
        handleApplayFilter(filteredChats, selectedGroup, searchNameChat, searchNameUser, creationDateFilter, formattedDate);
    };

    const handleSortByName = () => {
        const sortedChats = [...chats]; 
        if (sortOrder === 'asc') {
            sortedChats.sort((a, b) => a.chat_name.localeCompare(b.chat_name)); // Сортируем по возрастанию
            setSortOrder('desc'); 
        } else {
            sortedChats.sort((a, b) => b.chat_name.localeCompare(a.chat_name)); // Сортируем по убыванию
            setSortOrder('asc'); 
        }
        setChats(sortedChats); 
    };


    const handleSortByUser = () => {
        const sortedChats = [...chats]; 
        if (sortOrder === 'asc') {
            sortedChats.sort((a, b) => a.user_name.localeCompare(b.user_name)); // Сортируем по возрастанию
            setSortOrder('desc'); 
        } else {
            sortedChats.sort((a, b) => b.user_name.localeCompare(a.user_name)); // Сортируем по убыванию
            setSortOrder('asc'); 
        }
        setChats(sortedChats); 
    };

    const handleShowChat = async (chat) => {   
        setShowChats(chat);
        console.log("Show Chat:", chat);
    }

    const handleCloseShowChat = async () => {   
        setShowChats(null);
    }

    return(
        <div className="item">
            {showChat == null ? 
            ( <>
            <div className="header">
                <div className="item-header">Чаты</div>
            </div>
            <div className="user-settings">
                <div className="user-settings-list">
                    <div className="filters-rows">
                        <div className="filters-chats">
                            <div className="group-filter-chats">Группы:</div>
                            <CustomCascader options={group} value={selectedGroup} onChange={(value) => handleCascaderChange(value)} />
                            <div className="name-filter">Имя пользователя:</div>
                            <Input className="input-name-filter-chats" value={searchNameUser} onChange={handleSearchChangeUser}/>
                            <div className="name-filter">Название чата:</div>
                            <Input className="input-name-filter-chats" value={searchNameChat} onChange={handleSearchChangeChat}/>
                        </div>
                        <div className="filters-chats">
                            <div className="name-filter">Дата создания:</div>
                            <DatePicker
                                className="date-filter"
                                value={creationDatePickerValue}
                                onChange={handleCreationDateChange}
                                placeholder="Выберите дату создания"
                            />
                            <div className="name-filter">Дата удаления:</div>
                            <DatePicker
                                className="date-filter"
                                value={deletionDatePickerValue}
                                onChange={handleDeletionDateChange}
                                placeholder="Выберите дату создания"
                            />
                            <div className="button-filter">
                                <Button className="button-clear" onClick={handleClearFilter}><CloseOutlined />Сбросить все фильтры</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {chats.length > 0 && !loading ? (
                        <Table dataSource={chats} pagination={{ pageSize: pageSize, size: "small" }}>
                            <Column
                                dataIndex="deleting"
                                key="deleting"
                                align="center"
                                width={10}
                                render={(deleting, record) => (
                                    <>
                                        {deleting.map((item) => (
                                            <Tag color={'transparent'} key={record.id}>
                                                {item.deleting === true ? <InboxOutlined className="icon-title-card"/> : ""}
                                            </Tag>
                                        ))}
                                    </>
                                )}
                            />
                            <Column title={<div className="column-name">
                                                <div>Название чата</div>
                                                {sortOrder === 'asc' && <SortAscendingOutlined onClick={handleSortByName}/>}
                                                {sortOrder === 'desc' && <SortDescendingOutlined onClick={handleSortByName}/>}
                                            </div>} 
                                    dataIndex="chat_name" 
                                    key="chat_name"
                                    width="10vw"
                            />
                            <Column title={<div className="column-name">
                                                <div>Пользователь</div>
                                                {sortOrder === 'asc' && <SortAscendingOutlined onClick={handleSortByUser}/>}
                                                {sortOrder === 'desc' && <SortDescendingOutlined onClick={handleSortByUser}/>}
                                            </div>} 
                                    dataIndex="user_name" 
                                    key="user_name"
                                    width="10vw"
                            />
                            <Column title="Дата создания" dataIndex="date_creating" key="date_creating" align="center"/>
                            <Column title="Дата удаления" dataIndex="date_deleting" key="date_deleting" align="center" render={(date) => date ? date : '-'}/>
                            <Column
                                title="Действия"
                                dataIndex="deleting"
                                key="action"
                                align="center"
                                width="12vw"
                                render={(deleting, record) => (
                                    <>
                                        {deleting.map((item) => (
                                            <Space key={record.id}>
                                                <div className="edit-user" onClick={()=>handleShowChat(record)}>Просмотреть</div>
                                                <div className="delete-chat" onClick={()=>handleDeleteChat(record.id)}>Удалить</div>
                                            </Space>
                                        ))}
                                    </>
                                )}
                            />
                        </Table>
            ) : (
                <>
                {loading && <div className="div-loading-show-chat">
                                <div>
                                <Spin  style={{ fontSize: 16, marginRight: 8, color: '#072E70'}} />
                                    Загрузка...
                                </div>
                            </div>
                }
                {!loading && <div className="div-empty"><Empty image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg" imageStyle={{height: 60}} description="Нет удовлетворяющих фильтры данных"/></div>}
                </>
            )}
            </>) : (
                <>
                    <div className="tab">
                        <div className="tab-header" onClick={handleCloseShowChat}>Чаты</div>
                        <CaretRightOutlined className="tab-icon"/>
                        <div className="tab-header-select">{showChat.chat_name}</div>
                    </div>
                    <MessagesShowChat selectedChat={showChat}/>
                </>
            )}
        </div>
    )
}

export default PanelAdminUser

