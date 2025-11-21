
import React from 'react';
import { Order } from '../types';

export type DateRangeType = 'ALL' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

interface DateFilterBarProps {
    activeRange: DateRangeType;
    onChange: (range: DateRangeType) => void;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({ activeRange, onChange }) => {
    const options: {label: string, value: DateRangeType}[] = [
        { label: '全部 (All)', value: 'ALL' },
        { label: '今日 (Day)', value: 'DAY' },
        { label: '本周 (Week)', value: 'WEEK' },
        { label: '本月 (Month)', value: 'MONTH' },
        { label: '全年 (Year)', value: 'YEAR' },
    ];

    return (
        <div className="inline-flex bg-white rounded-lg border border-slate-200 p-1 gap-1">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                        activeRange === opt.value 
                        ? 'bg-blue-100 text-blue-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

export const filterOrdersByDate = (orders: Order[], range: DateRangeType): Order[] => {
    if (range === 'ALL') return orders;
    const now = new Date();
    // Reset time to midnight for accurate day comparison
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return orders.filter(o => {
        const orderDate = new Date(o.date).getTime();
        switch (range) {
            case 'DAY': 
                return orderDate >= todayStart;
            case 'WEEK': 
                // Simple approximation: last 7 days
                const weekStart = todayStart - (7 * 24 * 60 * 60 * 1000);
                return orderDate >= weekStart;
            case 'MONTH':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                return orderDate >= monthStart;
            case 'YEAR':
                const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
                return orderDate >= yearStart;
            default: return true;
        }
    });
}
