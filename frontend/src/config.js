const config = {
    apiUrl: process.env.NODE_ENV === 'production' 
        ? 'https://play-sphere.ru/api'
        : 'http://localhost:8080/api',
    withCredentials: true
};

export default config; 