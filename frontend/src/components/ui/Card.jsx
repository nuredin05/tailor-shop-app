import React from "react";

export default function Card({ title, value, changes, trend: Icons, trendColor = "text-primaryClr" }) {
    return (
        <div className="w-full h-full">
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm shadow-primaryClr/5 border border-primaryClr/5 hover:border-primaryClr/20 hover:shadow-xl hover:shadow-primaryClr/5 transition-all duration-300 h-full flex flex-col justify-between group">
                <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <p className="text-[9px] sm:text-[10px] font-black text-primaryClr/40 uppercase tracking-widest">{title}</p>
                        <div className={`p-1.5 sm:p-2 bg-primaryClr/5 rounded-lg ${trendColor} group-hover:scale-110 transition-transform`}>
                            {Icons && <Icons className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </div>
                    </div>
                    <p className="text-xl sm:text-3xl font-black text-primaryClr tracking-tight leading-tight">{value}</p>
                </div>

                {changes !== undefined && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primaryClr/5 flex items-center gap-2">
                        <span className={`text-[10px] sm:text-xs font-bold ${trendColor}`}>{changes}</span>
                        <span className="text-[9px] sm:text-[10px] font-medium text-primaryClr/30 uppercase tracking-wider italic">vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}