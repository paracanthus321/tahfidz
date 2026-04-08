import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Ustadz } from '@/types/tahfidz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const emptyForm: Omit<Ustadz, 'id'> = { nama: '', jenisKelamin: 'L', noWa: '', asalPondok: '' };

export default function UstadzPage() {
  const { ustadzList, addUstadz, updateUstadz, deleteUstadz } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (u: Ustadz) => { setEditId(u.id); setForm({ ...u }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.nama.trim()) { toast.error('Nama wajib diisi'); return; }
    if (editId) {
      updateUstadz({ ...form, id: editId });
      toast.success('Data ustadz diperbarui');
    } else {
      addUstadz({ ...form, id: `ustadz-${Date.now()}` });
      toast.success('Ustadz baru ditambahkan');
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Ustadz Pengampu</h1>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Tambah Ustadz</Button>
      </div>

      <div className="bg-card rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-semibold">No</th>
              <th className="text-left p-3 font-semibold">Nama Ustadz</th>
              <th className="text-left p-3 font-semibold">JK</th>
              <th className="text-left p-3 font-semibold">No WA</th>
              <th className="text-left p-3 font-semibold">Asal Pondok Pesantren</th>
              <th className="text-left p-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {ustadzList.map((u, i) => (
              <tr key={u.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3">{i + 1}</td>
                <td className="p-3 font-medium">{u.nama}</td>
                <td className="p-3">{u.jenisKelamin}</td>
                <td className="p-3">{u.noWa}</td>
                <td className="p-3">{u.asalPondok}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { deleteUstadz(u.id); toast.success('Ustadz dihapus'); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Ustadz' : 'Tambah Ustadz Baru'}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Nama</Label><Input value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} /></div>
            <div><Label>Jenis Kelamin</Label>
              <Select value={form.jenisKelamin} onValueChange={v => setForm({...form, jenisKelamin: v as 'L'|'P'})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>No WA</Label><Input value={form.noWa} onChange={e => setForm({...form, noWa: e.target.value})} /></div>
            <div><Label>Asal Pondok Pesantren</Label><Input value={form.asalPondok} onChange={e => setForm({...form, asalPondok: e.target.value})} /></div>
            <Button onClick={handleSave} className="mt-2">{editId ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
