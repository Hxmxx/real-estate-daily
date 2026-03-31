import type { Metadata } from 'next'
import AuthForm from '@/components/AuthForm'

export const metadata: Metadata = {
    title: '로그인 — 마타리',
}

export default function LoginPage() {
    return <AuthForm />
}
