import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Santri } from '@/types/tahfidz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm: Omit<Santri, 'id'> = {
  nama: '', jenisKelamin: 'L', kelas: 7, kelasHalaqah: '', nisn: '', ustadzId: '', orangtua: '', waOrangtua: ''
};

export default function SantriPage() {
  const { santriList, ustadzList, addSantri, updateSantri, deleteSantri } = useAppContext();
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const halaqahList = [...new Set(santriList.map(s => s.kelasHalaqah))];

  const filtered = santriList.filter(s => {
    if (filterKelas !== 'all' && s.kelas !== +filterKelas) return false;
    if (search && !s.nama.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (s: Santri) => { setEditId(s.id); setForm({ ...s }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.nama.trim()) { toast.error('Nama wajib diisi'); return; }
    if (editId) {
      updateSantri({ ...form, id: editId });
      toast.success('Data santri diperbarui');
    } else {
      addSantri({ ...form, id: `santri-${Date.now()}` });
      toast.success('Santri baru ditambahkan');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteSantri(id);
    toast.success('Data santri dihapus');
  };

  const getUstadzName = (id: string) => ustadzList.find(u => u.id === id)?.nama || '-';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Data Santri</h1>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Tambah Santri</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Cari santri..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterKelas} onValueChange={setFilterKelas}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter Kelas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {[7,8,9,10,11,12].map(k => <SelectItem key={k} value={String(k)}>Kelas {k}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold">No</th>
              <th className="text-left p-3 font-semibold">Nama Santri</th>
              <th className="text-left p-3 font-semibold">JK</th>
              <th className="text-left p-3 font-semibold">Kelas</th>
              <th className="text-left p-3 font-semibold">Halaqah</th>
              <th className="text-left p-3 font-semibold">NISN</th>
              <th className="text-left p-3 font-semibold">Ustadz</th>
              <th className="text-left p-3 font-semibold">Orangtua</th>
              <th className="text-left p-3 font-semibold">WA</th>
              <th className="text-left p-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3">{i + 1}</td>
                <td className="p-3 font-medium">{s.nama}</td>
                <td className="p-3">{s.jenisKelamin}</td>
                <td className="p-3">{s.kelas}</td>
                <td className="p-3">{s.kelasHalaqah}</td>
                <td className="p-3">{s.nisn}</td>
                <td className="p-3">{getUstadzName(s.ustadzId)}</td>
                <td className="p-3">{s.orangtua}</td>
                <td className="p-3">{s.waOrangtua}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Tidak ada data santri</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Santri' : 'Tambah Santri Baru'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Nama</Label><Input value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Jenis Kelamin</Label>
                <Select value={form.jenisKelamin} onValueChange={v => setForm({...form, jenisKelamin: v as 'L'|'P'})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Kelas</Label>
                <Select value={String(form.kelas)} onValueChange={v => setForm({...form, kelas: +v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[7,8,9,10,11,12].map(k => <SelectItem key={k} value={String(k)}>Kelas {k}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Kelas Halaqah</Label>
                <Select value={form.kelasHalaqah} onValueChange={v => setForm({...form, kelasHalaqah: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Halaqah" /></SelectTrigger>
                  <SelectContent>{halaqahList.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>NISN</Label><Input value={form.nisn} onChange={e => setForm({...form, nisn: e.target.value})} /></div>
            </div>
            <div><Label>Ustadz Pengampu</Label>
              <Select value={form.ustadzId} onValueChange={v => setForm({...form, ustadzId: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih Ustadz" /></SelectTrigger>
                <SelectContent>{ustadzList.map(u => <SelectItem key={u.id} value={u.id}>{u.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Orangtua</Label><Input value={form.orangtua} onChange={e => setForm({...form, orangtua: e.target.value})} /></div>
            <div><Label>WA Orangtua</Label><Input value={form.waOrangtua} onChange={e => setForm({...form, waOrangtua: e.target.value})} /></div>
            <Button onClick={handleSave} className="mt-2">{editId ? 'Simpan Perubahan' : 'Tambah Santri'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
