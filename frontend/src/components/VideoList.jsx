import './styles/VideoList.css';
import { useState, useEffect } from 'react';
import config from '../config';

export default function VideoList() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const checkVideoStatus = () => {
        fetch(`${config.apiUrl}/videos`, {
            credentials: config.withCredentials ? 'include' : 'same-origin'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при получении видео');
                }
                return response.json();
            })
            .then(data => {
                setVideos(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Ошибка при проверке статусов:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        // Первоначальная загрузка видео
        checkVideoStatus();

        // Настройка интервала для проверки статусов каждые 5 секунд
        const intervalId = setInterval(checkVideoStatus, 20000);

        // Очистка интервала при размонтировании компонента
        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return(<p>Loading...</p>)
    }

    return (
        <div className="video-list">
            {videos.map(video => (
                <div key={video.id} className="video-item">
                    <h3>{video.title}</h3>
                    <p>{video.description}</p>
                    <video controls>
                        <source src={video.url} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            ))}
        </div>
    );
}