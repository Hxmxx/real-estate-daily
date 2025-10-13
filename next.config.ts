import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
    /* config options here */
};

export default withPWA({
    ...nextConfig,
    dest: 'public', // Service Worker가 public 폴더에 생성됨
    register: true, // 자동 등록
    skipWaiting: true, // 업데이트 즉시 활성화
    disable: process.env.NODE_ENV === 'development', // 개발 단계에선 비활성화
});
