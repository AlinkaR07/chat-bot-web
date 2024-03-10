import React, { useState, useEffect } from "react";
import { Flex, Layout} from "antd"
import './css/Home.css'


import Sidebar from "./Sidebar";
import Chat from "./Chat";
import NavBar from "./NavBar";
import UserInfo from "./UserInfo";


const Home = () => {

    const [chats, setChats] = useState([]);

    const [selectedChat, setSelectedChat] = useState(null);
    const [isColorChanged, setColorChanged] = useState(localStorage.getItem('isColorChanged') === 'true');


    useEffect(() => {
        const getChat = async () => {
                /**
                  * определение параметров запроса
                */
            const requestOptions = {
                method: 'GET'
            }

                 /**
                  * отправка GET-запроса на сервер
                */
            return await fetch("http://localhost:8000/chats", requestOptions)
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
                    <NavBar/>
                    <Sidebar chats={chats} setChats={setChats} selectedChat={selectedChat} setSelectedChat={setSelectedChat}/>
                    <Chat chats={chats} selectedChat={selectedChat} isColorChanged={isColorChanged}/>
                    <UserInfo isColorChanged={isColorChanged} setColorChanged={setColorChanged}/>
                </div>
            </Layout>
        </Flex>
    )
}

export default Home;