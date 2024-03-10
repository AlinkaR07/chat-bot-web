import React from "react";
import { LoginOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Input } from 'antd';

import './css/Login.css'


const Login = () => {
    const navigate = useNavigate();

    const handleLogin = async () => {
        navigate('/home');
    }

    return(
        <div className = "login-page">
            <div className="login-card">
                <h2>Добро пожаловать!</h2>
                <Input size="large" className="login-user" placeholder="Введите логин" prefix={<UserOutlined style={{color: '#4285f4'}}/>} />
                <Input.Password className="login-password" placeholder="Введите пароль" iconRender={(visible) => (visible ? <EyeTwoTone style={{color: '#4285f4'}} /> : <EyeInvisibleOutlined style={{color: '#4285f4'}} />)}/>
                <div className="login-button" onClick={handleLogin}>
                     Войти <LoginOutlined />
                </div>
                <br/><br/>
                
            </div>
        </div>
    )
}

export default Login;