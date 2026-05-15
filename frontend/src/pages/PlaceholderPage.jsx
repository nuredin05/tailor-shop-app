import { useLocation } from 'react-router-dom'
import { Construction, ArrowLeft, Sparkles } from 'lucide-react'

const PlaceholderPage = () => {
  const location = useLocation()
  const pageName = location.pathname.split('/')[1]?.replace('-', ' ') || 'Page'

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 animate-fadeInUp">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-primaryClr/20 blur-[60px] rounded-full animate-pulse"></div>
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-primaryClr/10 relative z-10 border border-primaryClr/5 group">
          <Construction className="w-24 h-24 text-primaryClr group-hover:rotate-12 transition-transform duration-500" />
          <div className="absolute -top-4 -right-4 bg-primaryClr text-white p-3 rounded-2xl shadow-lg animate-bounce">
            <Sparkles size={24} />
          </div>
        </div>
      </div>
      
      <div className="max-w-md">
        <h1 className="text-4xl font-black text-primaryClr mb-4 capitalize tracking-tighter">
          {pageName} Module
        </h1>
        <p className="text-primaryClr/50 leading-relaxed font-medium">
          We're currently building something amazing for the <span className="text-primaryClr font-bold uppercase tracking-widest text-[10px] bg-primaryClr/5 px-2 py-1 rounded-md">{pageName}</span> section. 
          Stay tuned for a revolutionary experience!
        </p>
      </div>
      
      <button 
        onClick={() => window.history.back()}
        className="mt-12 group flex items-center gap-3 px-8 py-4 bg-primaryClr text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primaryClr/20 hover:scale-105 active:scale-95"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Return to Dashboard
      </button>

      <div className="mt-16 flex gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-primaryClr/10"></div>
        ))}
      </div>
    </div>
  )
}

export default PlaceholderPage
