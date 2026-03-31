'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup'

function translateError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.'
    if (msg.includes('Email not confirmed')) return '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.'
    if (msg.includes('User already registered')) return '이미 가입된 이메일입니다.'
    if (msg.includes('Password should be')) return '비밀번호는 6자 이상이어야 합니다.'
    return msg
}

export default function AuthForm() {
    const router = useRouter()
    const [mode, setMode] = useState<Mode>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [signedUp, setSignedUp] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [resendDone, setResendDone] = useState(false)

    const supabase = createClient()

    function switchMode(next: Mode) {
        setMode(next)
        setError('')
        setSignedUp(false)
    }

    async function handleResend() {
        if (resendCooldown > 0) return
        await supabase.auth.resend({ type: 'signup', email })
        setResendDone(true)
        setResendCooldown(60)
        const id = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) { clearInterval(id); return 0 }
                return prev - 1
            })
        }, 1000)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (mode === 'login') {
            const { error: err } = await supabase.auth.signInWithPassword({ email, password })
            if (err) {
                setError(translateError(err.message))
                setLoading(false)
            } else {
                router.push('/')
                router.refresh()
            }
        } else {
            const { data, error: err } = await supabase.auth.signUp({ email, password })
            setLoading(false)
            if (err) {
                setError(translateError(err.message))
            } else if (data.session) {
                // email confirmation disabled — auto logged in
                router.push('/')
                router.refresh()
            } else {
                setSignedUp(true)
            }
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center px-6">
            <div className="w-full max-w-sm mx-auto">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
                    마타리
                </h1>
                <p className="text-sm text-gray-400 mb-10 leading-relaxed">
                    매일 한 편, 오늘만 읽을 수 있는 지식
                </p>

                {/* Mode tabs */}
                <div className="flex border-b border-gray-100 mb-8">
                    {(['login', 'signup'] as Mode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className={[
                                'pb-2.5 mr-6 text-sm font-medium border-b-2 -mb-px transition-colors',
                                mode === m
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-400 hover:text-gray-700',
                            ].join(' ')}
                        >
                            {m === 'login' ? '로그인' : '회원가입'}
                        </button>
                    ))}
                </div>

                {signedUp ? (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-gray-100 px-5 py-5 space-y-1">
                            <p className="text-sm font-medium text-gray-900">이메일을 확인해주세요</p>
                            <p className="text-sm text-gray-400 break-all">{email}</p>
                        </div>

                        <p className="text-sm text-gray-500 leading-relaxed">
                            받은 편지함의 확인 링크를 클릭하면 자동으로 로그인됩니다.
                            스팸 폴더도 확인해보세요.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleResend}
                                disabled={resendCooldown > 0}
                                className="w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resendDone && resendCooldown > 0
                                    ? `재발송 완료 (${resendCooldown}초 후 재시도)`
                                    : '이메일 다시 받기'}
                            </button>
                            <button
                                onClick={() => switchMode('login')}
                                className="text-sm text-gray-400 hover:text-gray-700 transition-colors py-1"
                            >
                                로그인으로 돌아가기
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일"
                            required
                            autoComplete="email"
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors bg-white"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호"
                            required
                            minLength={6}
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors bg-white"
                        />

                        {error && (
                            <p className="text-xs text-red-500">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:scale-[0.98] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? '...' : mode === 'login' ? '로그인' : '회원가입'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
