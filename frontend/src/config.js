const config = {
    apiUrl: process.env.NODE_ENV === 'production'
        ? '/api'
        : '/api',
    withCredentials: true
};

export default config; 