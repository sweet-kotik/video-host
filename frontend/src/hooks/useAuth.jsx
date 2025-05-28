import { useEffect, useState } from "react";
import axios from "axios";

export default function useAuth() {
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUserData = async () => {
        try {
            const response = await axios.get('http://192.168.3.3:3001/api/user/checkSession', {
                withCredentials: true
            });
            console.log('Получены данные с сервера:', response);

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            setUser(response.data);
            setIsAuth(true);
            setError(null);
        } catch (error) {
            console.error('Ошибка при загрузке данных пользователя:', error);
            setIsAuth(false);
            setUser(null);
            setError(error.response?.data?.message || 'Ошибка при загрузке данных пользователя');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Запрос на вход:', username, password);
            
            const response = await axios.post('http://192.168.3.3:3001/api/user/login', 
                { username, password },
                { withCredentials: true }
            );

            console.log('Получен ответ с сервера', response);
            
            setUser(response.data.user);
            setIsAuth(true);
            return {
                data: response.data,
                success: true
            };
        } catch (error) {
            console.error('Ошибка при входе:', error);
            setError(error.response?.data?.message || 'Ошибка при входе');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://192.168.3.3:3001/api/user/logout', {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        } finally {
            setUser(null);
            setIsAuth(false);
        }
    };

    useEffect(() => {
        loadUserData();
        console.log('Сработал хук аунтефикации')
    }, []);

    return {
        isAuth,
        user,
        loading,
        error,
        login,
        logout
    };
}