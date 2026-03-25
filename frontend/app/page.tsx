import { revalidatePath } from 'next/cache';
import CatSelector from './components/CatSelector';
import WeightChart from './components/WeightChart';

// Server-Side Data Fetching! (Ersetzt den alten useEffect)
async function getCats() {
  const res = await fetch('http://localhost:3000/api/cats', { cache: 'no-store' });
  return res.json();
}

async function getCatData(id: string) {
  const res = await fetch(`http://localhost:3000/api/cats/${id}/weight`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ searchParams }: { searchParams: { catId?: string } }) {
  // Wähle Katze anhand der URL (?catId=...) oder nutze die Erste als Standard
  const cats = await getCats();
  const selectedCatId = searchParams.catId || (cats.length > 0 ? cats[0].id.toString() : '1');
  const catData = await getCatData(selectedCatId);

  // Server Action: Wird direkt als HTML-Form abgeschickt und ruft das Backend auf
  async function addWeight(formData: FormData) {
    "use server";
    const weight = formData.get('weight');
    if (!weight) return;

    await fetch(`http://localhost:3000/api/cats/${selectedCatId}/weight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: parseFloat(weight.toString()) })
    });

    // Seite serverseitig aktualisieren, um neue Daten sofort anzuzeigen
    revalidatePath('/');
  }

  if (!catData) return <div className="text-center mt-20 text-red-500 text-xl">Backend auf Port 3000 läuft nicht.</div>;

  const currentWeight = catData.history.length > 0 
    ? catData.history[catData.history.length - 1].weight 
    : catData.cat.currentWeight;

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-green-100 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">Gewichts-Tracker</h1>
          <CatSelector cats={cats} selectedId={parseInt(selectedCatId)} />
        </div>
        <img src={catData.cat.photo} alt={catData.cat.name} className="w-24 h-24 rounded-full object-cover shadow-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 text-center">
          <h3 className="text-green-600 font-semibold uppercase tracking-wider mb-2">Aktuelles Gewicht</h3>
          <p className="text-5xl font-bold text-green-800">{currentWeight} kg</p>
        </div>

        <form action={addWeight} className="bg-white p-6 rounded-xl shadow-sm border border-green-100 flex flex-col justify-center gap-3 text-center">
          <h3 className="text-green-600 font-semibold uppercase tracking-wider">Heutiges Gewicht</h3>
          <div className="flex gap-2">
            <input 
              type="number" 
              name="weight" 
              step="0.01" 
              placeholder="z.B. 5.1" 
              required
              className="flex-1 p-3 border-2 border-green-100 rounded-lg text-lg focus:outline-none focus:border-green-500"
            />
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Speichern
            </button>
          </div>
        </form>
      </div>

      <WeightChart history={catData.history} idealWeight={catData.cat.idealWeight} />
    </main>
  );
}