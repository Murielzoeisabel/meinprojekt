"use client"; // Client Component

import { useState } from 'react';
import authFetch from '../../authFetch';

export default function WeightForm({ catId }: { catId: number }) {
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setIsSubmitting(true);

    try {
      const res = await authFetch(`/cats/${catId}/weightentries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });

      if (res.ok) {
        // Formular leeren nach erfolgreichem Speichern
        setWeight('');
        alert('Gewicht erfolgreich gespeichert!');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mt-6">
      <input
        type="number"
        step="0.01"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="Fehlt: Gewicht in kg (z.B. 5.2)"
        required
        className="flex-1 p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {isSubmitting ? 'Speichert...' : 'Speichern'}
      </button>
    </form>
  );
}