import React, { useEffect, useRef, useState } from 'react';
import './styles/VideoPlayer.css';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import '@videojs/http-streaming';
import 'videojs-hotkeys';
import 'videojs-hls-quality-selector';
import 'videojs-settings-menu';
import 'videojs-settings-menu/dist/videojs-settings-menu.css';

export default function VideoPlayer({ src }) {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    console.group('Data VideoPlayer');
    console.log(src);
    console.groupEnd();

    useEffect(() => {
        if (!playerRef.current) {
            const videoElement = videoRef.current;
            if (!videoElement) return;

            playerRef.current = videojs(videoElement, {
                controls: true,
                //fluid: true,
                autoplay: true,
                preload: 'auto',
                html5: {
                    hls: {
                        smoothQualityChange: false,
                        overrideNative: true,
                        withCredentials: true,
                        initialQuality: 1080
                    }
                },
                playbackRates: [0.5, 1, 1.5, 2],
                controlBar: {
                    children: {
                        'playToggle': {},
                        'muteToggle': {},
                        'volumeControl': {},
                        'currentTimeDisplay': {},
                        'timeDivider': {},
                        'durationDisplay': {},
                        'liveDisplay': {},
                        'flexibleWidthSpacer': {},
                        'progressControl': {},
                        'playbackRateMenuButton': {
                            playbackRates: [0.5, 1, 1.5, 2]
                        },
                        'qualitySelector': {},
                        'fullscreenToggle': {}
                    }
                },
                hotkeys: {
                    volumeStep: 0.1,
                    seekStep: 5,
                    alwaysCaptureHotkeys: true,
                    enableVolumeScroll: true,
                    enableHoverScroll: true,
                    enableModifiersForNumbers: false,
                    fullscreenKey: function(event, player) {
                        return event.which === 70; // f
                    },
                    muteKey: function(event, player) {
                        return event.which === 77; // m
                    },
                    playPauseKey: function(event, player) {
                        return event.which === 32; // space
                    }
                }
            });

            const qualityLevels = playerRef.current.qualityLevels();
            playerRef.current.hlsQualitySelector();
            
            // Устанавливаем начальное качество после загрузки уровней
            qualityLevels.on('addqualitylevel', (event, qualityLevel) => {
                console.log('Доступно новое качество:', qualityLevel);
                const levels = qualityLevels.levels_;
                // Ищем уровень качества 1080p
                const targetLevel = levels.find(level => level.height === 1080);
                if (targetLevel) {
                    targetLevel.enabled = true;
                }
            });

            qualityLevels.on('change', () => {
                const levels = qualityLevels.levels_;
                const selectedLevel = levels.find(level => level.selected);
                if (selectedLevel) {
                    console.log('Качество изменено на:', selectedLevel.width + 'x' + selectedLevel.height);
                }
            });

            qualityLevels.on('selectedqualitylevelchange', (event, qualityLevel) => {
                console.log('Выбрано новое качество:', qualityLevel);
            });

            playerRef.current.on('error', (error) => {
                console.error('Ошибка воспроизведения:', error);
                console.error('Код ошибки:', playerRef.current.error().code);
                console.error('Сообщение ошибки:', playerRef.current.error().message);
                console.error('URL источника:', src);
            });

            playerRef.current.on('loadedmetadata', () => {
                console.log('Метаданные видео загружены');
            });

            playerRef.current.on('loadeddata', () => {
                console.log('Данные видео загружены');
            });

            playerRef.current.on('canplay', () => {
                console.log('Видео готово к воспроизведению');
            });

            playerRef.current.src({
                src: src,
                type: 'application/x-mpegURL'
              });

            playerRef.current.on('play', () => {
                console.log('Воспроизведение начато');
            });

            playerRef.current.on('pause', () => {
                console.log('Воспроизведение приостановлено');
            });

            // Инициализация hotkeys
            playerRef.current.hotkeys({
                volumeStep: 0.1,
                seekStep: 5,
                alwaysCaptureHotkeys: true
            });
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [src]);

    useEffect(() => {
        if (playerRef.current) {
            const player = playerRef.current;
            const controlBar = player.controlBar.el();
            
            if (isHovered) {
                controlBar.style.opacity = '1';
                controlBar.style.transition = 'opacity 0.3s ease-in-out';
            } else {
                controlBar.style.opacity = '0';
                controlBar.style.transition = 'opacity 0.3s ease-in-out';
            }
        }
    }, [isHovered]);

    return (
        <>
            <div 
                data-vjs-player 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <video-js
                    id='videoPlayer'
                    ref={videoRef}
                    className='video-js'
                >
                    <p className="vjs-no-js">
                        Чтобы просмотреть это видео, пожалуйста, включите JavaScript и подумайте о переходе на
                        веб-браузер, который
                        <a href="https://videojs.com/html5-video-support/" target="_blank" rel='noreferrer'>
                            поддерживает HTML5 видео
                        </a>
                    </p>
                </video-js>
            </div>
        </>
    );
}