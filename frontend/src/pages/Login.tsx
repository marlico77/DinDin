import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { createSchemas, LoginFormData } from '../schemas';
import { useI18n } from '../context/I18nContext';


const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  
  // Check URL parameters to determine initial mode
  const searchParams = new URLSearchParams(location.search);
  const action = searchParams.get('action');
  const initialMode = action === 'signup' ? false : true;
  
  const [isLogin, setIsLogin] = useState<boolean>(initialMode);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login, signup } = useAuth();
  const { loginSchema } = createSchemas(t);

  const isObviousFakeEmail = (email: string) => {
    const fakeDomains = ['teste.com', 'test.com', 'example.com', 'mailinator.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return fakeDomains.includes(domain);
  };

  // Get referral code from URL
  const referralCode = searchParams.get('ref') || undefined;

  // Sync state with URL changes
  useEffect(() => {
    const newAction = searchParams.get('action');
    const newMode = newAction === 'signup' ? false : true;
    if (newMode !== isLogin) {
      setIsLogin(newMode);
      setError(''); // Clear error when mode changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    
    if (!isLogin && isObviousFakeEmail(data.email)) {
      setError(t.obviousFakeEmailError);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(data.email, data.password);
      } else {
        await signup(data.email, data.password, referralCode);
      }
      navigate('/app');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t.loginError);
    } finally {
      setLoading(false);
    }
  };



  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setError('');
    reset();
    
    // Update URL to reflect the current mode
    const newSearchParams = new URLSearchParams(window.location.search);
    if (newMode) {
      newSearchParams.set('action', 'login');
    } else {
      newSearchParams.set('action', 'signup');
    }
    // Preserve referral code if it exists
    if (referralCode) {
      newSearchParams.set('ref', referralCode);
    }
    navigate(`/login?${newSearchParams.toString()}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-4">
        <Link
          to="/home"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.loginBackToHome}
        </Link>
      </div>
      
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="logo-mask bg-primary-600 dark:bg-primary-400 h-16 w-16 scale-125 transform flex-shrink-0" aria-label="DinDin Logo" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {isLogin ? t.loginTitle : t.signupTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? (
              <>
                {t.loginOr}{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                >
                  {t.createNewAccount}
                </button>
              </>
            ) : (
              <>
                {t.createNewAccount}{' '}
                <button
                  onClick={toggleMode}
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                >
                  {t.doLogin}
                </button>
              </>
            )}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}



          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={`appearance-none rounded-t-md relative block w-full px-10 py-3 border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm ${
                    errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t.emailPlaceholder}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 px-3">{errors.email.message}</p>
              )}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`appearance-none rounded-b-md relative block w-full px-10 pr-11 py-3 border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm ${
                    errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={t.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 z-20 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? t.hidePasswordAriaLabel : t.showPasswordAriaLabel}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 px-3">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading || isSubmitting ? t.loading : isLogin ? t.loginButton : t.signupButton}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
