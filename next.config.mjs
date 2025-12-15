/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    redirects: async () => {
        return [
            {
                source: '/',
                destination: '/auth/login',
                permanent: true,
            },
            {
                source: '/app',
                destination: '/app/dashboard',
                permanent: true,
            },
        ];
    }
};

export default nextConfig;
