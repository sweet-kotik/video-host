import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";

export default function useAuth() {
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUserData = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/user/checkSession`, {
                withCredentials: config.withCredentials
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

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Запрос на вход:', email, password);

            const response = await axios.post(`${config.apiUrl}/user/login`,
                { email, password },
                { withCredentials: config.withCredentials }
            );

            console.log('Получен ответ с сервера', response);
            console.log('Куки после логина:', document.cookie);

            loadUserData();
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
            await axios.post(`${config.apiUrl}/user/logout`, {}, {
                withCredentials: config.withCredentials
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