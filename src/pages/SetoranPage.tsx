import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Setoran, TipeSetoran, Kehadiran } from '@/types/tahfidz';
import { daftarSurat, getSuratByJuz } from '@/data/quran';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Save, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function SetoranPage() {
  const { santriList, ustadzList, addSetoran } = useAppContext();
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterUstadz, setFilterUstadz] = useState<string>('all');
  const [searchSantri, setSearchSantri] = useState('');
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [activeTipe, setActiveTipe] = useState<TipeSetoran>('sabaq');

  const [juz, setJuz] = useState(1);
  const [surat, setSurat] = useState('');
  const [ayatMulai, setAyatMulai] = useState(1);
  const [ayatSelesai, setAyatSelesai] = useState(1);
  const [jumlahBaris, setJumlahBaris] = useState(5);
  const [catatan, setCatatan] = useState('');
  const [kehadiran, setKehadiran] = useState<Kehadiran>('hadir');
  const [nilai, setNilai] = useState(100);

  const filteredSantri = santriList.filter(s => {
    if (filterKelas !== 'all' && s.kelas !== +filterKelas) return false;
    if (filterUstadz !== 'all' && s.ustadzId !== filterUstadz) return false;
    if (searchSantri && !s.nama.toLowerCase().includes(searchSantri.toLowerCase())) return false;
    return true;
  });

  const suratOptions = getSuratByJuz(juz);

  const handleSubmit = () => {
    if (!selectedSantriId) { toast.error('Pilih santri terlebih dahulu'); return; }
    if (!surat) { toast.error('Pilih surat'); return; }
    
    const newSetoran: Setoran = {
      id: `setoran-${Date.now()}`,
      santriId: selectedSantriId,
      tanggal: new Date().toISOString().split('T')[0],
      tipe: activeTipe,
      juz, surat, ayatMulai, ayatSelesai, jumlahBaris, catatan, kehadiran,
      nilaiKelancaran: Math.max(0, nilai),
    };
    addSetoran(newSetoran);
    toast.success(`Setoran ${activeTipe} berhasil disimpan`);
    // Reset
    setCatatan('');
    setNilai(100);
  };

  const selectedSantri = santriList.find(s => s.id === selectedSantriId);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Input Setoran Tahfidz</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari santri..." value={searchSantri} onChange={e => setSearchSantri(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterKelas} onValueChange={setFilterKelas}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Kelas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {[7,8,9,10,11,12].map(k => <SelectItem key={k} value={String(k)}>Kelas {k}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterUstadz} onValueChange={setFilterUstadz}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Ustadz" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ustadz</SelectItem>
            {ustadzList.map(u => <SelectItem key={u.id} value={u.id}>{u.nama}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Santri Selection */}
      <div className="bg-card rounded-xl shadow-sm border p-4">
        <Label className="mb-2 block font-semibold">Pilih Santri</Label>
        <Select value={selectedSantriId} onValueChange={setSelectedSantriId}>
          <SelectTrigger><SelectValue placeholder="Pilih santri..." /></SelectTrigger>
          <SelectContent>
            {filteredSantri.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.nama} - Kelas {s.kelas} ({s.kelasHalaqah})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSantri && (
          <p className="mt-2 text-sm text-muted-foreground">
            Ustadz: {ustadzList.find(u => u.id === selectedSantri.ustadzId)?.nama} | Halaqah: {selectedSantri.kelasHalaqah}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTipe} onValueChange={v => setActiveTipe(v as TipeSetoran)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sabaq" className="font-semibold">Sabaq</TabsTrigger>
          <TabsTrigger value="sabqi" className="font-semibold">Sabqi</TabsTrigger>
          <TabsTrigger value="manzil" className="font-semibold">Manzil</TabsTrigger>
        </TabsList>

        {(['sabaq', 'sabqi', 'manzil'] as TipeSetoran[]).map(tipe => (
          <TabsContent key={tipe} value={tipe}>
            <div className="bg-card rounded-xl shadow-sm border p-5 space-y-4">
              <h3 className="font-bold text-lg capitalize">{tipe}</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label>Juz</Label>
                  <Select value={String(juz)} onValueChange={v => { setJuz(+v); setSurat(''); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Array.from({length: 30}, (_, i) => <SelectItem key={i+1} value={String(i+1)}>Juz {i+1}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Surat</Label>
                  <Select value={surat} onValueChange={setSurat}>
                    <SelectTrigger><SelectValue placeholder="Pilih surat" /></SelectTrigger>
                    <SelectContent>{suratOptions.map(s => <SelectItem key={s.nomor} value={s.nama}>{s.nama}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ayat Mulai</Label>
                  <Input type="number" min={1} value={ayatMulai} onChange={e => setAyatMulai(+e.target.value)} />
                </div>
                <div>
                  <Label>Ayat Selesai</Label>
                  <Input type="number" min={1} value={ayatSelesai} onChange={e => setAyatSelesai(+e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Jumlah Baris</Label>
                  <Input type="number" min={1} value={jumlahBaris} onChange={e => setJumlahBaris(+e.target.value)} />
                </div>
                <div>
                  <Label>Kehadiran</Label>
                  <Select value={kehadiran} onValueChange={v => setKehadiran(v as Kehadiran)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hadir">Hadir</SelectItem>
                      <SelectItem value="izin">Izin</SelectItem>
                      <SelectItem value="terlambat">Terlambat</SelectItem>
                      <SelectItem value="alpha">Alpha</SelectItem>
                      <SelectItem value="sakit">Sakit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nilai Kelancaran</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={nilai} onChange={e => setNilai(+e.target.value)} className="flex-1" />
                    <Button variant="outline" size="icon" onClick={() => setNilai(prev => Math.max(0, prev - 5))} title="-5 kesalahan">
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Catatan</Label>
                <Textarea value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan setoran..." />
              </div>

              <Button onClick={handleSubmit} className="gap-2 w-full sm:w-auto">
                <Save className="w-4 h-4" /> Simpan Setoran {tipe.charAt(0).toUpperCase() + tipe.slice(1)}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
