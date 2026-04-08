import { Santri, Ustadz, Setoran } from '@/types/tahfidz';
import { daftarSurat } from './quran';

const namaLaki = [
  "Ahmad Fauzi", "Muhammad Rizki", "Abdullah Hasan", "Umar Faruq", "Ali Murtadha",
  "Zainul Abidin", "Hamza Al-Ghifari", "Ibrahim Khalil", "Yusuf Hakim", "Bilal Ramadhan",
  "Salman Al-Farisi", "Khalid Walid", "Taufiq Hidayat", "Rafi Ahmad", "Dani Setiawan",
  "Hafiz Pratama", "Irfan Maulana", "Joko Susilo", "Khairul Anwar", "Lukman Hakim",
  "Mukhtar Efendi", "Naufal Aziz", "Oki Prasetyo", "Putra Ramadhan", "Qasim Abdullah",
  "Ridwan Kamil", "Syahrul Gunawan", "Taqiyuddin Nuh", "Ulil Albab", "Wahyu Hidayat",
  "Zaki Mubarak", "Adi Nugroho", "Bayu Firmansyah", "Cahyo Wibowo", "Daud Iskandar",
  "Fadhil Rahman", "Ghani Putra", "Haikal Ananda", "Ihsan Ramadhan", "Jazuli Harahap"
];
const namaPerempuan = [
  "Aisyah Zahra", "Fatimah Azzahra", "Khadijah Nur", "Maryam Salsabila", "Hafsa Amelia",
  "Ruqayyah Putri", "Zainab Husna", "Safiyyah Aulia", "Ummu Kultsum", "Halimah Sadia"
];

const namaOrangtua = [
  "H. Ahmad Syahid", "Hj. Siti Aminah", "H. Mahmud Hasan", "H. Abdul Karim", "Hj. Nur Hasanah",
  "H. Sulaiman Efendi", "H. Ridwan Hakim", "Hj. Fatimah Wati", "H. Ismail Marzuki", "H. Zainal Abidin",
  "H. Burhanuddin", "H. Muh. Alwi", "Hj. Umi Kalsum", "H. Faisal Rahman", "Hj. Rahmawati",
  "H. Syamsuddin", "H. Darmawan", "Hj. Sri Mulyani", "H. Agus Salim", "H. Haris Fadillah",
  "H. Mukti Ali", "H. Bambang S.", "Hj. Dewi Sartika", "H. Eko Prasetyo", "Hj. Fitri Handayani",
  "H. Gunawan", "H. Herman", "Hj. Ida Farida", "H. Junaidi", "H. Kamaluddin",
  "Hj. Lestari", "H. Mansyur", "H. Nasaruddin", "Hj. Oktavia", "H. Purnomo",
  "H. Quraish", "H. Rachman", "Hj. Sulistyowati", "H. Tarmizi", "H. Usman",
  "Hj. Vina", "H. Wawan", "Hj. Xenia", "H. Yahya", "Hj. Zulaikha",
  "H. Anwar", "H. Budi", "Hj. Citra", "H. Danial", "Hj. Elsa"
];

const asalPondok = [
  "Ponpes Gontor", "Ponpes Al-Amien Prenduan", "Ponpes Lirboyo", "Ponpes Tebuireng", "Ponpes Sidogiri"
];

const kelasHalaqah = ["Halaqah Al-Fatih", "Halaqah Al-Kahfi", "Halaqah An-Nuur", "Halaqah Al-Furqan", "Halaqah Ar-Rahman"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(): string {
  return `08${rand(10, 99)}${rand(1000, 9999)}${rand(100, 999)}`;
}

function generateNISN(): string {
  return `${rand(100, 999)}${rand(1000, 9999)}${rand(100, 999)}`;
}

export function generateUstadz(): Ustadz[] {
  const ustadzNames = ["Ustadz Ahmad Fathoni", "Ustadz Muhammad Haikal", "Ustadz Syamsul Hadi", "Ustadzah Nur Aini", "Ustadz Zakariya Anshori"];
  return ustadzNames.map((nama, i) => ({
    id: `ustadz-${i + 1}`,
    nama,
    jenisKelamin: nama.includes('Ustadzah') ? 'P' as const : 'L' as const,
    noWa: generatePhone(),
    asalPondok: asalPondok[i],
  }));
}

export function generateSantri(ustadzList: Ustadz[]): Santri[] {
  const santriList: Santri[] = [];
  const allNames = [...namaLaki.map(n => ({ nama: n, jk: 'L' as const })), ...namaPerempuan.map(n => ({ nama: n, jk: 'P' as const }))];
  
  for (let i = 0; i < 50; i++) {
    const person = allNames[i % allNames.length];
    const kelas = randItem([7, 8, 9, 10, 11, 12]);
    santriList.push({
      id: `santri-${i + 1}`,
      nama: person.nama,
      jenisKelamin: person.jk,
      kelas,
      kelasHalaqah: kelasHalaqah[i % kelasHalaqah.length],
      nisn: generateNISN(),
      ustadzId: ustadzList[i % ustadzList.length].id,
      orangtua: namaOrangtua[i % namaOrangtua.length],
      waOrangtua: generatePhone(),
    });
  }
  return santriList;
}

export function generateSetoran(santriList: Santri[]): Setoran[] {
  const setoranList: Setoran[] = [];
  const tipeList: Array<'sabaq' | 'sabqi' | 'manzil'> = ['sabaq', 'sabqi', 'manzil'];
  const kehadiranList: Array<'hadir' | 'izin' | 'terlambat' | 'alpha' | 'sakit'> = ['hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'izin', 'terlambat', 'alpha', 'sakit'];
  
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  
  let idCounter = 0;

  santriList.forEach((santri, santriIdx) => {
    // Each santri gets a different level of achievement (1-25 juz)
    const targetJuz = rand(1, 25);
    // More records for students with more juz
    const totalRecords = Math.max(30, targetJuz * rand(8, 15));
    
    let currentJuz = 1;
    let currentSuratIdx = 0;
    
    for (let r = 0; r < totalRecords; r++) {
      const dayOffset = Math.floor((r / totalRecords) * 365);
      const date = new Date(startDate);
      date.setDate(date.getDate() + dayOffset + rand(0, 2));
      if (date > now) break;
      
      const tipe = randItem(tipeList);
      const kehadiran = randItem(kehadiranList);
      
      // Progress through surahs
      const suratInJuz = daftarSurat.filter(s => s.juz.includes(currentJuz));
      const surat = suratInJuz.length > 0 ? suratInJuz[currentSuratIdx % suratInJuz.length] : daftarSurat[0];
      
      const ayatMulai = rand(1, Math.max(1, surat.ayat - 10));
      const ayatSelesai = Math.min(surat.ayat, ayatMulai + rand(3, 20));
      const jumlahBaris = rand(3, 20);
      
      let nilaiKelancaran = 100;
      const mistakes = rand(0, 5);
      nilaiKelancaran -= mistakes * 5;
      
      setoranList.push({
        id: `setoran-${++idCounter}`,
        santriId: santri.id,
        tanggal: date.toISOString().split('T')[0],
        tipe,
        juz: currentJuz,
        surat: surat.nama,
        ayatMulai,
        ayatSelesai,
        jumlahBaris,
        catatan: kehadiran === 'hadir' ? randItem(['Lancar', 'Perlu pengulangan', 'Baik', 'Sangat baik', 'Cukup', 'Masih terbata-bata', 'Tajwid perlu diperbaiki', '']) : '',
        kehadiran,
        nilaiKelancaran: Math.max(60, nilaiKelancaran),
      });
      
      // Advance through Quran
      if (r % 3 === 0) {
        currentSuratIdx++;
        if (suratInJuz.length > 0 && currentSuratIdx >= suratInJuz.length) {
          currentSuratIdx = 0;
          if (currentJuz < targetJuz) currentJuz++;
        }
      }
    }
  });
  
  return setoranList;
}
