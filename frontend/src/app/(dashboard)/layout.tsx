'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const { isAuth } = useAuthStore();
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    // Lire directement localStorage pour éviter le délai de réhydratation Zustand
    try {
      const stored = localStorage.getItem('medoc-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.isAuth === true && parsed?.state?.token) {
          setReady(true);
          return;
        }
      }
    } catch {}
    router.replace('/auth/login');
  }, []);

  // Surveiller la déconnexion pendant la session active
  useEffect(() => {
    if (ready && !isAuth) {
      router.replace('/auth/login');
    }
  }, [isAuth, ready]);

  if (!ready) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0fdf4' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, border:'4px solid #bbf7d0', borderTopColor:'#16a34a', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
        <div style={{ color:'#15803d', fontWeight:600, fontSize:14 }}>Chargement de votre espace...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f0fdf4' }}>
      <Sidebar />
      <main className="dashboard-main" style={{ flex:1, minHeight:'100vh', overflow:'auto', marginLeft:260 }}>
        {children}
      </main>
    </div>
  );
}
