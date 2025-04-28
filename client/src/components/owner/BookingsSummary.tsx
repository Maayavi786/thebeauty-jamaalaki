import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BookingsSummaryProps {
  isRtl: boolean;
}

const BookingsSummary: React.FC<BookingsSummaryProps> = ({ isRtl }) => {
  // Sample data - in a real app, this would come from API
  const data = [
    { name: isRtl ? 'تم التأكيد' : 'Confirmed', value: 45, color: '#10B981' },
    { name: isRtl ? 'قيد الانتظار' : 'Pending', value: 20, color: '#F59E0B' },
    { name: isRtl ? 'تم الإلغاء' : 'Cancelled', value: 8, color: '#EF4444' },
    { name: isRtl ? 'مكتمل' : 'Completed', value: 62, color: '#6366F1' },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [
              `${value} ${isRtl ? 'حجز' : 'bookings'}`, 
              isRtl ? 'القيمة' : 'Value'
            ]} 
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value) => (
              <span className={isRtl ? 'font-tajawal' : ''}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingsSummary;
