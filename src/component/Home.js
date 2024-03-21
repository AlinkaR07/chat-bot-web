import React, { useState, useEffect } from "react";
import { Flex, Layout} from "antd"
import './css/Home.css'


import Sidebar from "./Sidebar";
import Chat from "./Chat";
import NavBar from "./NavBar";
import UserInfo from "./UserInfo";


const Home = ({user}) => {

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [isColorChanged, setColorChanged] = useState(localStorage.getItem('isColorChanged') === 'true');


    useEffect(() => {
        /**
        * Get-запрос на получение чатов
        */
        const getChat = async () => {
            const requestOptions = {
                method: 'GET'
            }
            return await fetch(`http://localhost:8000/chats/user/${user.id}`, requestOptions)
                .then(response => response.json())
                    .then(
                        (data) => {
                            console.log('Chats:', data)
                            setChats(data.data);
                        },
                        (error) => {
                            console.log(error)   // Установить сообщения об ошибках
                        }
                    )
        }
        getChat()
    }, [setChats])

    return(
        <Flex gap="middle" wrap="wrap">
            <Layout >
                <div className="chats-page">
                    <NavBar isColorChanged={isColorChanged}/>
                    <Sidebar chats={chats} setChats={setChats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} user={user}/>
                    <Chat chats={chats} selectedChat={selectedChat} isColorChanged={isColorChanged} user={user}/>
                    <UserInfo isColorChanged={isColorChanged} setColorChanged={setColorChanged} user={user}/>
                </div>
            </Layout>
        </Flex>
    )
}

export default Home;