import React, { useState, useEffect } from "react";
import { Flex, Layout} from "antd"
import './css/Home.css'


import Sidebar from "./Sidebar";
import Chat from "./Chat";
import NavBar from "./NavBar";


const Home = ({user, isColorChanged, setColorChanged}) => {

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState([]);

    useEffect(() => {
        const getChat = async () => {
            const requestOptions = {
                method: 'GET'
            };
    
            try {
                // Получаем список чатов
                const chatResponse = await fetch(`http://localhost:8000/chats/user/${user.id}`, requestOptions);
                if (!chatResponse.ok) {
                    throw new Error('Failed to fetch chats');
                }
                const chatData = await chatResponse.json();
                console.log('Чаты:', chatData);
    
                if (chatData.status !== 'error') {
                    const filteredChats = chatData.data.filter(chat => !chat.deleting);
                    filteredChats.sort((a, b) => new Date(a.date_creating).getTime() - new Date(b.date_creating).getTime());
                    // Для каждого чата получаем последнее сообщение
                    const updatedChats = await Promise.all(filteredChats.map(async chat => {
                        const messageResponse = await fetch(`http://localhost:8000/messages/chat/${chat.id}/last`, requestOptions);
                        if (!messageResponse.ok) {
                            throw new Error('Failed to fetch last message for chat ' + chat.id);
                        }
                        const messageData = await messageResponse.json();
                        return {
                            ...chat,
                            last_message: messageData.data
                        };
                    }));

                    console.log(updatedChats)
                    if (updatedChats.length > 0) {
                        // Сортировка чатов по времени отправки последнего сообщения
                        updatedChats.sort((a, b) => {
                            const lastMessageA = a.last_message;
                            const lastMessageB = b.last_message;
                            if (!lastMessageA && !lastMessageB) return 0;
                            if (!lastMessageA) return 1;
                            if (!lastMessageB) return -1;
                            return new Date(lastMessageB.date_sending) - new Date(lastMessageA.date_sending);
                        });
                        setSelectedChat(updatedChats[0]);
                    }
                    setChats(updatedChats);
                }
            } catch (error) {
                console.error('Error fetching chats:', error);
            }
        };
    
        getChat();
    }, [setChats, setSelectedChat, user.id]);


    return(
        <Flex gap="middle" wrap="wrap">
            <Layout >
                <div className="chats-page">
                    <NavBar isColorChanged={isColorChanged}/>
                    <Sidebar chats={chats} setChats={setChats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} user={user} isColorChanged={isColorChanged} setColorChanged={setColorChanged}/>
                    <Chat chats={chats} setChats={setChats} selectedChat={selectedChat} isColorChanged={isColorChanged} user={user}/>
                </div>
            </Layout>
        </Flex>
    )
}

export default Home;