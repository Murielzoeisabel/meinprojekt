import WeightForm from './components/WeightForm';

async function getCats() {
  const res = await fetch('http://localhost:3000/api/cats', { cache: 'no-store' });
  if (!res.ok) throw new Error('Fehler beim Laden der Katzen');
  return res.json();
}

async function getCatWeightData(id: number) {
  const res = await fetch(`http://localhost:3000/api/cats/${id}/weight`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Fehler beim Laden der Gewichtsdaten');
  return res.json();
}

export default async function DashboardPage() {
  const cats = await getCats();
  const initialCat = cats.length > 0 ? cats[0] : null;
  
  if (!initialCat) {
    return <main className="p-8 text-center text-black">Keine Katzen gefunden.</main>;
  }

  // Für diese Übung laden wir einfach die Gewichtsdaten zur Sicherheit mit
  await getCatWeightData(initialCat.id);

  return (
    <main className="min-h-screen bg-green-50 p-8 font-sans text-green-950">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-green-700">🐱 Katzen Gewichts-Tracker</h1>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={initialCat.photo} 
              alt={initialCat.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
            />
            <div>
              <h2 className="text-2xl font-semibold">{initialCat.name}</h2>
              <p className="text-green-600">{initialCat.age} Jahre alt</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-sm font-medium text-green-600 uppercase">Aktuelles Gewicht</p>
              <p className="text-3xl font-bold text-green-800">{initialCat.currentWeight} kg</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-sm font-medium text-green-600 uppercase">Idealgewicht</p>
              <p className="text-3xl font-bold text-green-800">{initialCat.idealWeight} kg</p>
            </div>
          </div>

          <div className="mt-8 border-t border-green-100 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-green-800">Neues Gewicht eintragen</h3>
            <WeightForm catId={initialCat.id} />
          </div>
        </div>
      </div>
    </main>
  );
}