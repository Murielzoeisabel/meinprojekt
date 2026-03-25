"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function WeightChart({ history, idealWeight }: { history: any[], idealWeight: number }) {
  return (
    <div className="h-80 w-full mt-6 bg-white p-4 rounded-xl shadow-sm border border-green-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
          <XAxis dataKey="date" stroke="#16a34a" />
          <YAxis domain={['auto', 'auto']} stroke="#16a34a" tickFormatter={(v) => `${v}kg`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#f0fdf4', borderColor: '#22c55e', borderRadius: '8px', color: '#166534' }}
          />
          <ReferenceLine 
            y={idealWeight} 
            label={{ value: 'Ziel', fill: '#f97316', fontSize: 14, fontWeight: 'bold' }} 
            stroke="#f97316" 
            strokeDasharray="5 5" 
          />
          <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#15803d', r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}