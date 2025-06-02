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
        formData.append('user', user.id);

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
        <div>
            <form className="home-page-upload-form" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="videoTitle">Название видео</label>
                <input type="text" required name="videoTitle" id="videoTitle" className="upload-form-title-input" value={title} onChange={(text) => {
                    setTitle(text.target.value);
                }} />
                <label htmlFor="videoDescription">Описание видео</label>
                <input type="text" name="videoDescription" id="videoDescription" className="upload-form-description-input" value={description} onChange={(text) => {
                    setDescription(text.target.value);
                }} />
                <label htmlFor="videoFile"></label>
                <input type="file" name="videoFile" id="videoFile" required />
                <button type="button" className="home-page-upload-button" onClick={handleCreate}>Загрузить видео</button>
            </form>
        </div>
    );
}