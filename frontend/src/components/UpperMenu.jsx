import './styles/UpperMenu.css';
import useAuth from '../hooks/useAuth';
import { useEffect, useState } from 'react';

export default function UpperMenu() {
    const { isAuth, logout } = useAuth();
    const [visible, setVidsible] = useState(false);

    function handleSearch() {
        // TODO: Напиши тута полнотектовой поиск (опционально)
        return alert('Извините, но данная функция еще не реализована, следите за обновлениями!');
    }

    useEffect(() => {
        console.log('Состояние аутентификации изменилось:', isAuth);
        setVidsible(isAuth);
    }, [isAuth]);

    return (
        <div className="upper-menu">
            <a href="/">
                <img alt="VideoHostLogo" src='/logo.svg' className="upper-menu-logo" />
                <h1>PlaySphere</h1>
            </a>

            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    required
                    id="upper-menu-search"
                    placeholder="Поиск..."
                />
                <button type="button" onClick={handleSearch}>Поиск</button>
            </form>

            <div className="upload-container">
                <a href="/upload" className="upper-menu-upload-button">
                    Загрузить
                </a>
            </div>

            {visible ? (
                <a //href="/profile" 
                    className='upper-menu-profile'
                    onClick={logout}
                >
                    <img alt="Profile logo" src="/profile-icon.svg" />
                </a>
            ) : (
                <div className="auth-buttons">
                    <a href="/login" className="auth-button login">Войти</a>
                    <a href="/register" className="auth-button register">Регистрация</a>
                </div>
            )}
        </div>
    )
}