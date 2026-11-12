import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import BrandLogo from '../components/BrandLogo';
import { API_BASE_URL } from '../config';

export default function AdminLogin({ onShowToast }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      localStorage.setItem('tns_admin_token', data.token);
      localStorage.setItem('tns_admin_user', data.username);
      if (onShowToast) onShowToast('Signed in to TNS Secretariat Admin.');
      navigate('/admin/dashboard');
    } catch (err) {
      const msg =
        err.message === 'Failed to fetch'
          ? `Admin API unreachable at ${API_BASE_URL}. Ensure the TNS backend server is running.`
          : err.message;
      setError(msg);
      if (onShowToast) onShowToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[78vh] bg-transparent py-14 sm:py-20 px-6 flex items-center justify-center">
      <SeoHead title="Secretariat Admin Login" path="/admin" />

      <div className="tns-surface max-w-md w-full p-8 text-left space-y-6">
        <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-[#E3DCCF]">
          <BrandLogo variant="header" showWordmark={false} to="" />
          <div>
            <h1 className="font-editorial text-2xl font-bold text-[#393185]">
              TNS Secretariat Portal
            </h1>
            <p className="text-xs text-[#666477] mt-1">
              Authorized access for Telangana Neurosciences Society administrators
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-user" className="block text-xs font-semibold text-[#393185] mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#666477] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-user"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="tns-input pl-10"
                placeholder="tns-admin"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-pass" className="block text-xs font-semibold text-[#393185] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666477] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="tns-input pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="tns-btn-primary w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#B0CB1F]" />
          </button>
        </form>
      </div>
    </div>
  );
}
