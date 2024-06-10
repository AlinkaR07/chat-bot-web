import React, { useState, useEffect, useRef } from "react";
import { ArrowDownOutlined, ArrowUpOutlined, SaveOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import ReactToPrint from "react-to-print";


import './css/PanelAdmin.css'
import logo_dark from "../resours/avatar-chatbot-dark.png"

const CustomTooltipBar = ({ active, payload, label }) => {

    if (active && payload && payload.length) {
      return (
        <div className="tooltip-piechart">
            <div className="tooltip-piechart-row">
                <div><span className="ml-2">{label}</span></div>
                <div>{payload[0].dataKey}: <span className="ml-2">{payload[0].value}</span></div>
                <div>{payload[1].dataKey}: <span className="ml-2">{payload[1].value}</span></div>
                <div>{payload[2].dataKey}: <span className="ml-2">{payload[2].value}</span></div>
                <div>{payload[3].dataKey}: <span className="ml-2">{payload[3].value}</span></div>
                <div>{payload[4].dataKey}: <span className="ml-2">{payload[4].value}</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipCrug = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="tooltip-piechart" >
          <p className="text-sm text-blue-400">
            {payload[0].name}: <span className="ml-2">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };


const PanelAdminStatistic = ({isColorChanged}) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const componentRef = useRef();

    useEffect(() => {
        // Функция, которая будет вызываться каждую секунду для обновления времени
        const intervalId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        // Остановить обновление времени при размонтировании компонента
        return () => clearInterval(intervalId);
    }, []); // Передать пустой массив зависимостей, чтобы useEffect вызывался только один раз при монтировании компонента

    // Функция для форматирования текущей даты в формате "число месяц-словами"
    const formatDate = (date) => {
        const months = [
            "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
            "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
        ];

        const day = date.getDate();
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        const Jear = date.getFullYear();
        return `${monthName} ${day}, ${Jear}`;
    };

    const formatMonth = (date) => {
        const months = [
            "январь", "февраль", "март", "апрель", "май", "июнь",
            "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
        ];

        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        const Jear = date.getFullYear();
        return `${monthName} ${Jear}`;
    };

    const formatDayWeek = (date) => {
        const weekdays = [
            "Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"
        ];

        const weekdayIndex = date.getDay();
        const weekdayName = weekdays[weekdayIndex];
        return `${weekdayName}`;
    };


    // Функция для форматирования текущего времени
    const formatTimeDate = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours} : ${minutes} : ${seconds}`;
    };

    // Форматирование текущей даты и времени в нужный формат
    const formattedDate = formatDate(currentDateTime);
    const formattedTime = formatTimeDate(currentDateTime);
    const formattedDayWeek = formatDayWeek(currentDateTime);
    const formattedMonthName = formatMonth(currentDateTime);
    
    useEffect(() => {
        const getMessages = async () => {
            try {
                const response = await fetch(`http://localhost:8000/messages`);
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const data = await response.json();
                console.log("Messages in Statistic:", data.data)
                setMessages(data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setLoading(false);
            }
        };
        getMessages();
    }, [setMessages]);

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
                            const usersWithStatus = data.data.filter(user => user.confirmed === true);
                            console.log('Пользователи:', usersWithStatus);
                            setUsers(usersWithStatus);
                            setLoading(false);
                        },
                        (error) => {
                            console.log(error)   // Установить сообщения об ошибках
                        }
                    )
        }
        getUsers()        
    }, [setUsers])


    if (loading) {
        return (
            <div className="div-loading">
                <div>
                    <Spin style={{ fontSize: 24, marginRight: 8, color: '#072E70'}} />
                    Загрузка...
                </div>
            </div>
        );
    }

    // Функция для разбиения сообщений на недели
    const groupMessagesByWeek = () => {
        const groupedMessages = {};
        messages.forEach(message => {
            const messageDate = new Date(message.date_sending);
            const weekNumber = getWeekNumber(messageDate);
            if (!groupedMessages[weekNumber]) {
                groupedMessages[weekNumber] = [];
            }
            groupedMessages[weekNumber].push(message);
        });
        return groupedMessages;
    };

    const getWeekNumber = (date) => {
        const oneJan = new Date(date.getFullYear(), 0, 1); // 1 января текущего года
        const firstDayOfWeekOneJan = oneJan.getDay(); // день недели для 1 января
        const daysToFirstWeek = firstDayOfWeekOneJan; // сколько дней прошло с начала недели до 1 января
        let daysSinceFirstWeek = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000)) + 1; // сколько дней прошло с начала года до текущей даты
        if (date.getFullYear() % 4 === 0 && (date.getFullYear() % 100 !== 0 || date.getFullYear() % 400 === 0)) {
            if (daysSinceFirstWeek > 59) { // Если год високосный и текущая дата находится после 28 февраля, добавляем один день
                daysSinceFirstWeek++;
            }
        }
        let weekNumber = Math.ceil((daysSinceFirstWeek - daysToFirstWeek) / 7); // номер текущей недели
        if (weekNumber < 1) { // Корректировка, если первая неделя не полная
            weekNumber = 1;
        }
        return weekNumber;
    };

    function getWeekDates(weekNumber, year) {
        const firstDayOfYear = new Date(year, 0, 1);
        const firstDayOfWeek = firstDayOfYear.getDay() || 7;
        const daysToAdd = weekNumber === 1 ? 1 - firstDayOfWeek : 8 - firstDayOfWeek + 7 * (weekNumber - 2);
        const firstDateOfWeek = new Date(year, 0, 1 + daysToAdd);
        const lastDateOfWeek = new Date(year, 0, 1 + daysToAdd + 6);
    
        const formatDate = (date) => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            return `${day}.${month}`;
        };
    
        return `${formatDate(firstDateOfWeek)} - ${formatDate(lastDateOfWeek)}`;
    }

    const groupedMessages = groupMessagesByWeek();              //  сообщения, сгруппированных по неделям
    const currentWeek = getWeekNumber(new Date());              // текущая неделя
    const weekDates = getWeekDates(currentWeek, new Date().getFullYear());
    const currentWeekMessages = groupedMessages[currentWeek] ? groupedMessages[currentWeek].length/2 : 0;                   //  количество сообщений на текущей неделе
    const previousWeekMessages = groupedMessages[currentWeek - 1] ? groupedMessages[currentWeek - 1].length/2 : 0;         // количество сообщений на предыдущей неделе
    const percentChange = ((currentWeekMessages - previousWeekMessages) / previousWeekMessages) * 100;                     // процент изменения
    const changeDirection = currentWeekMessages >= previousWeekMessages ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
    const formattedPercentChange = percentChange < 0 ? (-percentChange).toFixed(2) : percentChange.toFixed(2);

    // пользователи авторизовывающиеся за текущую неделю
    const currentWeekUsers = users.filter(user => {
        const lastAuthDate = new Date(user.date_lastAuth);
        const lastAuthWeek = getWeekNumber(lastAuthDate);
        return lastAuthWeek === currentWeek && user.status !== 'Админ';
    }).length;
    
    // пользователи авторизовывающиеся за предыдущую неделю
    const prevWeekUsers = users.filter(user => {
        const lastAuthDate = new Date(user.date_lastAuth);
        const lastAuthWeek = getWeekNumber(lastAuthDate);
        return lastAuthWeek === currentWeek - 1 && user.status !== 'Админ';
    }).length;

    
    const activeUsers = users.filter(user => !user.bloking && user.status !== 'Админ').length;  // активные пользователи
    const totalUsers = users.filter(user => user.status !== 'Админ').length;                    // все пользователи
    const percentActiveUsers = ((currentWeekUsers / totalUsers) * 100).toFixed(2);             // процент авторизованных пользователей за текущую неделю

    // пользователи зарегистрированные за последний месяц
    const currentMonthUsers = users.filter(user => {
        const registrationDate = new Date(user.date_registration);
        const currentMonth = new Date().getMonth();
        return registrationDate.getMonth() === currentMonth && user.status !== 'Админ';
    }).length;

    const percentRegisterUsers = ((currentMonthUsers / totalUsers) * 100).toFixed(2);           // процент зарегистрованных пользователей за текущий месяц

    // пустые сообщения за текущий месяц
    const currentMonthEmptyMessageCount = messages.filter(message => {
        const messageDate = new Date(message.date_sending);
        const currentMonth = new Date().getMonth();
        return messageDate.getMonth() === currentMonth && message.content.trim() === "";
    }).length;

    // сообщения за текущий месяц
    const currentMonthMessageCount = messages.filter(message => {
        const messageDate = new Date(message.date_sending);
        const currentMonth = new Date().getMonth();
        return messageDate.getMonth() === currentMonth;
    });

    const percentEmptyMessages = ((currentMonthEmptyMessageCount / currentMonthMessageCount.length) * 100).toFixed(2);      // процент пустых сообщений за текущий месяц

    const responseTimes = [];
    for (let i = 0; i < currentMonthMessageCount.length - 2; i += 2) {
        const currentMessage = currentMonthMessageCount[i];
        const nextMessage = currentMonthMessageCount[i + 1];
    
        if (currentMessage.id + 1 === nextMessage.id) {
            const questionTime = new Date(currentMessage.date_sending).toISOString().split('T')[1].split('.')[0];
            const answerTime = new Date(nextMessage.date_sending).toISOString().split('T')[1].split('.')[0];
            const questionDate = new Date(`1970-01-01T${questionTime}Z`).getTime();
            const answerDate = new Date(`1970-01-01T${answerTime}Z`).getTime();

            let timeDifference = answerDate - questionDate;
            responseTimes.push(timeDifference / 60000);         // в минутах
        }
    }
    
    const averageResponseTime = (responseTimes.reduce((acc, curr) => acc + curr, 0) / responseTimes.length).toFixed(2);      // среднее значение времени получения ответа
    const formattedaverageResponseTime = averageResponseTime < 0 ? (-averageResponseTime) : averageResponseTime;

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = Math.floor(minutes % 60);
        const seconds = Math.floor((minutes * 60) % 60);
        return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    const formattedaverageResponseTimeForm = formatTime(formattedaverageResponseTime);                      // среднее значение времени получения ответа в формате чч:мм:сс

    const monthsNames = ['Янв', 'Февр', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Нояб', 'Дек'];

    // Функция для группировки сообщений по месяцам
    const groupMessagesByMonth = () => {
        const groupedMessages = {};
        messages.forEach(message => {
            const messageDate = new Date(message.date_sending);
            const monthKey = `${messageDate.getFullYear()}-${messageDate.getMonth() + 1}`; // Формируем ключ в формате "год-месяц"
            if (!groupedMessages[monthKey]) {
                groupedMessages[monthKey] = [];
            }
            groupedMessages[monthKey].push(message);
        });
        return groupedMessages;
    };

    // Функция для подсчета количества сообщений по категориям для конкретного месяца
    const countMessagesByCategoryForMonthAll = (messages, keywords) => {
        return messages.filter(message => keywords.some(keyword => message.content.includes(keyword))).length;
    };

    // Данные для отображения на диаграмме
    const messagesByMonth = groupMessagesByMonth();

    // Создаем массив объектов для каждого месяца
    const programMonth = [];
    const monthsToShow = Object.keys(messagesByMonth).slice(-3); // Выбираем последние пять месяцев
    monthsToShow.forEach(monthKey => {
        const monthData = messagesByMonth[monthKey];
        const [year, month] = monthKey.split('-');
        const monthObject = {
            name: `${monthsNames[parseInt(month) - 1]} ${year}`, // Название месяца и года
            'C#': countMessagesByCategoryForMonthAll(monthData, ['C#']),
            'C++': countMessagesByCategoryForMonthAll(monthData, ['C++']),
            'Python': countMessagesByCategoryForMonthAll(monthData, ['Python']),
            'JS': countMessagesByCategoryForMonthAll(monthData, ['JS']),
            'CSS': countMessagesByCategoryForMonthAll(monthData, ['CSS', 'интерфейс', 'HTML']),
        };
        programMonth.push(monthObject);
    });
        
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

    // Количество сообщений за текущий месяц по категориям
    const countMessagesByCategoryForMonth = (keywords) => {
        return messages
            .filter(message => new Date(message.date_sending) >= startOfMonth && new Date(message.date_sending) < endOfMonth)
            .filter(message => keywords.some(keyword => message.content.includes(keyword)))
            .length;
    };

    // Данные для круговой диаграммы за последний месяц
    const chartDataForMonth = [
        { name: 'Аналитика', value: countMessagesByCategoryForMonth(['диаграмма', 'концепция', 'спецификация', 'требования']) },
        { name: 'Python', value: countMessagesByCategoryForMonth(['Python']) },
        { name: 'JS', value: countMessagesByCategoryForMonth(['JS', 'JavaScript', 'React']) },
        { name: 'C++', value: countMessagesByCategoryForMonth(['C++']) },
        { name: 'C#', value: countMessagesByCategoryForMonth(['C#']) },
        { name: 'Стили CSS', value: countMessagesByCategoryForMonth(['CSS', 'интерфейс', 'HTML', '<div>', '<span>', '<h1>', '<p>', 'display', 'align-items', 'background-color', 'gap', 'width', 'height']) },
        { name: 'Параллельное программирование', value: countMessagesByCategoryForMonth(['CUDA', 'OpenMP', 'MPI', 'параллелизм', 'технологии паралельного программирования']) },
    ];

    // Общее количество сообщений за текущий месяц
    const totalMessagesForMonth = messages
    .filter(message => new Date(message.date_sending) >= startOfMonth && new Date(message.date_sending) < endOfMonth)
    .length;

    const messagesInCategories = chartDataForMonth.reduce((total, entry) => total + entry.value, 0);            // Количество сообщений, учтенных в категориях
    const totalOtherMessagesForMonth = totalMessagesForMonth - messagesInCategories;                           // Количество остальных сообщений
    chartDataForMonth.push({ name: 'Общие вопросы программирования', value: totalOtherMessagesForMonth });
    const filteredChartDataForMonth = chartDataForMonth.filter(entry => entry.value !== 0);                     // отфильтрованные данные без нулевых категорий
    filteredChartDataForMonth.sort((a, b) => a.value - b.value);

    const getSuffix = (count) => {
        const lastTwoDigits = count % 100;
        const lastDigit = count % 10;
        if (lastTwoDigits === 11 || lastTwoDigits === 12 || lastTwoDigits === 13) {
            return 'запросов';
        } else if (lastDigit === 1) {
            return 'запрос';
        } else if (lastDigit === 2 || lastDigit === 3 || lastDigit === 4) {
            return 'запроса';
        } else {
            return 'запросов';
        }
    };

    const COLORS_DARK = ['#8DBEDC', '#64A4CE', '#4893C6', '#2D82BD', '#2476B1', '#1965A0', '#0F558F', '#003A70'];
    const COLORS = ['#99CCFF', '#66B2FF', '#3299FF', '#007FFF', '#0066CC', '#004C99', '#003366', '#001933'];

    const COLORS_DARK_BAR = ['#2D82BD', '#2476B1', '#1965A0', '#0F558F', '#003A70'];
    const COLORS_BAR = ['#007FFF', '#0066CC', '#004C99', '#003366', '#001933'];

    return (
        <div className="item">
            <div className="header-statistic" style={{ marginBottom: "2vh", display: "flex", justifyContent: "space-between" }}>
                <div className="item-header-statistic">Статистика
                    <ReactToPrint
                        trigger={() => <SaveOutlined className="button-save"/>}
                        content={() => componentRef.current}
                    />
                </div>
                <div className="div-time-header-statistic">
                    <div className="item-header-date">
                        <div className="day-header-statistic">{formattedDayWeek}</div>
                        <div className="date-header-statistic">{formattedDate}</div>
                    </div>
                    <div className="time-header-statistic">{formattedTime}</div>
                </div>
            </div>
            <Row gutter={48} align={"center"}>
                <Col span={12}>
                    <Card bordered={false} style={{boxShadow: "0 0 5px 3px rgba(0, 0, 0, 0.1)", marginBottom: "4vh", backgroundColor: isColorChanged ? '#f0f6fd' : '#ffffff'}}>
                        <Statistic
                            title={`Доля запросов за текущую неделю (${weekDates}) относительно предыдущей недели`}
                            value={`${formattedPercentChange}%`}
                            prefix={changeDirection}
                            suffix={` (${currentWeekMessages} ${getSuffix(currentWeekMessages)})`}
                            valueStyle={currentWeekMessages >= previousWeekMessages ? { color: '#3f8600' } : { color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} style={{boxShadow: "0 0 5px 3px rgba(0, 0, 0, 0.1)", marginBottom: "4vh", backgroundColor: isColorChanged ? '#f0f6fd' : '#ffffff'}}>
                        <Statistic
                            title={`Доля авторизованных пользователей текущей недели (${weekDates})`}
                            value={`${percentActiveUsers}%`}
                            suffix={` (${currentWeekUsers} из ${totalUsers})`}
                            valueStyle={currentWeekUsers >= prevWeekUsers ? { color: '#3f8600' } : { color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>
            <Row>
                <div className="div-element">
                    <div style={{display: "flex", flexDirection: "column", gap: "2vh", width: "24vw"}}>
                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <div className="line"></div>
                            <div className="title-element">Пользователей Всего</div>
                            <div className="value-element">{totalUsers}</div>
                        </div>
                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <div className="line"></div>
                            <div className="title-element">Активные пользователи</div>
                            <div className="value-element">{activeUsers}</div>
                        </div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", gap: "2vh", width: "24vw"}}>
                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <div className="line"></div>
                            <div className="title-element">Новые пользователи за месяц</div>
                            <div className="value-element">{currentMonthUsers}</div>
                        </div>
                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <div className="line"></div>
                            <div className="title-element">Процент новых пользователей</div>
                            <div className="value-element">{`${percentRegisterUsers} %`}</div>
                        </div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", gap: "2vh", width: "24vw"}}>
                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <div className="line"></div>
                            <div className="title-element">Процент отказа в ответе за месяц</div>
                            <div className="value-element">{`${percentEmptyMessages} %`}</div>
                        </div>
                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                            <div className="line"></div>
                            <div className="title-element">Среднее время получения ответа</div>
                            <div className="value-element">{formattedaverageResponseTimeForm}</div>
                        </div>
                    </div>
                </div>
            </Row>
            <Row gutter={48} align={"center"}>
                <Col span={12}>
                    <Card bordered={false} className="card-diagram-crug" style={{boxShadow: "0 0 5px 3px rgba(0, 0, 0, 0.1)", marginTop: "3vh", textAlign: "center", alignItems: "center", backgroundColor: isColorChanged ? '#f0f6fd' : '#ffffff'}}>
                        <Row>
                            <Col>
                                <h3 className="title-diagram-crug">Распределение запросов по языкам программирования</h3>
                                    <BarChart width={650} height={300} data={programMonth} margin={{right: 30}}>
                                        <CartesianGrid strokeDasharray="7 7" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltipBar/>}/>
                                        <Legend /> 
                                        <Bar dataKey="C#" fill={isColorChanged ? COLORS_DARK_BAR[0 % COLORS.length] : COLORS_BAR[0 % COLORS.length]} animation={{ duration: 2500 }}/>
                                        <Bar dataKey="C++" fill={isColorChanged ? COLORS_DARK_BAR[1 % COLORS.length] : COLORS_BAR[1 % COLORS.length]} animation={{ duration: 2500 }}/>
                                        <Bar dataKey="JS" fill={isColorChanged ? COLORS_DARK_BAR[2 % COLORS.length] : COLORS_BAR[2 % COLORS.length]} animation={{ duration: 2500 }}/>
                                        <Bar dataKey="Python" fill={isColorChanged ? COLORS_DARK_BAR[3 % COLORS.length] : COLORS_BAR[3 % COLORS.length]} animation={{ duration: 2500 }}/>
                                        <Bar dataKey="CSS" fill={isColorChanged ? COLORS_DARK_BAR[4 % COLORS.length] : COLORS_BAR[4 % COLORS.length]} animation={{ duration: 2500 }}/>
                                    </BarChart>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} className="card-diagram-crug" style={{boxShadow: "0 0 5px 3px rgba(0, 0, 0, 0.1)", marginTop: "3vh", textAlign: "center", alignItems: "center", backgroundColor: isColorChanged ? '#f0f6fd' : '#ffffff'}}>
                            <Row>
                                <Col>
                                    <h3 className="title-diagram-crug">Категории запросов за текущий месяц</h3>
                                    <PieChart width={650} height={300}>
                                        <Pie dataKey="value" outerRadius={120} innerRadius={70} data={filteredChartDataForMonth} paddingAngle={5} label animationBegin={0} animationDuration={800} animationEasing="ease-out">
                                            {filteredChartDataForMonth.map((entry, index) => (
                                                <Cell key={`cell-month-${index}`} fill={isColorChanged ? COLORS_DARK[index % COLORS.length] : COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltipCrug/>}/>
                                        <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(value, entry) => <span style={{ color: '#000', width: "10vw"}}>{value}</span>}/>
                                    </PieChart>
                                </Col>
                            </Row>
                    </Card>
                </Col>
            </Row>

            {/** Для печати */}
            <div style={{ display: 'none' }}>
                <div className="print-div" ref={componentRef}>
                        <div className="print-title"><div>Panda-OS</div><img className="print-logo1" src={logo_dark} alt="No messages" /><img className="print-logo2" src={logo_dark} alt="No messages" /></div>
                        <div className="print-content">
                            <div className="print-title-content">Статистика по работе приложения Panda-OS за {formattedMonthName} </div>
                            <Row gutter={48} align={"center"} >
                                <Col span={12}>
                                    <Card bordered={false} style={{boxShadow: "0 0 5px 3px rgba(0, 0, 0, 0.1)", marginBottom: "3vh", backgroundColor: '#ffffff'}}>
                                        <Statistic
                                            title={`Доля запросов пользователей за период ${weekDates}`}
                                            value={`${formattedPercentChange}%`}
                                            prefix={changeDirection}
                                            suffix={` (${currentWeekMessages} ${getSuffix(currentWeekMessages)})`}
                                            valueStyle={currentWeekMessages >= previousWeekMessages ? { color: '#3f8600' } : { color: '#cf1322' }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card bordered={false} style={{boxShadow: "0 0 5px 3px rgba(0, 0, 0, 0.1)", marginBottom: "3vh", backgroundColor:  '#ffffff'}}>
                                        <Statistic
                                            title={`Доля авторизованных пользователей за период ${weekDates}`}
                                            value={`${percentActiveUsers}%`}
                                            suffix={` (${currentWeekUsers} из ${totalUsers})`}
                                            valueStyle={currentWeekUsers >= prevWeekUsers ? { color: '#3f8600' } : { color: '#cf1322' }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <div className="print-div-element">
                                    <div style={{display: "flex", flexDirection: "column", gap: "2vh", width: "29vw"}}>
                                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                            <div className="print-line"></div>
                                            <div className="print-title-element">Пользователей Всего</div>
                                            <div className="value-element">{totalUsers}</div>
                                        </div>
                                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                            <div className="print-line"></div>
                                            <div className="print-title-element">Активные пользователи</div>
                                            <div className="value-element">{activeUsers}</div>
                                        </div>
                                    </div>
                                    <div style={{display: "flex", flexDirection: "column", gap: "2vh", width: "29vw"}}>
                                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                            <div className="print-line"></div>
                                            <div className="print-title-element">Новые пользователи за месяц</div>
                                            <div className="value-element">{currentMonthUsers}</div>
                                        </div>
                                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                            <div className="print-line"></div>
                                            <div className="print-title-element">Процент новых пользователей</div>
                                            <div className="value-element">{`${percentRegisterUsers} %`}</div>
                                        </div>
                                    </div>
                                    <div style={{display: "flex", flexDirection: "column", gap: "2vh", width: "27vw"}}>
                                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                            <div className="print-line"></div>
                                            <div className="print-title-element">Процент отказа в ответе за месяц</div>
                                            <div className="value-element">{`${percentEmptyMessages} %`}</div>
                                        </div>
                                        <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                            <div className="print-line"></div>
                                            <div className="print-title-element">Среднее время получения ответа</div>
                                            <div className="value-element">{formattedaverageResponseTimeForm}</div>
                                        </div>
                                    </div>
                                </div>
                            </Row>
                            <Row gutter={48} align={"center"}>
                                <Col span={12}>
                                            <Row>
                                                <Col>
                                                    <div className="print-title-diagram-crug">Категории запросов за текущий месяц:</div>
                                                    <PieChart width={530} height={270}>
                                                        <Pie dataKey="value" outerRadius={80} innerRadius={40} data={filteredChartDataForMonth} paddingAngle={5} label animationBegin={0} animationDuration={800} animationEasing="ease-out">
                                                            {filteredChartDataForMonth.map((entry, index) => (
                                                                <Cell key={`cell-month-${index}`} fill={isColorChanged ? COLORS_DARK[index % COLORS.length] : COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Legend layout="horizontal" align="center" verticalAlign="bottom" formatter={(value, entry) => <span style={{ color: '#000'}}>{value}</span>}/>
                                                    </PieChart>
                                                </Col>
                                            </Row>
                                </Col>
                                <Col span={12}>
                                    <h3 className="print-title-diagram-crug">Распределение запросов по языкам программирования:</h3>
                                    <div className="print-diagram-bar">
                                        {programMonth.map((month, index) => {
                                            const maxMonthValue = Math.max(
                                                month['C#'],
                                                month['C++'],
                                                month['Python'],
                                                month['JS'],
                                                month['CSS']
                                            );
                                            return (
                                            <div key={index}>
                                                <div className="print-month-name">{month.name}</div>
                                                <div className="prog-name">C#: <div className="prog-value" style={{ color: month['C#'] === maxMonthValue ? 'green' : month['C#'] === 0 ? 'red' : 'black' }}>{month['C#']}</div></div>
                                                <div className="prog-name">C++: <div className="prog-value"style={{ color: month['C++'] === maxMonthValue ? 'green' : month['C++'] === 0 ? 'red' : 'black' }}>{month['C++']}</div></div>
                                                <div className="prog-name">Python: <div className="prog-value" style={{ color: month['Python'] === maxMonthValue ? 'green' : month['Python'] === 0 ? 'red' : 'black' }}>{month['Python']}</div></div>
                                                <div className="prog-name">JS: <div className="prog-value" style={{ color: month['JS'] === maxMonthValue ? 'green' : month['JS'] === 0 ? 'red' : 'black' }}>{month['JS']}</div></div>
                                                <div className="prog-name">CSS: <div className="prog-value" style={{ color: month['CSS'] === maxMonthValue ? 'green' : month['CSS'] === 0 ? 'red' : 'black' }}>{month['CSS']}</div></div>
                                            </div>
                                        )})}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className="print-data">
                            <div>Дата: {formattedDate}</div>
                            <div>Подпись: ____________ ( ____________ )</div>
                        </div>
                        <div className="print-footer"></div>
                </div>
            </div>

        </div>
    );
};

export default PanelAdminStatistic;
