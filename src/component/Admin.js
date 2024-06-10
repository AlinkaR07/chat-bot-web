import React, { useState, useEffect } from "react";
import { Flex, Layout} from "antd"


import './css/Home.css'
import NavBarAdmin from "./NavBarAdmin";
import SidebarAdmin from "./SideBarAdmin";
import PanelAdminUser from "./PanelAdminUser";
import PanelAdminChats from "./PanelAdminChats";
import PanelAdminStatistic from "./PanelAdminStatistic";


const Admin = ({user, isColorChanged, setColorChanged}) => {
    const [chats, setChats] = useState([]);
    const [selectedItem, setSelectedItem] = useState("statistic");

    useEffect(() => {
        /**
        * Get-запрос на получение чатов
        */
        const getChat = async () => {
            const requestOptions = {
                method: 'GET'
            }
            return await fetch(`http://localhost:8000/chats`, requestOptions)
                .then(response => response.json())
                    .then(
                        (data) => {
                            console.log('Чаты:', data)
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
                    <NavBarAdmin isColorChanged={isColorChanged} />
                    <SidebarAdmin selectedItem={selectedItem} setSelectedItem={setSelectedItem} user={user} isColorChanged={isColorChanged} setColorChanged={setColorChanged}/>
                    {selectedItem === 'users' ? (<PanelAdminUser/>) : ("")}
                    {selectedItem === 'chaty' ? (<PanelAdminChats isColorChanged={isColorChanged}/>) : ("")}
                    {selectedItem === 'statistic' ? (<PanelAdminStatistic isColorChanged={isColorChanged}/>) : ("")}
                </div>
            </Layout>
        </Flex>
    )
}

export default Admin;