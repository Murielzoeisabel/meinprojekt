"use client";

import { useRouter } from 'next/navigation';

export default function CatSelector({ cats, selectedId }: { cats: any[], selectedId: number }) {
  const router = useRouter();

  return (
    <select 
      value={selectedId}
      onChange={(e) => router.push(`/?catId=${e.target.value}`)}
      className="p-2 border-2 border-green-500 rounded-lg text-green-800 bg-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400"
    >
      {cats.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.name} ({cat.age} Jahre)</option>
      ))}
    </select>
  );
}