import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const redirectUrl = `${window.location.origin}/dashboard`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) throw error

      // If email confirmation is disabled in Supabase, user is immediately signed in
      if (data.user && data.session) {
        navigate('/dashboard')
      } else if (data.user) {
        setError('Please check your email to confirm your account. You can also disable email confirmation in Supabase settings to allow immediate signup.')
      } else {
        navigate('/dashboard')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Sample URLs to display
  const sampleUrls = [
    'https://example.com/article-1',
    'https://example.com/resource-2',
    'https://example.com/tutorial-3'
  ]

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Left Section - Safe with URLs */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 relative overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Safe Icon */}
          <div className="relative z-10">
            <svg
              width="240"
              height="240"
              viewBox="0 0 240 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-800 dark:text-white"
            >
              {/* Safe body */}
              <rect x="40" y="60" width="160" height="120" rx="10" fill="currentColor" opacity="0.9" />
              <rect x="45" y="65" width="150" height="110" rx="6" fill="black" />
              
              {/* Safe door handle */}
              <circle cx="120" cy="120" r="14" fill="currentColor" opacity="0.9" />
              <circle cx="120" cy="120" r="7" fill="black" />
              
              {/* Safe lock */}
              <rect x="105" y="85" width="30" height="10" rx="3" fill="currentColor" opacity="0.7" />
              
              {/* URL connection lines coming out from safe */}
              <path
                d="M 200 90 L 280 90"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M 200 120 L 280 120"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M 200 150 L 280 150"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* URL Cards floating out from safe */}
          <div className="absolute left-[55%] top-1/2 transform -translate-y-1/2 space-y-8">
            {sampleUrls.map((url, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-lg px-4 py-3 text-gray-800 dark:text-white text-sm max-w-xs shadow-lg"
                style={{
                  transform: `translateY(${(index - 1) * 30}px)`,
                  animation: `float 3s ease-in-out infinite ${index * 0.3}s`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-pulse"></div>
                  <span className="truncate font-mono text-xs">{url}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Signup Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Instagram-style Logo */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center" style={{ fontFamily: 'cursive' }}>
            LinkVault
          </h1>

          {/* Form Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-4 shadow-lg">
            <form className="space-y-4" onSubmit={handleSignUp}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                  placeholder="Phone number, username, or email"
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                  placeholder="Password"
                />
              </div>

              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                  placeholder="Confirm Password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
              <span className="px-4 text-gray-500 dark:text-gray-400 text-sm font-semibold">OR</span>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-700"></div>
            </div>
          </div>

          {/* Sign in link */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-400 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

