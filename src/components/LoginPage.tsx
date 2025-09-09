import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirect after authentication
  useEffect(() => {
    console.log('LoginPage: Auth state changed:', { isAuthenticated, isLoading });
    
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || '/dashboard';
      console.log('LoginPage: User authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      console.log('LoginPage: Submitting login form...');
      await login(formData.email, formData.password);
      console.log('LoginPage: Login successful');
      // Navigation will be handled by the useEffect above
    } catch (error) {
      console.error('LoginPage: Login error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if we're in the middle of authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00bbff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#00bbff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const Logo = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="currentColor" 
      viewBox="0 0 100 17" 
      className="h-8 w-auto text-white"
    >
      <g clipPath="url(#a)">
        <path d="M75.294.309v9.218c0 4.576-2.89 7.472-7.302 7.472-4.433 0-7.281-2.896-7.281-7.472V.31h4.09v8.975c0 2.188.942 3.647 3.19 3.647 2.25 0 3.234-1.436 3.234-3.647V.309h4.07ZM99 .309v16.38h-4.09V9.064l-3.234 7.604h-2.698l-3.255-7.604v7.627h-4.069V.31h4.112l4.54 10.301L94.867.31H99ZM27.454 0c-4.54 0-8.416 3.78-8.416 8.511 0 4.73 3.876 8.511 8.416 8.511 4.561 0 8.416-3.758 8.416-8.51 0-4.754-3.855-8.512-8.416-8.512Zm0 12.932c-2.377 0-4.283-1.967-4.283-4.421s1.906-4.421 4.283-4.421c2.398 0 4.283 1.945 4.283 4.421s-1.885 4.421-4.283 4.421Z"></path>
        <path d="M27.454 0c-4.54 0-8.416 3.78-8.416 8.511 0 4.73 3.876 8.511 8.416 8.511 4.561 0 8.416-3.758 8.416-8.51 0-4.754-3.855-8.512-8.416-8.512Zm0 12.932c-2.377 0-4.283-1.967-4.283-4.421s1.906-4.421 4.283-4.421c2.398 0 4.283 1.945 4.283 4.421s-1.885 4.421-4.283 4.421ZM40.86.309a19.959 19.959 0 0 1 1.092 4.111h3.876v12.27h4.09V4.42h4.925V.31H40.86ZM0 .309A19.96 19.96 0 0 1 1.092 4.42h3.876v12.27h4.09V4.42h4.926V.31H0Z"></path>
      </g>
      <defs>
        <clipPath id="a">
          <path d="M0 0h99v17H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Video Background with Content */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Video Background - No filters or overlays */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            console.error('Video failed to load:', e);
          }}
          onLoadStart={() => {
            console.log('Video started loading');
          }}
          onCanPlay={() => {
            console.log('Video can play');
          }}
        >
          <source src="https://inovus-public-assets.s3.eu-west-2.amazonaws.com/web/TotumVideo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Fallback background in case video doesn't load */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 -z-10"></div>
        
        {/* Content with text shadow for readability */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-8 text-center">
          {/* Logo and Tagline */}
          <div className="mb-16">
            <div className="mb-8">
              <Logo />
            </div>
            <p className="text-3xl text-white font-light" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              Surgical training <span className="text-[#00bbff] font-medium">remastered</span>.
            </p>
          </div>
          
          {/* Images Container */}
          <div className="relative w-full max-w-md">
            {/* Main Center Image */}
            <div className="relative z-30 mx-auto w-56 h-72 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://inovus-public-assets.s3.eu-west-2.amazonaws.com/web/LoginImageCenter.png" 
                alt="Medical professional center" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Left Image */}
            <div className="absolute -left-12 bottom-6 z-20 w-44 h-56 rounded-2xl overflow-hidden shadow-xl transform -rotate-6 opacity-90">
              <img 
                src="https://inovus-public-assets.s3.eu-west-2.amazonaws.com/web/LoginImageLeft.png" 
                alt="Surgical training" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Right Image */}
            <div className="absolute -right-12 top-6 z-20 w-44 h-56 rounded-2xl overflow-hidden shadow-xl transform rotate-6 opacity-90">
              <img 
                src="https://inovus-public-assets.s3.eu-west-2.amazonaws.com/web/LoginImageRight.png" 
                alt="Medical professional" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="w-full max-w-md bg-white flex flex-col justify-center px-8 py-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome.</h2>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00bbff] focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00bbff] focus:bg-white transition-all duration-200 pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Login Button - Following button convention */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00bbff] text-white px-6 py-3 rounded-full font-medium hover:bg-[#0099cc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          
          {/* Forgot Password Link */}
          <div className="text-center mt-6">
            <a href="#" className="text-gray-600 hover:text-[#00bbff] text-sm transition-colors duration-200">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
