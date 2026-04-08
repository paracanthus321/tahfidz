import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Palette, Check } from 'lucide-react';

const themes = [
  { id: 'default', name: 'Emerald (Default)', color: 'hsl(152, 55%, 33%)' },
  { id: 'ocean', name: 'Ocean Blue', color: 'hsl(217, 91%, 50%)' },
  { id: 'sunset', name: 'Sunset Orange', color: 'hsl(25, 95%, 50%)' },
  { id: 'royal', name: 'Royal Purple', color: 'hsl(271, 76%, 45%)' },
  { id: 'rose', name: 'Rose Pink', color: 'hsl(340, 82%, 48%)' },
  { id: 'midnight', name: 'Midnight Dark', color: 'hsl(222, 47%, 8%)' },
];

export default function SettingsPage() {
  const { settings, setSettings } = useAppContext();

  const handleNameChange = (nama: string) => {
    setSettings({ ...settings, namaPesantren: nama });
  };

  const handleThemeChange = (theme: string) => {
    setSettings({ ...settings, theme });
    toast.success(`Tema berhasil diubah ke ${themes.find(t => t.id === theme)?.name}`);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
        toast.success('Logo berhasil diubah');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h2 className="font-bold text-lg">Informasi Pesantren</h2>
        <div>
          <Label>Nama Pesantren</Label>
          <Input value={settings.namaPesantren} onChange={e => handleNameChange(e.target.value)} />
        </div>
        <div>
          <Label>Logo Pesantren</Label>
          <Input type="file" accept="image/*" onChange={handleLogoChange} />
          {settings.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="mt-3 w-24 h-24 object-contain rounded-lg border" />
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Tema Warna</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                settings.theme === theme.id ? 'border-primary shadow-md' : 'border-border'
              }`}
            >
              <div className="w-10 h-10 rounded-lg mb-2" style={{ background: theme.color }} />
              <p className="text-sm font-medium">{theme.name}</p>
              {settings.theme === theme.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
