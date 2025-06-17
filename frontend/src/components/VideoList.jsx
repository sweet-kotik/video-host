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
        checkVideoStatus();

        const intervalId = setInterval(checkVideoStatus, 100000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return (<p>Loading...</p>)
    }

    return (
        <div className="video-list">
            {videos && videos.filter(video => video.status !== "rejected").map((video) => {
                return (
                    <div className={`video-id-${video.id} ${video.status === 'pending' ? 'isDisabled' : ''}`} key={video.id}>
                        <a href={`/video/watch?id=${video.id}`} >
                            <img src={`/minio/videos/videos/${video.thumbnailPath}/thumbnails/thumbnail-1.jpg`} alt="thumbnail" className="video-thumbnail" />
                            <p className="video-title">{video.title}</p>
                        </a>
                    </div>
                );
            })}
        </div>
    );
}