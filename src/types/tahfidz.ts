export interface Santri {
  id: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  kelas: number;
  kelasHalaqah: string;
  nisn: string;
  ustadzId: string;
  orangtua: string;
  waOrangtua: string;
}

export interface Ustadz {
  id: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  noWa: string;
  asalPondok: string;
}

export interface Setoran {
  id: string;
  santriId: string;
  tanggal: string;
  tipe: 'sabaq' | 'sabqi' | 'manzil';
  juz: number;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  jumlahBaris: number;
  catatan: string;
  kehadiran: 'hadir' | 'izin' | 'terlambat' | 'alpha' | 'sakit';
  nilaiKelancaran: number;
}

export interface AppSettings {
  namaPesantren: string;
  logoUrl: string;
  theme: string;
}

export type Kehadiran = 'hadir' | 'izin' | 'terlambat' | 'alpha' | 'sakit';
export type TipeSetoran = 'sabaq' | 'sabqi' | 'manzil';
