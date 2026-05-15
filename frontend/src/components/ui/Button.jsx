import React from "react";

export function Button({ children, onClick, icon: Icon, loading, className = "", disabled, type = "button" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`flex items-center justify-center gap-3
                 bg-primaryClr text-white font-bold 
                 hover:opacity-90 active:scale-[0.98]
                 px-8 py-4 transition-all duration-200
                 rounded-2xl shadow-lg shadow-primaryClr/20
                 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
                Icon && <Icon className="h-5 w-5" />
            )}
            <span className="uppercase tracking-widest text-xs">{children}</span>
        </button>
    );
}

export function Button1({ children, onClick, icon: Icon, disabled, className = "" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-2
                 bg-white text-primaryClr font-bold 
                 hover:bg-primaryClr/5 hover:border-primaryClr/30
                 px-6 py-3 transition-all duration-200
                 rounded-xl border border-primaryClr/10
                 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="uppercase tracking-widest text-[10px]">{children}</span>
        </button>
    );
}

export function BtnWarning({ children, onClick, icon: Icon, className = "" }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2
                 bg-red-50 text-red-600 font-bold 
                 hover:bg-red-100 px-6 py-3 transition-all duration-200
                 rounded-xl border border-red-100 ${className}`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="uppercase tracking-widest text-[10px]">{children}</span>
        </button>
    );
}