import React from "react";

export default function Input({ label, icon: Icon, error, className = "", ...props }) {
    return (
        <div className="flex flex-col space-y-2 w-full group">
            {label && (
                <label className="text-[10px] font-black text-primaryClr/40 uppercase tracking-[0.15em] pl-1 transition-colors group-focus-within:text-primaryClr">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primaryClr/30 group-focus-within:text-primaryClr transition-colors pointer-events-none">
                        <Icon size={20} />
                    </div>
                )}
                <input
                    {...props}
                    className={`w-full bg-backgroundClr/50 border border-primaryClr/10 rounded-2xl 
                       px-6 py-4 text-primaryClr placeholder-primaryClr/20 
                       focus:outline-none focus:border-primaryClr/40 focus:bg-white
                       transition-all duration-300 shadow-inner
                       ${Icon ? 'pl-14' : ''}
                       ${error ? 'border-status-cancelled ring-1 ring-status-cancelled/20' : ''}
                       ${className}`}
                />
            </div>
            {error && (
                <span className="text-[10px] font-bold text-status-cancelled uppercase tracking-widest pl-1 animate-fadeInUp">
                    {error}
                </span>
            )}
        </div>
    );
}