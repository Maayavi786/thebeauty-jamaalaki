import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  isRtl: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ isRtl }) => {
  // Sample data - in a real app, this would come from API
  const data = [
    { month: isRtl ? 'يناير' : 'Jan', revenue: 4500 },
    { month: isRtl ? 'فبراير' : 'Feb', revenue: 6000 },
    { month: isRtl ? 'مارس' : 'Mar', revenue: 8200 },
    { month: isRtl ? 'أبريل' : 'Apr', revenue: 9800 },
    { month: isRtl ? 'مايو' : 'May', revenue: 10500 },
    { month: isRtl ? 'يونيو' : 'Jun', revenue: 11200 },
    { month: isRtl ? 'يوليو' : 'Jul', revenue: 12800 },
    { month: isRtl ? 'أغسطس' : 'Aug', revenue: 14000 },
    { month: isRtl ? 'سبتمبر' : 'Sep', revenue: 13200 },
    { month: isRtl ? 'أكتوبر' : 'Oct', revenue: 15800 },
    { month: isRtl ? 'نوفمبر' : 'Nov', revenue: 16500 },
    { month: isRtl ? 'ديسمبر' : 'Dec', revenue: 18000 },
  ];

  const formatCurrency = (value: number) => {
    if (isRtl) {
      // Arabic format for SAR
      return `${value.toLocaleString('ar-SA')} ر.س.`;
    } else {
      // English format for SAR
      return `SAR ${value.toLocaleString('en-US')}`;
    }
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fontFamily: isRtl ? 'Tajawal, sans-serif' : 'inherit' }}
            reversed={isRtl}
          />
          <YAxis 
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            tick={{ fontSize: 12, fontFamily: isRtl ? 'Tajawal, sans-serif' : 'inherit' }}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), isRtl ? 'الإيرادات' : 'Revenue']}
            labelFormatter={(label) => `${isRtl ? 'شهر' : 'Month'}: ${label}`}
            contentStyle={isRtl ? { fontFamily: 'Tajawal, sans-serif', textAlign: 'right' } : {}}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#D4AF37" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
