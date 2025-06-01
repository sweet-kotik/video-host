import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import VideoPlayer from "../components/VideoPlayer";
import './styles/VideoWatchPage.css';

export default function VideoWatchPage() {
    const [error, setError] = useState();
    const [videoEntity, setVideoEntity] = useState();
    const [hlsUrl, setHLSURL] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();

    const id = searchParams.get('id');

    useEffect(() => {
        if (videoEntity?.title) {
            document.title = videoEntity.title;
        }
    }, [videoEntity]);

    useEffect(() => {
        if (!id) {
            setError('ID видео не указан');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetch('/api/videos/findOne?id=' + id)
            .then(response => {
                if (!response) {
                    throw new Error('Ошибка при получении видео');
                }
                return response.json();
            })
            .then(data => {
                setHLSURL(`/minio/videos/videos/${data.videoPath}/video/master.m3u8`);
                setVideoEntity(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Произошла ошибка при получении видео:', error);
                setError(error.message);
                setIsLoading(false);
            });
    }, [id]);



    if (isLoading) {
        return <div className="loading-container">Загрузка...</div>;
    }

    if (error) {
        return <div className="error-container">Ошибка: {error}</div>;
    }

    return (
        <div className="video-watch-container">
            <div className="video-player-container">
                <VideoPlayer src={hlsUrl} />
            </div>
            <div className="video-info">
                <h3 className="watch-video-title">{videoEntity.title}</h3>
                <p className="video-description">{videoEntity.description}</p>
            </div>
        </div>
    );
}