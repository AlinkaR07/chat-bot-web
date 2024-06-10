import React, { useState, useEffect } from "react";
import { PlusOutlined, CloseOutlined, UnlockOutlined, LockOutlined, SortAscendingOutlined, SortDescendingOutlined } from "@ant-design/icons"
import { Input, Tooltip, Button, Space, Table, Tag, Empty, Spin  } from "antd"

import './css/PanelAdmin.css'
import NewUserModal from "./NewUserModal";
import EditUserModal from "./EditUserModal";

const { Column } = Table;

const CustomCascader = ({ options, value, onChange }) => {
    console.log("options", options)
    return (
        <select className="cascader-group-users" value={value} onChange={(e) => onChange([e.target.value])}>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    );
  }

const PanelAdminUser = () => {
    const [selectedGroup, setSelectedGroup] = useState("1");
    const [selectedStatus, setSelectedStatus] = useState("1");
    const [searchName, setSearchName] = useState("");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);
    const [isEditUser, setIsEditUser] = useState(false);
    const [editingUser, setEditingUser] = useState([]);
    const [sortOrder, setSortOrder] = useState('asc');
    const [pageSize, setPageSize] = useState(Math.floor(window.innerHeight / 130));
    const [loading, setLoading] = useState(true);
    const [isCopyEmail, setIsCopyEmail] = useState(false);
    
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
                            console.log('Users:', data.data)
                            const usersWithStatus = data.data.map((user, index) => {
                                return {
                                    ...user,
                                    key: user.id,
                                    bloking: [{ bloking: user.bloking }],
                                    status: [{ status: user.status }],
                                    date_registration: formatDatePoint(user.date_registration),
                                    date_lastAuth: formatDatePoint(user.date_lastAuth), 
                                };
                            });
                            console.log('Пользователи:', usersWithStatus.filter(user => user.confirmed === true));
                            setUsers(usersWithStatus.filter(user => user.confirmed === true));
                            setFilteredUsers(usersWithStatus.filter(user => user.confirmed === true));
                            setLoading(false);
                        },
                        (error) => {
                            console.log(error)   // Установить сообщения об ошибках
                        }
                    )
        }
        getUsers()

        const handleResize = () => {
            setPageSize(Math.floor(window.innerHeight / 130));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
        
    }, [setUsers])


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
            label: 'Заблокированные',
          },
      ];

      const status_user = [
        {
            value: '1',
            label: 'Все',
          },
        {
          value: '2',
          label: 'Пользователи',
        },
        {
          value: '3',
          label: 'Админ',
        },
      ];


      const handleUnBloking = (id) => {
        console.log(id);
        console.log(users);
        let updateUser = [];
        const indexToUpdate = users.findIndex(user => user.id === id);
        if (indexToUpdate !== -1) {
            updateUser = {
                ...users[indexToUpdate],
                status: users[indexToUpdate].status[0].status,
                bloking: !users[indexToUpdate].bloking[0].bloking
            };
        const updatedUsers = [...users];

        let date_last;
        if(updateUser.date_lastAuth === undefined){
          date_last = null;
        }
        else date_last = formatDateDash(updateUser.date_lastAuth);

        updatedUsers[indexToUpdate] = updateUser;
        updateUser.date_registration = formatDateDash(updateUser.date_registration);
        updateUser.date_lastAuth = date_last;

        }
        console.log("updatePUT", updateUser);

        const update = async () => {
            /**
             * определение параметров запроса
             */
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    "name_user": updateUser["name_user"],
                    "password": updateUser["password"],
                    "email_user": updateUser["email_user"],
                    "photo": updateUser['photo'],
                    "date_registration": updateUser["date_registration"],
                    "date_lastAuth": updateUser["date_lastAuth"],
                    "status": updateUser["status"],
                    "bloking": updateUser["bloking"],
                    "confirmed": updateUser["confirmed"],
                }),
            }      
            /**
             * отправка PUT-запроса на сервер
             */
            const url = "http://localhost:8000/user/" + id;
            console.log("url", url)
            return await  fetch(url, requestOptions)
                .then(response => response.json())
                        .then(
                            (data) => {
                            console.log('Data:', data.data)
                            const updatedUsers = filteredUsers.map(user => {
                                if (user.id === data.data.id) {
                                    user = data.data;
                                    user.bloking = [{ bloking: user.bloking }];
                                    user.status = [{ status: user.status }];
                                    user.date_registration = formatDatePoint(user.date_registration);
                                    user.date_lastAuth = formatDatePoint(user.date_lastAuth);
                                    return user;
                                }
                                return user;
                            });
                            console.log("Пользователи:", updatedUsers);
                            setFilteredUsers(updatedUsers);
                            handleApplayFilter(updatedUsers, selectedGroup, selectedStatus, searchName);  
                        },
                        (error) => console.log(error)  // Установить сообщения об ошибках
                    )
            }
             update()
    };


    const formatDatePoint = (date) => {
        if(date !== null && date !== undefined) {
            const parts = date.split('.');
            const reconstructedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            const day = String(reconstructedDate.getDate()).padStart(2, '0');
            const month = String(reconstructedDate.getMonth() + 1).padStart(2, '0');
            const year = reconstructedDate.getFullYear();
            return `${day}.${month}.${year}`;
        }
    };

    const formatDateDash = (date) => {
        if(date !== null && date !== undefined) {
            const parts = date.split('.');
            const reconstructedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            const day = String(reconstructedDate.getDate()).padStart(2, '0');
            const month = String(reconstructedDate.getMonth() + 1).padStart(2, '0');
            const year = reconstructedDate.getFullYear();
            return `${year}-${month}-${day}`;
        }
    };

    const handleCascaderChange = (value, type) => {
        if (type === 'group') {
            setSelectedGroup(value);
            handleApplayFilter(filteredUsers, value, selectedStatus, searchName);
            console.log("selectedGroup", value)
        } else if (type === 'status') {
            setSelectedStatus(value);
            console.log("selectedStatus", value)
            handleApplayFilter(filteredUsers, selectedGroup, value, searchName);
        }
    }

    const handleSearchChange = (e) => {
        setSearchName(e.target.value);
        handleApplayFilter(filteredUsers, selectedGroup, selectedStatus, e.target.value);
    }

    const handleApplayFilter = (items, selectedGroup, selectedStatus, searchName) => {
        let filtered = items;

        if (selectedGroup) {
            if (selectedGroup[0] === '2'){
            filtered = filtered.filter(user => user.bloking[0].bloking === false);
            }
            else if (selectedGroup[0] === '3'){
                filtered = filtered.filter(user => user.bloking[0].bloking === true);
            }
        }

        if (selectedStatus) {
            if(selectedStatus[0] === '2') {
                filtered = filtered.filter(user => user.status[0].status === 'Пользователь');
            }
            else if(selectedStatus[0] === '3'){
                filtered = filtered.filter(user => user.status[0].status === 'Админ');
            }
        }

        if (searchName && searchName.trim() !== '') {
            filtered = filtered.filter(user => user.name_user.toLowerCase().includes(searchName.toLowerCase()));
        }
        setUsers(filtered);
    }

    const handleClearFilter = () => {
        setSearchName("");
        setSelectedGroup("1");
        setSelectedStatus("1");
        setUsers(filteredUsers);
    }


    const handleNewUser = () => {
        setIsCreatingNewUser(true);
    };

    const handleEditUser = (item) => {
        setIsEditUser(true);
        setEditingUser(item);
        console.log(item);
    };

    const handleSortByName = () => {
        const sortedUsers = [...users]; // Создаем копию массива пользователей
        if (sortOrder === 'asc') {
            sortedUsers.sort((a, b) => a.name_user.localeCompare(b.name_user)); // Сортируем по возрастанию
            setSortOrder('desc'); // Устанавливаем порядок сортировки в обратном направлении
        } else {
            sortedUsers.sort((a, b) => b.name_user.localeCompare(a.name_user)); // Сортируем по убыванию
            setSortOrder('asc'); // Устанавливаем порядок сортировки в обычном направлении
        }
        setUsers(sortedUsers); // Обновляем состояние пользователей с отсортированным массивом
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setIsCopyEmail(true);
        setTimeout(() => {
             setIsCopyEmail(false); 
        }, 2000);
    };
    
    const EmailColumn = ({ email }) => {
        return (
            <Tooltip title={isCopyEmail ? "Email скопирован" : "Скопировать email"}>
                <span className="span-email" style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(email)}>
                    {email}
                </span>
            </Tooltip>
        );
    };

    return(
        <div className="item">
            <div className="header">
                <div className="item-header">Пользователи</div>
                <Tooltip title="Новый пользователь" placement="top" className="tool">
                    <Button className="button-new-user" onClick={handleNewUser}><PlusOutlined />Пользователь</Button>
                </Tooltip>
            </div>
            <div className="user-settings">
                <div className="user-settings-list">
                    <div className="filters">
                        <div className="group-filter-users">Группы:</div>
                        <CustomCascader options={group} value={selectedGroup} onChange={(value) => handleCascaderChange(value, 'group')} />
                        <div className="group-filter-users">Статус:</div>
                        <CustomCascader options={status_user} value={selectedStatus} onChange={(value) => handleCascaderChange(value, 'status')} />
                        <div className="name-filter">Имя пользователя:</div>
                        <Input className="input-name-filter-users" value={searchName} onChange={handleSearchChange}/>
                    </div>
                    <div className="filters">
                        <div className="button-filter">
                            <Button className="button-clear" onClick={handleClearFilter}><CloseOutlined />Сбросить все фильтры</Button>
                        </div>
                    </div>
                </div>
            </div>
            {users.length > 0 && !loading ? (
            <Table dataSource={ users } pagination={{ pageSize: pageSize, size: "small" }} key="table">
                <Column
                    dataIndex="bloking"
                    key="bloking"
                    align="center"
                    width={10}
                    render={(bloking, record) => (
                        <>
                            {bloking.map((item) => (
                                <Tag color={'transparent'} key={record.id}>
                                    {item.bloking === true ? <LockOutlined className="activation-icon-bloking"/> : <UnlockOutlined className="activation-icon"/>}
                                </Tag>
                            ))}
                        </>
                    )}
                />
                <Column title={<div className="column-name">
                                    <div>Имя пользователя</div>
                                    {sortOrder === 'asc' && <SortAscendingOutlined onClick={handleSortByName}/>}
                                    {sortOrder === 'desc' && <SortDescendingOutlined onClick={handleSortByName}/>}
                                </div>} 
                        dataIndex="name_user" 
                        key="name_user"
                        width="17vw"
                />
                <Column title="Электронная почта/Логин" dataIndex="email_user" key="email_user" width="17vw" render={(text) => <EmailColumn email={text} />}/>
                <Column title="Дата регистрации" dataIndex="date_registration" key="date_registration" align="center"/>
                <Column title="Дата последней авторизации" dataIndex="date_lastAuth" key="date_lastAuth" align="center"/>
                <Column
                    title="Статус"
                    dataIndex="status"
                    key="status"
                    align="center"
                    render={(status, record) => (
                        <>
                            {status.map((item) => (
                                <Tag width="2vw" color={item.status.length > 5 ? 'geekblue' : 'green'} key={record.id}>
                                    {item.status.toUpperCase()}
                                </Tag>
                            ))}
                        </>
                    )}
                />
                <Column
                    title="Действия"
                    dataIndex="bloking"
                    key="action"
                    align="center"
                    width="12vw"
                    render={(bloking, record) => (
                        <>
                            {bloking.map((item) => (
                                <Space key={record.id}>
                                    {item.bloking === true ? (
                                        <div className="edit-user" onClick={()=>handleUnBloking(record.id)}>Разблокировать</div>
                                    ) : (
                                        <>
                                            {record.status[0].status === 'Админ' ? (<div className="edit-user" onClick={() => handleEditUser(record)}>Изменить</div>) : (
                                                <>
                                                    <div className="edit-user" onClick={() => handleEditUser(record)}>Изменить</div>
                                                    <div className="block-user" onClick={()=>handleUnBloking(record.id)}>Заблокировать</div>
                                                </>
                                            )}
                                        </>
                                    )}
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
            <NewUserModal
                visible={isCreatingNewUser}
                users={users}
                setUsers={setUsers}
                setIsCreatingNewUser={setIsCreatingNewUser}
            />
            <EditUserModal
                visible={isEditUser}
                setIsEditUser={setIsEditUser}
                editingUser={editingUser}
                setFilteredUsers={setFilteredUsers}
                handleApplayFilter={handleApplayFilter}
                filteredUsers={filteredUsers}
            />
        </div>
    )
}

export default PanelAdminUser

