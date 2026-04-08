import { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Users, UserCog, BookOpen, TrendingUp, Trophy, AlertTriangle } from 'lucide-react';

const COLORS = ['#2e8b57', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#ef4444'];

export default function Dashboard() {
  const { santriList, ustadzList, setoranList } = useAppContext();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const stats = useMemo(() => {
    const totalSantri = santriList.length;
    const totalUstadz = ustadzList.length;
    const totalHalaqah = new Set(santriList.map(s => s.kelasHalaqah)).size;
    const totalBaris = setoranList.reduce((sum, s) => sum + s.jumlahBaris, 0);
    
    // Rankings - total baris per santri
    const santriRows: Record<string, number> = {};
    const santriJuz: Record<string, Set<number>> = {};
    setoranList.forEach(s => {
      if (s.kehadiran === 'hadir') {
        santriRows[s.santriId] = (santriRows[s.santriId] || 0) + s.jumlahBaris;
        if (!santriJuz[s.santriId]) santriJuz[s.santriId] = new Set();
        santriJuz[s.santriId].add(s.juz);
      }
    });
    
    const ranked = Object.entries(santriRows)
      .map(([id, rows]) => {
        const santri = santriList.find(s => s.id === id);
        const halaman = Math.floor(rows / 15);
        const juz = Math.floor(halaman / 20);
        const sisaHalaman = halaman % 20;
        return { id, nama: santri?.nama || '', rows, halaman, juz, sisaHalaman, kelas: santri?.kelas };
      })
      .sort((a, b) => b.rows - a.rows);
    
    const top10 = ranked.slice(0, 10);
    const bottom10 = ranked.slice(-10).reverse();
    
    // Monthly setoran
    const thisMonthSetoran = setoranList.filter(s => {
      const d = new Date(s.tanggal);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const prevMonthSetoran = setoranList.filter(s => {
      const d = new Date(s.tanggal);
      return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
    });
    
    // Daily rows chart (sabaq/sabqi/manzil) 
    const dailyRows = (setoranData: typeof setoranList) => {
      const days: Record<number, { sabaq: number; sabqi: number; manzil: number }> = {};
      for (let i = 1; i <= 31; i++) days[i] = { sabaq: 0, sabqi: 0, manzil: 0 };
      setoranData.forEach(s => {
        const day = new Date(s.tanggal).getDate();
        if (days[day]) days[day][s.tipe] += s.jumlahBaris;
      });
      return Object.entries(days).map(([day, v]) => ({ day: +day, ...v }));
    };
    
    // Score distribution
    const scoreDist = (data: typeof setoranList) => {
      const bins = { '60-69': 0, '70-79': 0, '80-89': 0, '90-100': 0 };
      data.forEach(s => {
        if (s.nilaiKelancaran >= 90) bins['90-100']++;
        else if (s.nilaiKelancaran >= 80) bins['80-89']++;
        else if (s.nilaiKelancaran >= 70) bins['70-79']++;
        else bins['60-69']++;
      });
      return Object.entries(bins).map(([range, count]) => ({ range, count }));
    };
    
    // Class distribution
    const classDist = (data: typeof setoranList) => {
      const dist: Record<number, number> = {};
      data.forEach(s => {
        const santri = santriList.find(st => st.id === s.santriId);
        if (santri) dist[santri.kelas] = (dist[santri.kelas] || 0) + 1;
      });
      return Object.entries(dist).map(([kelas, count]) => ({ kelas: `Kelas ${kelas}`, count })).sort((a, b) => a.kelas.localeCompare(b.kelas));
    };
    
    // Hafalan distribution
    const hafalanDist = [
      { range: '0-1 Juz', count: ranked.filter(r => r.juz <= 1).length },
      { range: '2-5 Juz', count: ranked.filter(r => r.juz >= 2 && r.juz <= 5).length },
      { range: '5-10 Juz', count: ranked.filter(r => r.juz > 5 && r.juz <= 10).length },
      { range: '10-20 Juz', count: ranked.filter(r => r.juz > 10 && r.juz <= 20).length },
      { range: '20-30 Juz', count: ranked.filter(r => r.juz > 20).length },
    ];
    
    // Capaian per kelas
    const capaianPerKelas = (data: typeof setoranList) => {
      const kelasRows: Record<number, number> = {};
      data.forEach(s => {
        const santri = santriList.find(st => st.id === s.santriId);
        if (santri && s.kehadiran === 'hadir') {
          kelasRows[santri.kelas] = (kelasRows[santri.kelas] || 0) + s.jumlahBaris;
        }
      });
      return [7, 8, 9, 10, 11, 12].map(k => ({ kelas: `Kelas ${k}`, baris: kelasRows[k] || 0 }));
    };
    
    // Target pie
    const targetPie = [
      { name: '> 75%', value: ranked.filter(r => r.juz >= 23).length },
      { name: '50-75%', value: ranked.filter(r => r.juz >= 15 && r.juz < 23).length },
      { name: '25-50%', value: ranked.filter(r => r.juz >= 8 && r.juz < 15).length },
      { name: '< 25%', value: ranked.filter(r => r.juz < 8).length },
    ];

    return {
      totalSantri, totalUstadz, totalHalaqah, totalBaris,
      top10, bottom10,
      dailyRowsCurrent: dailyRows(thisMonthSetoran),
      dailyRowsPrev: dailyRows(prevMonthSetoran),
      scoreDistCurrent: scoreDist(thisMonthSetoran),
      scoreDistPrev: scoreDist(prevMonthSetoran),
      classDistCurrent: classDist(thisMonthSetoran),
      classDistPrev: classDist(prevMonthSetoran),
      hafalanDist,
      capaianCurrent: capaianPerKelas(thisMonthSetoran),
      capaianPrev: capaianPerKelas(prevMonthSetoran),
      targetPie,
    };
  }, [santriList, ustadzList, setoranList]);

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const [viewMonth, setViewMonth] = useState<'current' | 'prev'>('current');

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card-green rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Santri</p>
              <p className="text-3xl font-bold mt-1">{stats.totalSantri}</p>
            </div>
            <Users className="w-10 h-10 opacity-70" />
          </div>
        </div>
        <div className="stat-card-blue rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Ustadz</p>
              <p className="text-3xl font-bold mt-1">{stats.totalUstadz}</p>
            </div>
            <UserCog className="w-10 h-10 opacity-70" />
          </div>
        </div>
        <div className="stat-card-orange rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Kelas Halaqah</p>
              <p className="text-3xl font-bold mt-1">{stats.totalHalaqah}</p>
            </div>
            <BookOpen className="w-10 h-10 opacity-70" />
          </div>
        </div>
        <div className="stat-card-purple rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Baris</p>
              <p className="text-3xl font-bold mt-1">{stats.totalBaris.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 opacity-70" />
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-secondary" />
            <h3 className="font-bold">Top 10 Santri Terbaik</h3>
          </div>
          <div className="space-y-2">
            {stats.top10.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                  <span className="font-medium text-sm">{s.nama}</span>
                </div>
                <span className="text-sm font-semibold text-primary">{s.juz} juz, {s.sisaHalaman} hal</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-bold">10 Santri Butuh Perhatian</h3>
          </div>
          <div className="space-y-2">
            {stats.bottom10.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-destructive/10 text-destructive">{i + 1}</span>
                  <span className="font-medium text-sm">{s.nama}</span>
                </div>
                <span className="text-sm font-semibold text-destructive">{s.juz} juz, {s.sisaHalaman} hal</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Month Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setViewMonth('prev')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMonth === 'prev' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {monthNames[prevMonth]} {prevMonthYear}
        </button>
        <button onClick={() => setViewMonth('current')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMonth === 'current' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {monthNames[currentMonth]} {currentYear}
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Rows */}
        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <h3 className="font-bold mb-4">Statistik Baris Setoran Harian</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={viewMonth === 'current' ? stats.dailyRowsCurrent : stats.dailyRowsPrev}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sabaq" fill="#2e8b57" name="Sabaq" />
              <Bar dataKey="sabqi" fill="#3b82f6" name="Sabqi" />
              <Bar dataKey="manzil" fill="#f97316" name="Manzil" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution */}
        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <h3 className="font-bold mb-4">Distribusi Nilai Kelancaran</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={viewMonth === 'current' ? stats.scoreDistCurrent : stats.scoreDistPrev}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" fontSize={11} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="count" fill="#a855f7" name="Jumlah" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Class Distribution */}
        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <h3 className="font-bold mb-4">Distribusi Setoran per Kelas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={viewMonth === 'current' ? stats.classDistCurrent : stats.classDistPrev}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kelas" fontSize={11} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="count" name="Jumlah Setoran" radius={[6, 6, 0, 0]}>
                {(viewMonth === 'current' ? stats.classDistCurrent : stats.classDistPrev).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Capaian per Kelas */}
        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <h3 className="font-bold mb-4">Capaian Tahfidz per Kelas (Baris)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={viewMonth === 'current' ? stats.capaianCurrent : stats.capaianPrev}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kelas" fontSize={11} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Bar dataKey="baris" name="Total Baris" radius={[6, 6, 0, 0]}>
                {(viewMonth === 'current' ? stats.capaianCurrent : stats.capaianPrev).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Target Pie */}
        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <h3 className="font-bold mb-4">Prosentase Target Pencapaian</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.targetPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                {stats.targetPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hafalan Distribution */}
        <div className="bg-card rounded-xl p-5 shadow-sm border">
          <h3 className="font-bold mb-4">Distribusi Hafalan Santri</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.hafalanDist} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={90} label={({ range, count }) => `${range}: ${count}`}>
                {stats.hafalanDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
