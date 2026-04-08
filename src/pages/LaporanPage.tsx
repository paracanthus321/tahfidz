import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, TrendingUp, Calendar, BookOpen, Award } from 'lucide-react';

export default function LaporanPage() {
  const { santriList, ustadzList, setoranList } = useAppContext();
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>(String(new Date().getMonth()));
  const [filterTahun, setFilterTahun] = useState<string>(String(new Date().getFullYear()));
  const [filterHalaqah, setFilterHalaqah] = useState<string>('all');
  const [filterUstadz, setFilterUstadz] = useState<string>('all');

  const halaqahList = [...new Set(santriList.map(s => s.kelasHalaqah))];
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  const filteredSantri = santriList.filter(s => {
    if (filterHalaqah !== 'all' && s.kelasHalaqah !== filterHalaqah) return false;
    if (filterUstadz !== 'all' && s.ustadzId !== filterUstadz) return false;
    return true;
  });

  const report = useMemo(() => {
    if (!selectedSantriId) return null;
    const month = +filterBulan;
    const year = +filterTahun;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;

    const allSetoran = setoranList.filter(s => s.santriId === selectedSantriId);
    const thisMonthData = allSetoran.filter(s => { const d = new Date(s.tanggal); return d.getMonth() === month && d.getFullYear() === year; });
    const prevMonthData = allSetoran.filter(s => { const d = new Date(s.tanggal); return d.getMonth() === prevMonth && d.getFullYear() === prevYear; });
    const prev2Month = prevMonth === 0 ? 11 : prevMonth - 1;
    const prev2Year = prevMonth === 0 ? prevYear - 1 : prevYear;
    const prev2MonthData = allSetoran.filter(s => { const d = new Date(s.tanggal); return d.getMonth() === prev2Month && d.getFullYear() === prev2Year; });

    // Total progress
    const totalBaris = allSetoran.filter(s => s.kehadiran === 'hadir').reduce((sum, s) => sum + s.jumlahBaris, 0);
    const totalHalaman = Math.floor(totalBaris / 15);
    const totalJuz = Math.floor(totalHalaman / 20);
    const sisaHalaman = totalHalaman % 20;
    const progressPercent = Math.min(100, (totalJuz / 30) * 100);

    // This month stats
    const thisMonthBaris = thisMonthData.filter(s => s.kehadiran === 'hadir').reduce((sum, s) => sum + s.jumlahBaris, 0);
    const thisMonthHalaman = Math.floor(thisMonthBaris / 15);
    const thisMonthJuz = Math.floor(thisMonthHalaman / 20);
    
    // Attendance
    const hadirDays = new Set(thisMonthData.filter(s => s.kehadiran === 'hadir').map(s => s.tanggal)).size;
    const tidakHadirDays = new Set(thisMonthData.filter(s => s.kehadiran !== 'hadir').map(s => s.tanggal)).size;

    // Comparison
    const prevBaris = prevMonthData.filter(s => s.kehadiran === 'hadir').reduce((sum, s) => sum + s.jumlahBaris, 0);
    const prev2Baris = prev2MonthData.filter(s => s.kehadiran === 'hadir').reduce((sum, s) => sum + s.jumlahBaris, 0);

    // Ranking
    const allSantriRows: Record<string, number> = {};
    setoranList.forEach(s => {
      if (s.kehadiran === 'hadir') allSantriRows[s.santriId] = (allSantriRows[s.santriId] || 0) + s.jumlahBaris;
    });
    const sortedAll = Object.entries(allSantriRows).sort((a, b) => b[1] - a[1]);
    const ranking = sortedAll.findIndex(([id]) => id === selectedSantriId) + 1;

    // Juz memorized
    const juzSet = new Set(allSetoran.filter(s => s.kehadiran === 'hadir').map(s => s.juz));
    const suratSet = new Set(allSetoran.filter(s => s.kehadiran === 'hadir').map(s => s.surat));

    // Daily chart for this month & prev month
    const dailyChart = (data: typeof thisMonthData) => {
      const days: Record<number, { sabaq: number; sabqi: number; manzil: number }> = {};
      for (let i = 1; i <= 31; i++) days[i] = { sabaq: 0, sabqi: 0, manzil: 0 };
      data.forEach(s => {
        const day = new Date(s.tanggal).getDate();
        if (days[day]) days[day][s.tipe] += s.jumlahBaris;
      });
      return Object.entries(days).map(([d, v]) => ({ day: +d, ...v }));
    };

    // Daily baris
    const dailyBaris = (data: typeof thisMonthData) => {
      const days: Record<number, number> = {};
      for (let i = 1; i <= 31; i++) days[i] = 0;
      data.forEach(s => { const day = new Date(s.tanggal).getDate(); days[day] += s.jumlahBaris; });
      return Object.entries(days).map(([d, v]) => ({ day: +d, baris: v }));
    };

    // Daily nilai
    const dailyNilai = (data: typeof thisMonthData) => {
      const days: Record<number, { total: number; count: number }> = {};
      for (let i = 1; i <= 31; i++) days[i] = { total: 0, count: 0 };
      data.forEach(s => { const day = new Date(s.tanggal).getDate(); days[day].total += s.nilaiKelancaran; days[day].count++; });
      return Object.entries(days).map(([d, v]) => ({ day: +d, nilai: v.count ? Math.round(v.total / v.count) : 0 }));
    };

    // Kehadiran daily
    const kehadiranDaily = (data: typeof thisMonthData) => {
      const days: Record<number, string> = {};
      data.forEach(s => { const day = new Date(s.tanggal).getDate(); days[day] = s.kehadiran; });
      return Array.from({ length: 31 }, (_, i) => ({ day: i + 1, status: days[i + 1] || '-' }));
    };

    return {
      totalBaris, totalHalaman, totalJuz, sisaHalaman, progressPercent,
      thisMonthBaris, thisMonthHalaman, thisMonthJuz,
      hadirDays, tidakHadirDays,
      prevBaris, prev2Baris,
      ranking, totalSantri: sortedAll.length,
      juzList: Array.from(juzSet).sort((a, b) => a - b),
      juzBelum: Array.from({ length: 30 }, (_, i) => i + 1).filter(j => !juzSet.has(j)),
      suratList: Array.from(suratSet),
      dailyChartCurrent: dailyChart(thisMonthData),
      dailyChartPrev: dailyChart(prevMonthData),
      dailyBarisCurrent: dailyBaris(thisMonthData),
      dailyBarisPrev: dailyBaris(prevMonthData),
      dailyNilaiCurrent: dailyNilai(thisMonthData),
      dailyNilaiPrev: dailyNilai(prevMonthData),
      kehadiranCurrent: kehadiranDaily(thisMonthData),
    };
  }, [selectedSantriId, filterBulan, filterTahun, setoranList, santriList]);

  const handlePrint = () => window.print();

  const santriName = santriList.find(s => s.id === selectedSantriId)?.nama;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Laporan Bulanan Tahfidz</h1>
        {report && <Button onClick={handlePrint} className="gap-2"><Download className="w-4 h-4" /> Download PDF</Button>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterBulan} onValueChange={setFilterBulan}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterTahun} onValueChange={setFilterTahun}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>{[2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterHalaqah} onValueChange={setFilterHalaqah}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Halaqah" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Halaqah</SelectItem>
            {halaqahList.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
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

      <div className="bg-card rounded-xl shadow-sm border p-4">
        <Select value={selectedSantriId} onValueChange={setSelectedSantriId}>
          <SelectTrigger><SelectValue placeholder="Pilih santri untuk laporan..." /></SelectTrigger>
          <SelectContent>{filteredSantri.map(s => <SelectItem key={s.id} value={s.id}>{s.nama} - Kelas {s.kelas}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {report && (
        <div className="space-y-6 print:space-y-4" id="laporan-content">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card-green rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4" /><span className="text-sm opacity-80">Progress Total</span></div>
              <p className="text-2xl font-bold">{report.progressPercent.toFixed(1)}%</p>
              <p className="text-xs opacity-70">{report.totalJuz} juz, {report.sisaHalaman} hal dari 30 juz</p>
            </div>
            <div className="stat-card-blue rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4" /><span className="text-sm opacity-80">Hafalan Bulan Ini</span></div>
              <p className="text-2xl font-bold">{report.thisMonthBaris} baris</p>
              <p className="text-xs opacity-70">{report.thisMonthHalaman} hal, {report.thisMonthJuz} juz</p>
            </div>
            <div className="stat-card-orange rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4" /><span className="text-sm opacity-80">Kehadiran</span></div>
              <p className="text-2xl font-bold">{report.hadirDays} hari</p>
              <p className="text-xs opacity-70">{report.tidakHadirDays} hari tidak hadir</p>
            </div>
            <div className="stat-card-purple rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><Award className="w-4 h-4" /><span className="text-sm opacity-80">Ranking</span></div>
              <p className="text-2xl font-bold">#{report.ranking}</p>
              <p className="text-xs opacity-70">dari {report.totalSantri} santri</p>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-bold mb-3">Perbandingan 3 Bulan</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">2 Bulan Lalu</p>
                <p className="text-xl font-bold">{report.prev2Baris} baris</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Bulan Lalu</p>
                <p className="text-xl font-bold">{report.prevBaris} baris</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-primary">Bulan Ini</p>
                <p className="text-xl font-bold text-primary">{report.thisMonthBaris} baris</p>
              </div>
            </div>
          </div>

          {/* Setoran Harian Chart */}
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-bold mb-3">Setoran Harian (Sabaq, Sabqi, Manzil)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={report.dailyChartCurrent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={9} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sabaq" fill="#2e8b57" name="Sabaq" />
                <Bar dataKey="sabqi" fill="#3b82f6" name="Sabqi" />
                <Bar dataKey="manzil" fill="#f97316" name="Manzil" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Baris & Nilai */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border p-5">
              <h3 className="font-bold mb-3">Jumlah Baris Harian</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={report.dailyBarisCurrent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={9} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="baris" fill="#14b8a6" name="Baris" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border p-5">
              <h3 className="font-bold mb-3">Nilai Kelancaran Harian</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={report.dailyNilaiCurrent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" fontSize={9} />
                  <YAxis fontSize={10} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="nilai" fill="#a855f7" name="Nilai" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Juz & Surat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border p-5">
              <h3 className="font-bold mb-3">Juz yang Sudah Dihafal</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {report.juzList.map(j => (
                  <span key={j} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">Juz {j}</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Total: {report.juzList.length} juz | Belum: {report.juzBelum.length} juz</p>
            </div>
            <div className="bg-card rounded-xl border p-5">
              <h3 className="font-bold mb-3">Surat yang Sudah Dihafal</h3>
              <div className="flex flex-wrap gap-1 mb-3 max-h-32 overflow-y-auto">
                {report.suratList.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-secondary/20 text-secondary-foreground rounded text-xs">{s}</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Total: {report.suratList.length} surat</p>
            </div>
          </div>

          {/* Kehadiran */}
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-bold mb-3">Kehadiran Bulan Ini</h3>
            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-16 gap-1">
              {report.kehadiranCurrent.map(k => (
                <div key={k.day} className={`text-center p-1 rounded text-xs font-medium ${
                  k.status === 'hadir' ? 'bg-primary/20 text-primary' :
                  k.status === 'izin' ? 'bg-secondary/30 text-secondary-foreground' :
                  k.status === 'sakit' ? 'bg-accent/20 text-accent-foreground' :
                  k.status === 'alpha' ? 'bg-destructive/20 text-destructive' :
                  k.status === 'terlambat' ? 'bg-secondary/20' :
                  'bg-muted text-muted-foreground'
                }`}>
                  <div className="text-[10px]">{k.day}</div>
                  <div className="text-[8px]">{k.status === '-' ? '' : k.status[0].toUpperCase()}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>H = Hadir ({report.hadirDays})</span>
              <span>A = Alpha ({report.tidakHadirDays})</span>
            </div>
          </div>
        </div>
      )}

      {!selectedSantriId && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Pilih santri untuk melihat laporan bulanan</p>
        </div>
      )}
    </div>
  );
}
