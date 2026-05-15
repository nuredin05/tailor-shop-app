import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/ui/Input';
import { Mail, ArrowLeft, CheckCircle, Loader2, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { identifier });
      setSuccess(true);
      setTimeout(() => {
        navigate('/reset-password', { state: { identifier } });
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'No account found with those details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-backgroundClr p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primaryClr rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondaryClr rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        <div className="glass-card !p-10 border-t border-primaryClr/10 shadow-2xl">
          <Link to="/login" className="inline-flex items-center gap-2 text-primaryClr/60 hover:text-primaryClr transition-colors text-xs font-black uppercase tracking-widest mb-8">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          {!success ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-display font-black text-primaryClr mb-2 tracking-tighter uppercase">Reset Access</h2>
                <p className="text-primaryClr/60 text-sm">Enter your registered email or phone number to receive a secure OTP via email.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-sm font-bold animate-fadeInUp">
                    {error}
                  </div>
                )}

                <Input 
                  label="Email or Phone"
                  type="text"
                  icon={Mail}
                  placeholder="Enter your account details"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  disabled={isLoading || !identifier}
                  className="w-full bg-primaryClr text-white rounded-2xl py-4 font-bold shadow-lg shadow-primaryClr/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-sm font-black uppercase tracking-widest">Send OTP Code</span>
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
              <h2 className="text-2xl font-bold text-primaryClr mb-2">OTP Dispatched</h2>
              <p className="text-primaryClr/60 text-sm mb-8 leading-relaxed">
                A secure 6-digit OTP has been sent to your registered email address.
              </p>

              <div className="p-8 rounded-3xl bg-primaryClr/5 border border-primaryClr/10 mb-8 border-dashed shadow-inner">
                <p className="text-[10px] font-black text-primaryClr/40 uppercase tracking-widest mb-2">Check your email</p>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primaryClr animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primaryClr animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primaryClr animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
