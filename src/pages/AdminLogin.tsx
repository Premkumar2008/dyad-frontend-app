import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../pages/login-new.css';

interface AdminLoginFormData {
  username: string;
  password: string;
}

const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const carouselImages = [
  { url: '/assets/images/loginbanner1.jpeg' },
  { url: '/assets/images/loginbanner2.jpeg' },
  { url: '/assets/images/loginbanner3.jpeg' },
];

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) navigate('/admin-early-access', { replace: true });
  }, [navigate]);

  // Auto-sliding carousel
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide(prev => (prev + 1) % carouselImages.length),
      8000
    );
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({ resolver: yupResolver(schema) as any });

  const onSubmit = async (data: AdminLoginFormData) => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${apiUrl}/admin/login`, {
        username: data.username,
        password: data.password,
      });

      if (res.data?.success) {
        localStorage.setItem('adminAccessToken', res.data.accessToken);
        localStorage.setItem('adminRefreshToken', res.data.refreshToken);
        localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));
        toast.success('Login successful!');
        navigate('/admin-early-access', { replace: true });
      } else {
        setError(res.data?.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-holder">

        {/* ── Left: form ── */}
        <div className="login-form-section">
          <div>
            <div
              className="dyad-logo"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <img
                src="/assets/images/logo_main.png"
                alt="Dyad Logo"
                className="logo-image login-logo"
              />
            </div>
          </div>

          <div className="login-form-content">
            <h3 className="text-xl font-medium text-gray-900">Admin Login</h3>

            <div className="form-container-login">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    {...register('username')}
                    type="text"
                    placeholder="Enter admin username"
                    className="input-field"
                    disabled={loading}
                    autoComplete="username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      className="input-field input-field-pr-10"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="password-toggle-button"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <img src="/assets/images/openeye.svg" alt="Hide password" />
                      ) : (
                        <img src="/assets/images/closeeye.svg" alt="Show password" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

              </form>
            </div>
          </div>
        </div>

        {/* ── Right: carousel ── */}
        <div className="login-carousel-section">
          <div className="carousel-container">
            <div className="carousel-images">
              {carouselImages.map((img, i) => (
                <div
                  key={i}
                  className={`carousel-slide ${i === currentSlide ? 'active' : ''}`}
                  style={{
                    backgroundImage: `url(${img.url})`,
                    opacity: i === currentSlide ? 1 : 0,
                    transform: `translateX(${(i - currentSlide) * 100}%)`,
                  }}
                />
              ))}
            </div>
            <div className="carousel-content" />
            <div className="carousel-indicators">
              {carouselImages.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-indicator ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
