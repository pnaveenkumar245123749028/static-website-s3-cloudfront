import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore.js';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    if (!token || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [user, token, isInitialized, router, allowedRoles]);

  if (!isInitialized || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-mono text-sm">Authenticating Operator...</p>
      </div>
    );
  }

  return children;
}
