import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/RegistrPage.css";

export default function RegistrPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    function handleSubmit() {
        if (!username && username.length >= 3) {
            return alert('Имя пользователя должно быть заполнено и быть не менее 3 символов!');
        }

        if (!email) {
            return alert('Email должен быть заполнен');
        }

        if (!password && password.length >= 6) {
            return alert('Пароль должен быть заполнен и быть не менее 6 символов')
        }

        const file = document.getElementById('uploadFile').files[0];
        const formData = new FormData();
        formData.append('email', email);
        formData.append('username', username);
        formData.append('password', password);
        if (file) {
            formData.append('file', file);
        }
        

        fetch('http://192.168.3.3:3001/api/user/create', {
            method: 'POST',
            body: formData
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Произошла ошибка при создании пользователя', errorText);
            }
            return await response.json();
        })
        .then(data => {
            console.group('Пользователь успешно загружен:');
            console.log(data);
            console.groupEnd();

            navigate('/');

            setUsername('');
            setPassword('');
            setEmail('');
            document.getElementById('uploadFile').value = '';
        })
        .catch(e => {
            console.error('Ошибка:', e);
            setError(e);
        })
    }

    return (
        <div className="registration-form-component">
            <form className="registration-form" onSubmit={(e) => {e.preventDefault(); handleSubmit();}}>
                <h2>Регистрация</h2>
                <div>
                    <label htmlFor="username">Имя пользователя</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Введите имя пользователя"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Введите email"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Пароль</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введите пароль"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="uploadFile">Загрузите аватарку</label>
                    <input type="file" name="file" id="uploadFile"/>
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
}