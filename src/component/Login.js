<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { LoginOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone, CheckOutlined, CloseOutlined, ArrowLeftOutlined, UserAddOutlined } from "@ant-design/icons";
=======
import React, { useState } from "react";
import { LoginOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
>>>>>>> 2a1949bc795f4b122bc18afa76bb3fb425da6716
import { useNavigate } from "react-router-dom";
import { Input, message, Layout } from 'antd';
import useThemeStyles from "./css/useThemeStyles"; 

import './css/Login.css'
import logo_light from "../resours/logo-light.png"
import lapa_light from "../resours/lapa.png"

const { Footer } = Layout;

const Login = ({ setUser }) => {
    useThemeStyles(localStorage.getItem('isColorChanged') === 'true');
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [errorPassword,  setErrorPassword] = useState(null);
    const [errorPasswordConfirm,  setErrorPasswordConfirm] = useState(null);
    const [errorEmail,  setErrorEmail] = useState(null);
    const [errorBlock, setErrorBlock] = useState(null);
    const [errorConf, setErrorConf] = useState(null);
    const [isEmailTrue, setIsEmailTrue] = useState(false);
    const [passwordPrev, setPasswordPev] = useState(true);
    const [usersBD, setUsersBD] = useState([]);
    const [userLogin, setUserLogin] = useState([]);
    const [validPassword, setValidPassword] = useState(true);
    const [validLenghtPassword, setValidLenghtPassword] = useState('');
    const [validCharacterPassword, setValidCharacterPassword] = useState('');
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [validEmail, setValidEmail] = useState(true);
    const [errorNoName, setErrorNoName] = useState(false);
    const [errorNoEmail, setErrorNoEmail] = useState(false);

    const pawImages = Array.from({ length: 13 }, (_, index) => index + 1);

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
                            console.log('Пользователи:', data.data)
                            setUsersBD(data.data);
                        },
                        (error) => {
                            console.log("Ошибка при получении данных о пользователях:",error)   // Установить сообщения об ошибках
                        }
                    )
        }
        getUsers()
    }, [setUsersBD])

    const handleLogin = async () => {
        if (email.trim() !== "" && (password.trim() !== "" || passwordPrev === true)) {
            const foundUser = usersBD.find(user => user.email_user === email);
            if (foundUser) {
                if(foundUser.bloking === true){
                    setErrorBlock(true);
                }
                else{
                    console.log('Пользователь найден:', foundUser);
                    setUserLogin(foundUser);
                    setIsEmailTrue(true);
                    setErrorEmail(false);
                    setPasswordPev(foundUser.password !== null);
                }

                if(foundUser.password !== null) {
                    try {
                        const formData = new FormData();
                        formData.append('username', email);
                        formData.append('password', password);

                        if (formData.password !== null) {
                
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
                                    if(userData.confirmed === false){
                                        setErrorConf(true);
                                    }
                                    else if(userData.bloking === true){
                                        setErrorBlock(true);
                                    }
                                    else {
                                        setUser(userData);
                                        setErrorPassword(false);
                                        setErrorBlock(false);
                                        if(userData.email_user === "admin@mail.ru"){
                                            navigate('/admin');
                                        }
                                        else navigate('/home');
                                        message.success('Вы успешно вошли в систему!', 1.3);
                                        handleEditUser(userData.id);
                                    }
                                } else {
                                    setErrorPassword(true);
                                    throw new Error('Ошибка аутентификации');
                                }
                            } else {
                                setErrorPassword(true);
                                throw new Error('Ошибка аутентификации');  
                            }
                        }
                        else {
                            setErrorPassword(true);
                        }
                    } catch (error) {
                        setErrorPassword(true);
                        console.error('Error occurred during login:', error);
                        message.error('Произошла ошибка входа. Пожалуйста, попробуйте снова.');
                    }
                }
            } else {
                console.log('Пользователь не найден!');
                setErrorEmail(true);
                setIsEmailTrue(false);
            }            
        }
    };


    const handleSaveAndLogin = async () => {
        if (email.trim() !== "" && password.trim() !== "" && validPassword) {
            try {
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
                const day = String(currentDate.getDate()).padStart(2, '0'); 
                const formattedDate = `${year}-${month}-${day}`;

                const newEditUser = {
                    name_user: userLogin.name_user,
                    email_user: email,
                    photo: "string",
                    date_registration: userLogin.date_registration,
                    date_lastAuth: formattedDate,
                    status: userLogin.status,
                    bloking: userLogin.bloking,
                    confirmed: userLogin.confirmed,
                    password: password,
                };
        
                console.log("Измененные данные пользователя:", newEditUser);
        
                const update = async () => {
                    const requestOptions = {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "name_user": newEditUser["name_user"],
                            "password": newEditUser["password"],
                            "email_user": newEditUser["email_user"],
                            "photo": newEditUser['photo'],
                            "date_registration": newEditUser["date_registration"],
                            "date_lastAuth": newEditUser["date_lastAuth"],
                            "status": newEditUser["status"],
                            "bloking": newEditUser["bloking"],
                            "confirmed": newEditUser["confirmed"],
                        }),
                    };
        
                    const url = "http://localhost:8000/user/" + userLogin.id;
                    const response = await fetch(url, requestOptions);
                    const data = await response.json();        
                    const formData = new FormData();
                    formData.append('username', data.data.email_user);
                    formData.append('password', password);
        
                    const tokenResponse = await fetch(`http://localhost:8000/token`, {
                        method: 'POST',
                        body: formData,
                    });
        
                    if (tokenResponse.ok) {
                        const tokenData = await tokenResponse.json();
                        localStorage.setItem('token', tokenData.access_token);
        
                        const userResponse = await fetch(`http://localhost:8000/user_auth`, {
                            headers: {
                                'Authorization': `Bearer ${tokenData.access_token}`
                            }
                        });
        
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            if(userData.confirmed === false){
                                setErrorConf(true);
                            }
                            else if(userData.bloking === true){
                                setErrorBlock(true);
                            }
                            else {
                                setUser(userData);
                                setErrorPassword(false);
                                setErrorBlock(false);
                                if (userData.email_user === "admin@mail.ru") {
                                    navigate('/admin');
                                } else {
                                    navigate('/home');
                                }
                                message.success('Вы успешно вошли в систему!', 1.3);
                            }
                        } else {
                            setErrorPassword(true);
                            throw new Error('Ошибка аутентификации');
                        }
                    } else {
                        setErrorPassword(true);
                        throw new Error('Ошибка аутентификации');
                    }
                };
        
                await update();
            } catch (error) {
                setErrorPassword(true);
            }
        }
        else {
            setError(true);
        }
    };


    const handleEditUser = (id) => {
        let updateUser = [];
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
        const day = String(currentDate.getDate()).padStart(2, '0'); 
        const formattedDate = `${year}-${month}-${day}`;

        const indexToUpdate = usersBD.findIndex(user => user.id === id);
        if (indexToUpdate !== -1) {
            updateUser = {
                ...usersBD[indexToUpdate]
            };
        const updatedUsers = [...usersBD];
        updatedUsers[indexToUpdate] = updateUser;
        updateUser.date_lastAuth = formattedDate;

        }

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
                            console.log('Пользователь:', data.data)
                        },
                        (error) => console.log(error)  // Установить сообщения об ошибках
                    )
            }
             update()
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value); 
        setErrorEmail(false);
        setErrorPassword(false);
        setConfirmPassword(false);
        setErrorBlock(false);
        setErrorConf(false);
        setError(false);
    }

    const handleNameChange = (e) => {
        setName(e.target.value); 
    }


    const handlePasswordChange = (e) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,20}$/;
        const lengthRegex = /^.{8,20}$/;
        setValidLenghtPassword(lengthRegex.test(e.target.value));
        const characterRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
        setValidCharacterPassword(characterRegex.test(e.target.value));
        setValidPassword(passwordRegex.test(e.target.value));
        setPassword(e.target.value); 
        setErrorEmail(false);
        setErrorPassword(false);
        setConfirmPassword(false);
        setErrorBlock(false);
        setError(false);
    }

    const handlePasswordFocus = () => {
        setPasswordFocused(true);
    };
      
      const handlePasswordBlur = () => {
        setPasswordFocused(false);
    };

    const handlePasswordConfirmChange = (e) => {
        setConfirmPassword(e.target.value);
        setErrorEmail(false);
        setErrorPassword(false);
        setConfirmPassword(false);
        setErrorBlock(false);
        setErrorConf(false);
        setError(false);
        if (password !== e.target.value) {
            setErrorPasswordConfirm(true);
        } else {
            setErrorPasswordConfirm(false);
        }
    }

    const handleForgotPassword = () => {
        setShowForgotPassword(true);
    };

    const handleRegister = () => {
        setShowForgotPassword(true);
        setIsRegister(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    const handleCloseForgot = () => {
        const foundUser = usersBD.find(user => user.email_user === email);
        console.log("Найденные пользователь:", foundUser)
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
        const day = String(currentDate.getDate()).padStart(2, '0'); 
        const formattedDate = `${year}-${month}-${day}`;

        const newEditUser = {
            name_user: foundUser.name_user,
            email_user: foundUser.email_user,
            photo: "string",
            date_registration: foundUser.date_registration,
            date_lastAuth: formattedDate,
            status: foundUser.status,
            bloking: foundUser.bloking,
            confirmed: foundUser.confirmed,
            password: null,
        };
        console.log("Измененные данные пользователя:", newEditUser)

            const update = async () => {
                /**
                 * определение параметров запроса
                 */
                const requestOptions = {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                      "name_user": newEditUser["name_user"],
                      "password": newEditUser["password"],
                      "email_user": newEditUser["email_user"],
                      "photo": newEditUser['photo'],
                      "date_registration": newEditUser["date_registration"],
                      "date_lastAuth": newEditUser["date_lastAuth"],
                      "status": newEditUser["status"],
                      "bloking": newEditUser["bloking"],
                      "confirmed": newEditUser["confirmed"],
                  }),
              }      
              /**
               * отправка PUT-запроса на сервер
               */
                const url = "http://localhost:8000/user/" + foundUser.id;
                return await  fetch(url, requestOptions)
                    .then(response => response.json())
                            .then(
                                (data) => {
                                console.log('Измененные данные о пользователе:', data.data)
                                const updatedUsers = usersBD.map(user => {
                                  if (user.id === data.data.id) {
                                      user = data.data;
                                      return user;
                                  }
                                  return user;
                              });
                              console.log("Обновленный спок пользователей:", updatedUsers);
                              setUsersBD(updatedUsers);
                            },
                            (error) => console.log(error)  // Установить сообщения об ошибках
                        )
                }
                 update()
        setShowForgotPassword(false);
        message.warning('Ваш запрос обрабатывается!', 3);
        setTimeout(() => {
            message.success('Ваш пароль сброшен! Повторите попытку входа!', 2);
        }, 3200);
    }

    const handleRegisterUser = async () => {
        if (name.trim() !== "" && email.trim() !== "" &&  !errorEmail) {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
            const day = String(currentDate.getDate()).padStart(2, '0'); 
            const formattedDate = `${year}-${month}-${day}`;
    
            const newUser = {
                name_user: name,
                email_user: email,
                photo: "string",
                date_registration: formattedDate,
                date_lastAuth: null,
                status: "Пользователь",
                bloking: false,
                confirmed: false,
                password: password,
            };
    
            let userId;
            console.log(newUser)
    
    
                const create = async () => {
                    /**
                     * определение параметров запроса
                     */
                    const requestOptions = {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "name_user": newUser["name_user"],
                            "password": newUser["password"],
                            "email_user": newUser["email_user"],
                            "photo": newUser["photo"],
                            "date_registration": newUser["date_registration"],
                            "date_lastAuth": newUser["date_lastAuth"],
                            "status": newUser["status"],
                            "bloking": false,
                            "confirmed": false,
                        }),
                    }      
    
                    console.log(requestOptions)
                    /**
                     * отправка POST-запроса на сервер
                     */
                    const url = "http://localhost:8000/user"
                    return await  fetch(url, requestOptions)
                        .then(response => response.json())
                                .then(
                                    (data) => {
                                        console.log('Новый пользователь:', data.data)
                                        userId=data.data.id;
                                        const updatedUsers = usersBD.map(user => {
                                            if (user.id === data.data.id) {
                                                user = data.data;
                                                return user;
                                            }
                                            return user;
                                        });
                                        console.log("Обновленный спок пользователей:", updatedUsers);
                                        setUsersBD(updatedUsers);
                                        setIsRegister(false);
                                        setShowForgotPassword(false);
                                        message.success('Вы успешно отправили заявку на регистрацию! Повторите вход снова через некоторое время!', 1.3);
                                    },
                                    (error) => console.log(error)  // Установить сообщения об ошибках
                                )
                }
                create().then(() => {
                  if(newUser.status === "Пользователь") {
                    const newAlert = {
                        date_sending: new Date().toISOString(),
                        reading: false,
                    };
                    const user_id = userId;
            
                    const createAlert = async () => {
                        /**
                         * определение параметров запроса
                         */
                      const requestOptions = {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "date_sending" : newAlert["date_sending"],
                            "reading" : newAlert["reading"],
                        }),
                      }      
                      /**
                       * отправка POST-запроса на сервер
                       */
                      const url = "http://localhost:8000/alerts/" + user_id 
                      return await  fetch(url, requestOptions)
                        .then(response => response.json())
                                .then(
                                    (data) => {
                                      console.log('Новое уведомление:', data)
                                      setIsRegister(false);
                                },
                                  (error) => console.log(error)  // Установить сообщения об ошибках
                              )
                        }
                        createAlert().then(() => {
                            if(newUser.status === "Пользователь") {
                              const newChat = {
                                  chat_name: "Новый чат",
                                  date_creating: new Date().toISOString(),
                                  date_deleting: null,
                                  deleting: false,
                              };
                              const user_id = userId;
                              const type_nn_id = 1;
                      
                              const createChat = async () => {
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
                                          },
                                            (error) => console.log(error)  // Установить сообщения об ошибках
                                        )
                                  }
                                  createChat()
                            }
                          })
                  }
                })
            }
            else {
              if (name.trim() === ""){
                setErrorNoName(true);
              }
              if (email.trim() === ""){
              setErrorNoEmail(true);
              }
            }
        };
    

    const handleForgotReturnTo = () => {
        setShowForgotPassword(false);
        setIsRegister(false);
        setName("");
    }

    const handleReturnTo = () => {
        setPasswordPev(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    return(
            <div className = "login-page">
                <div className="login-container">
                    <div className="name-app">Panda-OS</div>
                    <img className="logo" src={logo_light} alt="No messages" />
                    <img className="logo-lapa1" src={lapa_light} alt="No messages" />
                    <img className="logo-lapa2" src={lapa_light} alt="No messages" />
                </div>
                <div className="login-card">
                        <h2>Добро пожаловать!</h2>
                        { !showForgotPassword ? 
                            ( <>
                                <Input size="large" value={email} className="login-user" placeholder="Введите логин" prefix={<UserOutlined style={{color: '#4285f4'}}/>} onChange={handleEmailChange}/>
                                {isEmailTrue === true && passwordPrev === false && userLogin.date_lastAuth &&<div className="error" style={{color: "green"}}>Ваш пароль был сброшен. Придумайте новый</div>}
                                {isEmailTrue === true && passwordPrev === false && !userLogin.date_lastAuth &&<div className="error" style={{color: "green"}}>Вы авторизуетесь в системе первый раз. Придумайте пароль</div>}
                                <Input.Password className="login-password" placeholder="Введите пароль(не менее 8 знаков)" iconRender={(visible) => (visible ? <EyeTwoTone style={{color: '#4285f4'}} /> : <EyeInvisibleOutlined style={{color: '#4285f4'}} />)} onChange={handlePasswordChange} onFocus={handlePasswordFocus} onBlur={handlePasswordBlur}/>
                                {passwordFocused && !passwordPrev && !validPassword && 
                                    <div className="error-valid-password">Пароль должен содержать следующее:
                                        {validLenghtPassword ? (<div className="lenght-valid"><CheckOutlined />  От 8 до 20 символов</div>) : (<div className="lenght-novalid"><CloseOutlined />  От 8 до 20 символов</div>)}
                                        {validCharacterPassword ? (<div className="lenght-valid"><CheckOutlined />  Буквы(A-Z; a-z), цифры(0-9) и специальные символы(@$!%*?&_-)</div>) : (<div className="lenght-novalid"><CloseOutlined />  Буквы(A-Z, a-z), цифры(0-9) и специальные символы(@$!%*?&_-)</div>)}
                                    </div>
                                }
                                {isEmailTrue === true ? (
                                    <>
                                        {passwordPrev === false && 
                                            <>
                                                <Input.Password className="login-password" placeholder="Подтверждение пароля" iconRender={(visible) => (visible ? <EyeTwoTone style={{color: '#4285f4'}} /> : <EyeInvisibleOutlined style={{color: '#4285f4'}} />)} onChange={handlePasswordConfirmChange}/>
                                                {errorPasswordConfirm && <div className="error" style={{color: "red", fontSize: "1.3vh"}}>Пароли не совпадают</div>}
                                                <div className="login-button" onClick={handleSaveAndLogin}>Сохранить и войти  <LoginOutlined /></div>
                                                <div className="return-to" onClick={handleReturnTo}><ArrowLeftOutlined />  Вернуться на страницу авторизации </div>
                                            </>
                                        }
                                    </>
                                ) : (
                                    <>
                                        {errorBlock && <div className="error" style={{color: "red", marginBottom: "1vh"}}>Ваш аккаунт был заблокирован</div>}
                                        
                                    </>
                                )}
                                {errorConf && <div className="error" style={{color: "red", marginBottom: "1vh"}}>Ваша регистрация не подтверждена</div>}
                                {errorPassword && errorEmail === false && isEmailTrue === true && passwordPrev && <div className="error" style={{color: "red"}}>Неверный логин и(или) пароль</div>}
                                {errorEmail && passwordPrev && <div className="error" style={{color: "red"}}>Пользователя не существует</div>}
                                {error && <div className="error" style={{color: "red"}}>Введены не все данные</div>}
                               
                                    {passwordPrev && <div className="login-button" onClick={handleLogin}>Войти  <LoginOutlined /></div>}
                                <div className="div-button-login-register">
                                    {passwordPrev && <div className="forgot-password-register" onClick={handleRegister}>Регистрация  <UserAddOutlined /></div>}
                                    {passwordPrev && <div className="forgot-password" onClick={handleForgotPassword}>Забыли пароль?</div>}
                                </div>
                            </> 
                            ) : (
                            <>
                                { !isRegister ? ( 
                                    <>
                                        <p>Введите ваш адрес электронной почты, чтобы запросить сброс пароля.</p>
                                        <Input size="large" value={email} className="login-user" placeholder="Введите логин" prefix={<UserOutlined style={{color: '#4285f4'}}/>} onChange={handleEmailChange}/>
                                        <div className="login-button" onClick={handleCloseForgot}>Запросить сброс пароля  <LoginOutlined /></div>
                                        <div className="return-to" onClick={handleForgotReturnTo}><ArrowLeftOutlined />  Вернуться на страницу авторизации </div>
                                    </>
                                ) : (
                                    <>
                                        <Input size="large" value={name} className="login-user" placeholder="Введите фамилию и имя" prefix={<UserOutlined style={{color: '#4285f4'}}/>} onChange={handleNameChange}/>
                                        {errorNoName && <div className="errorValid">Заполните поле</div>}
                                        <Input size="large" value={email} className="login-user" placeholder="Введите логин" prefix={<UserOutlined style={{color: '#4285f4'}}/>} onChange={handleEmailChange}/>
                                        {errorNoEmail && <div className="errorValid">Заполните поле</div>}
                                        <Input.Password className="login-password" placeholder="Введите пароль(не менее 8 знаков)" iconRender={(visible) => (visible ? <EyeTwoTone style={{color: '#4285f4'}} /> : <EyeInvisibleOutlined style={{color: '#4285f4'}} />)} onChange={handlePasswordChange} onFocus={handlePasswordFocus} onBlur={handlePasswordBlur}/>
                                        {passwordFocused && !validPassword && 
                                            <div className="error-valid-password">Пароль должен содержать следующее:
                                                {validLenghtPassword ? (<div className="lenght-valid"><CheckOutlined />  От 8 до 20 символов</div>) : (<div className="lenght-novalid"><CloseOutlined />  От 8 до 20 символов</div>)}
                                                {validCharacterPassword ? (<div className="lenght-valid"><CheckOutlined />  Буквы(A-Z; a-z), цифры(0-9) и специальные символы(@$!%*?&_-)</div>) : (<div className="lenght-novalid"><CloseOutlined />  Буквы(A-Z, a-z), цифры(0-9) и специальные символы(@$!%*?&_-)</div>)}
                                            </div>
                                        }
                                        <Input.Password className="login-password" placeholder="Подтверждение пароля" iconRender={(visible) => (visible ? <EyeTwoTone style={{color: '#4285f4'}} /> : <EyeInvisibleOutlined style={{color: '#4285f4'}} />)} onChange={handlePasswordConfirmChange}/>
                                        {errorPasswordConfirm && <div className="error" style={{color: "red", fontSize: "1.3vh"}}>Пароли не совпадают</div>}
                                        <div className="login-button" onClick={handleRegisterUser}>Зарегистрироваться  <UserAddOutlined /></div>
                                        <div className="return-to" onClick={handleForgotReturnTo}><ArrowLeftOutlined />  Вернуться на страницу авторизации </div>
                                    </>
                                )}
                            </>
                            )
                        }
                </div>
                <div className="login-container">
                    {pawImages.map((_, index) => (
                        <div key={`paw-${index}`} className={`paw-track${index + 1}`}>
                            <img src={lapa_light} alt={`Лапа ${index + 1}`} className={`paw${index + 1}`} />
                        </div>
                    ))}
                </div>
                <Footer style={{ position: 'absolute', width: '100%', backgroundColor: 'transparent', textAlign: 'center', bottom: '5vh', color: '#ccc' }}>
                        RomanovaA © 2024 ISPU Консист-ОС
                </Footer>
            </div>
        )
}

export default Login;