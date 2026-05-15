import React from "react";

export default function Card({ title, value, changes, trend: Icons, trendColor = "text-primaryClr" }) {
    return (
        <div className="w-full h-full">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm shadow-primaryClr/5 border border-primaryClr/5 hover:border-primaryClr/20 hover:shadow-xl hover:shadow-primaryClr/5 transition-all duration-300 h-full flex flex-col justify-between group">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-black text-primaryClr/40 uppercase tracking-widest">{title}</p>
                        <div className={`p-2 bg-primaryClr/5 rounded-lg ${trendColor} group-hover:scale-110 transition-transform`}>
                            {Icons && <Icons className="w-4 h-4" />}
                        </div>
                    </div>
                    <p className="text-3xl font-black text-primaryClr tracking-tight">{value}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-primaryClr/5 flex items-center gap-2">
                    <span className={`text-xs font-bold ${trendColor}`}>{changes}</span>
                    <span className="text-[10px] font-medium text-primaryClr/30 uppercase tracking-wider italic">vs last month</span>
                </div>
            </div>
        </div>
    );
}