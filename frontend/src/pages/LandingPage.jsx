import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Ruler, Users, Shield, TrendingUp, ChevronRight, LogIn, PenTool } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  return (
    <div className="min-h-screen bg-backgroundClr text-secondaryClr font-body overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-backgroundClr/80 backdrop-blur-md border-b border-primaryClr/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primaryClr text-white flex items-center justify-center shadow-lg shadow-primaryClr/20">
              <Scissors size={20} className="transform -rotate-45" />
            </div>
            <span className="font-display font-bold text-xl text-primaryClr tracking-tight">
              TailorTech <span className="font-light opacity-50">OS</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg border border-primaryClr/20 text-xs font-bold text-primaryClr hover:bg-primaryClr/5 transition-colors"
            >
              {i18n.language === 'en' ? 'አማርኛ' : 'English'}
            </button>
            <Link 
              to="/login"
              className="flex items-center gap-2 px-5 py-2.5 bg-primaryClr text-white rounded-xl font-bold text-sm hover:bg-primaryClr/90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primaryClr/20"
            >
              <LogIn size={16} />
              {i18n.language === 'en' ? 'Portal Login' : 'ወደ ፖርታል ግባ'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute inset-0 bg-primaryClr/[0.02] pointer-events-none" />
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primaryClr/5 border border-primaryClr/10 text-primaryClr text-xs font-bold mb-8 animate-fadeInUp">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primaryClr opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primaryClr"></span>
            </span>
            {i18n.language === 'en' ? 'Now with CAD Blueprint Integration' : 'አሁን ከካድ ንድፍ ጋር የቀረበ'}
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tight text-primaryClr mb-6 leading-tight animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            {i18n.language === 'en' ? (
              <>Modernize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryClr to-blue-600">Tailoring</span><br/>Production Workflow</>
            ) : (
              <>የልብስ ስፌት <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryClr to-blue-600">ምርትን</span><br/>በዘመናዊ መንገድ ያስተዳድሩ</>
            )}
          </h1>
          
          <p className="text-lg lg:text-xl text-secondaryClr/60 max-w-2xl mx-auto mb-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            {i18n.language === 'en' 
              ? 'The complete operating system for modern tailor shops. Manage orders, draft CAD blueprints, assign tailors, and track your financial performance in real-time.'
              : 'ለዘመናዊ የልብስ ስፌት ቤቶች የተዘጋጀ የተሟላ ስርዓት። ትዕዛዞችን ያስተዳድሩ፣ ዲዛይኖችን ያውጡ፣ ለሰራተኞች ስራ ይመድቡ እና የፋይናንስ እንቅስቃሴዎን ይከታተሉ።'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <Link 
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primaryClr text-white rounded-2xl font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primaryClr/20"
            >
              {i18n.language === 'en' ? 'Access Workshop' : 'ወደ ስራ ቦታ ይግቡ'}
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-primaryClr mb-4">
              {i18n.language === 'en' ? 'Everything you need to run your shop' : 'ድርጅትዎን ለማስተዳደር የሚያስፈልግዎ ሁሉ'}
            </h2>
            <p className="text-secondaryClr/60">
              {i18n.language === 'en' ? 'Role-based access designed for managers, cutters, and tailors.' : 'ለስራ አስኪያጆች፣ ቆራጮች እና ሰፊዎች በተለየ የተዘጋጀ የስራ ክፍፍል።'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<PenTool size={24} />}
              title={i18n.language === 'en' ? 'CAD Blueprints' : 'የካድ ንድፎች'}
              description={i18n.language === 'en' ? 'Digital drafting board for cutters to render high-precision garment structures.' : 'ለቆራጮች ዲዛይኖችን በትክክል ለማውጣት የሚረዳ ዲጂታል ቦርድ።'}
              color="bg-blue-50 text-blue-600 border-blue-100"
            />
            <FeatureCard 
              icon={<TrendingUp size={24} />}
              title={i18n.language === 'en' ? 'Financial Tracking' : 'የፋይናንስ ክትትል'}
              description={i18n.language === 'en' ? 'Monitor 30-day rolling net profit, payroll expenses, and material costs.' : 'የ30 ቀናት ትርፍ፣ የሰራተኛ ደሞዝ እና የዕቃ ወጪዎችን ይከታተሉ።'}
              color="bg-green-50 text-green-600 border-green-100"
            />
            <FeatureCard 
              icon={<Shield size={24} />}
              title={i18n.language === 'en' ? 'Role Workflows' : 'የስራ ድርሻ'}
              description={i18n.language === 'en' ? 'Dedicated dashboards for Officers, Cutters, Tailors, and Shop Managers.' : 'ለእያንዳንዱ ሰራተኛ የራሱ የሆነ የስራ ማስተዳደሪያ ገጽ።'}
              color="bg-purple-50 text-purple-600 border-purple-100"
            />
            <FeatureCard 
              icon={<Users size={24} />}
              title={i18n.language === 'en' ? 'Customer Profiles' : 'የደንበኛ መረጃ'}
              description={i18n.language === 'en' ? 'Store detailed measurement specs for every client and garment type.' : 'የእያንዳንዱን ደንበኛ ዝርዝር ልኬት እና መረጃ በአንድ ቦታ ይያዙ።'}
              color="bg-amber-50 text-amber-600 border-amber-100"
            />
            <FeatureCard 
              icon={<Ruler size={24} />}
              title={i18n.language === 'en' ? 'Task Assignment' : 'ስራ መመደብ'}
              description={i18n.language === 'en' ? 'Managers can seamlessly assign bottlenecks to available tailors.' : 'ስራ አስኪያጆች ለሰራተኞች ስራን በቀላሉ መመደብ ይችላሉ።'}
              color="bg-red-50 text-red-600 border-red-100"
            />
            <FeatureCard 
              icon={<Scissors size={24} />}
              title={i18n.language === 'en' ? 'Dynamic Localization' : 'ቋንቋ ምርጫ'}
              description={i18n.language === 'en' ? 'Fully translated into English and Amharic for local shop accessibility.' : 'ለአካባቢው ሰራተኞች በሚመች መልኩ በአማርኛ እና በእንግሊዝኛ የቀረበ።'}
              color="bg-indigo-50 text-indigo-600 border-indigo-100"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primaryClr/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <Scissors size={16} className="transform -rotate-45" />
            <span className="font-bold text-sm">TailorTech OS</span>
          </div>
          <p className="text-xs text-secondaryClr/40 font-semibold">
            &copy; {new Date().getFullYear()} TailorTech. {i18n.language === 'en' ? 'All rights reserved.' : 'መብቱ በህግ የተጠበቀ ነው።'}
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="p-8 rounded-[2rem] bg-white border border-primaryClr/5 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${color} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-primaryClr mb-3">{title}</h3>
    <p className="text-secondaryClr/60 text-sm leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
