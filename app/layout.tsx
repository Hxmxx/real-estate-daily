import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
    variable: '--font-noto-sans-kr',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Real Estate Daily',
    description:
        '매일 자정 하나의 부동산 관련 콘텐츠를 24시간 한정으로 제공하는 휘발성 지식 구독 서비스',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={`${notoSansKR.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
