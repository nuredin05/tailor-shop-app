import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/ui/Input';
import { Lock, ArrowLeft, CheckCircle, Loader2, ShieldCheck, Key } from 'lucide-react';

const ResetPassword = () => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { code, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-backgroundClr p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primaryClr rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondaryClr rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        <div className="glass-card !p-10 border-t border-primaryClr/10 shadow-2xl">
          <Link to="/forgot-password" className="inline-flex items-center gap-2 text-primaryClr/60 hover:text-primaryClr transition-colors text-xs font-black uppercase tracking-widest mb-8">
            <ArrowLeft size={16} /> Back to Code Request
          </Link>

          {!success ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-display font-black text-primaryClr mb-2 tracking-tighter uppercase">New Password</h2>
                <p className="text-primaryClr/60 text-sm">Verification code sent to <span className="text-primaryClr font-bold">{phone || 'your phone'}</span></p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-xs font-bold animate-fadeInUp">
                    {error}
                  </div>
                )}

                <Input 
                  label="Verification Code"
                  type="text"
                  icon={Key}
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />

                <Input 
                  label="New Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <Input 
                  label="Confirm Password"
                  type="password"
                  icon={ShieldCheck}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  disabled={isLoading || !code || !password}
                  className="w-full bg-primaryClr text-white rounded-2xl py-4 font-bold shadow-lg shadow-primaryClr/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm font-black uppercase tracking-widest">Update Password</span>
                      <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-fadeInUp">
              <div className="w-20 h-20 bg-primaryClr/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primaryClr/30">
                <CheckCircle size={40} className="text-primaryClr" />
              </div>
              <h2 className="text-2xl font-bold text-primaryClr mb-2">Password Updated</h2>
              <p className="text-primaryClr/60 text-sm mb-8 leading-relaxed">
                Your password has been successfully reset. You can now use your new credentials to sign in.
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="w-full h-1.5 bg-terciaryClr/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primaryClr animate-[loading_3s_ease-in-out]"></div>
                </div>
                <p className="text-[10px] font-black text-primaryClr/40 uppercase tracking-widest">Redirecting to Login...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
