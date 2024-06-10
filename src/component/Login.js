import React, { useState} from "react";
import { LoginOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Input } from 'antd';


import './css/Login.css'


const Login = ({user, setUser}) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error,  setError] = useState(null);


    const handleLogin = async () => {
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);
    
            const response = await fetch(`http://localhost:8000/token`, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.access_token);

                const userResponse = await fetch(`http://localhost:8000/user_auth`, {
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`
                    }
                });
            
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData);
                    setError(false);
                    navigate('/home');
                } else {
                    setError(true);
                    throw new Error('Ошибка аутентификации');
                }
            } else {
                setError(true);
                throw new Error('Ошибка аутентификации');  
            }
        } catch (error) {
            console.error('Сетевая ошибка:', error);
            setError(true);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value); // Обновляем значение электронной почты при изменении поля ввода
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value); // Обновляем значение электронной почты при изменении поля ввода
    }

    return(
        <div className = "login-page">
            <div className="login-card">
                <h2>Добро пожаловать!</h2>
                <Input size="large" className="login-user" placeholder="Введите логин" prefix={<UserOutlined style={{color: '#4285f4'}}/>} onChange={handleEmailChange}/>
                <Input.Password className="login-password" placeholder="Введите пароль" iconRender={(visible) => (visible ? <EyeTwoTone style={{color: '#4285f4'}} /> : <EyeInvisibleOutlined style={{color: '#4285f4'}} />)} onChange={handlePasswordChange}/>
                {error && <div className="error" style={{color: "red"}}>Неверный логин и(или) пароль</div>}
                <div className="login-button" onClick={handleLogin}>
                     Войти <LoginOutlined />
                </div>
                <br/><br/>
            </div>
        </div>
    )
}

export default Login;