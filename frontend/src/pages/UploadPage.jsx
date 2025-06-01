import { useState } from "react";
import './styles/UploadPage.css'
import config from '../config';
import useAuth from "../hooks/useAuth";

export default function UploadPage() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    function handleCreate() {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('file', document.getElementById('videoFile').files[0]);
        formData.append('user', user);

        console.group("Form data");
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }
        console.groupEnd();

        fetch(`${config.apiUrl}/videos/upload`, {
            method: 'POST',
            body: formData,
            credentials: config.withCredentials ? 'include' : 'same-origin'
        })
            .then(async response => {
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Ошибка при загрузке видео: ${errorText}`);
                }
                try {
                    return await response.json();
                } catch (e) {
                    console.log('Ответ не в формате JSON, но загрузка прошла успешно');
                    return { success: true };
                }
            })
            .then(data => {
                console.log('Видео успешно загружено:', data);
                // Очистка формы после успешной загрузки
                setTitle('');
                setDescription('');
                document.getElementById('videoFile').value = '';
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    }

    return (
        <div className="upload-page">
            <h2>Загрузка видео</h2>
            <div className="upload-form">
                <input
                    type="text"
                    placeholder="Название видео"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    name="title"
                />
                <textarea
                    placeholder="Описание видео"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    name="description"
                />
                <input
                    type="file"
                    id="videoFile"
                    accept="video/*"
                    name="file"
                />
                <button onClick={handleCreate} className="upload-button">Загрузить</button>
            </div>
        </div>
    );
}