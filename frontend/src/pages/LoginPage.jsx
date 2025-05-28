import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './styles/LoginPage.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async () => {
        setError('');

        const result = await login(username, password);
        if (result.success) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-form-component">
            
            <form onSubmit={(e) => e.preventDefault()} className="login-form">
            <h2>Вход</h2>
                <div>
                    <label htmlFor="username">Имя пользователя:</label>
                    <input
                        type="text"
                        className='input-field-username'
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        className='input-field-password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="button" onClick={handleSubmit}>Войти</button>
            </form>
        </div>
    );
} 