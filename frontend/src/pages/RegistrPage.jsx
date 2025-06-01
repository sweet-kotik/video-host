import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/RegistrPage.css";
import config from '../config';

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

        fetch(`${config.apiUrl}/user/create`, {
            method: 'POST',
            body: formData,
            credentials: config.withCredentials ? 'include' : 'same-origin'
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
            })
            .catch(error => {
                console.error('Ошибка при создании пользователя:', error);
                setError(error.message);
            });
    }

    return (
        <div className="register-page">
            <h2 className="register-header">Регистрация</h2>
            <div className="register-form">
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    name="username"
                    className="register-username"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    className="register-email"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    className="register-password"
                />
                <input
                    type="file"
                    id="uploadFile"
                    accept="image/*"
                    className="register-file"
                />
                {error && <p className="error">{error}</p>}
                <button onClick={handleSubmit}>Зарегистрироваться</button>
            </div>
        </div>
    );
}