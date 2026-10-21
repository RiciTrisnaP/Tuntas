# Review repo TUNTAS dan rencana integrasi GenoHack

Tanggal: 21 Oktober 2026, Asia/Jakarta. Baseline Git: `e83443e` (`feat: mockup screen from figma`).

Kesimpulan: fondasi visual dapat dipakai kembali, tetapi repo saat ini masih prototype layar. Repo belum memenuhi target prototype terintegrasi dalam MD. Build yang berhasil belum membuktikan kebenaran data atau keberhasilan alur tindak lanjut.

Review ini tidak mengimplementasikan perintah dalam MD. Dokumen dipakai sebagai spesifikasi pembanding yang juga ditinjau. Kode aplikasi dan dokumen sumber tidak diubah.

## Cakupan dan batas verifikasi

- Seluruh 170 file tracked: 23 file kode/config/dokumentasi dan 147 SVG. Folder internal Git dan dependensi hasil instalasi bukan bagian source yang direview.
- MD 2.249 baris dibaca seluruhnya. Salinan di repo identik dengan `D:/Downloads/GENOHACK2026_Prototype_Mock_Data_Integration_Plan.md`, berdasarkan SHA-256 `8C9D8B2B7AFAB616816493B344C35539FD2B17F52B2844A92B77F41B13D484A6`.
- Workbook XLSX, PDF, DOCX, dan ekspor percakapan yang disebut MD tidak ada di repo. Angka dan keputusan yang dikutip dari sana belum dapat diverifikasi terhadap sumber aslinya. Angka target di bawah berarti **target menurut MD**, bukan hasil pembacaan workbook.
- Pengujian browser dilakukan pada server lokal, viewport 1280 × 720. Frame layar kader/peserta tetap dibatasi aplikasi menjadi 390 px. Pengujian ini bukan matriks seluruh perangkat, audit keamanan produksi, atau validasi medis.

## Temuan implementasi, berdasarkan prioritas

P1 = perlu dibereskan sebelum demo integrasi. P2 = masalah fungsi/presentasi yang perlu ditangani setelah atau bersama alur utama.

### R01 — P1: detail tidak mengikuti pasien yang dipilih

Lokasi: `src/screens/KaderDetail.tsx:67`, `:89`, `:96`, dan data statis `:11–43`.

`useParams().id` hanya dipakai untuk membentuk tautan catat/kembali. Identitas, hasil HPV, kategori, skor, timeline, dan skrip selalu milik Ibu S.

Reproduksi browser: buka `/kader`, pilih **Ibu D., 51 tahun, Negatif**, lalu URL menjadi `/kader/pasien/d` tetapi detail menampilkan **Ibu S., 38 tahun, Positif 16/18, HPV16 terdeteksi**. Ibu N. yang Invalid juga diarahkan ke komponen yang sama. ID yang tidak dikenal tidak divalidasi.

Dampak: demo negatif/retest berubah menjadi kasus positif yang salah. Perbaikan: lakukan lookup berdasarkan ID, turunkan seluruh isi detail dari record tersebut, dan sediakan keadaan pasien tidak ditemukan.

### R02 — P1: tombol Simpan membuang hasil kontak

Lokasi: `src/screens/CatatHasilSheet.tsx:26–30`, `:46`; integrasi parent di `src/screens/KaderDetail.tsx:249`.

Submit hanya `preventDefault()` lalu `onClose()`. Tidak ada callback hasil, pembaruan store, penulisan event, atau penyimpanan jadwal/catatan. Parent hanya menerima penutupan sheet.

Reproduksi browser: isi catatan, pilih **23 Okt**, tekan **Simpan**, lalu buka ulang. Catatan kosong dan tanggal kembali **22 Okt**; riwayat tetap empat aktivitas dan IVA tetap belum dijadwalkan.

Perbaikan: kirim payload yang menyertakan patient/test ID, hasil kontak, tanggal/jam dan catatan ke domain/store; perbarui riwayat dan status. Penyimpanan mock lokal sudah cukup untuk demo sintetis jika cakupannya dijelaskan.

### R03 — P1: unggah mengklaim berhasil tanpa membaca file; pengiriman tidak berjalan

Lokasi: `src/screens/LabUnggah.tsx:22–29`, `:77`, `:80–90`, `:153`, `:314–320`.

`pick()` hanya menyimpan nama dan ukuran file. Konten CSV tidak pernah dibaca atau divalidasi. Pratinjau enam baris dan total 48 sampel tetap dari konstanta, bahkan setelah file dihapus. Label **Terbaca** muncul cukup karena ada objek file. Batas 10 MB tidak diperiksa; `accept` bukan validasi konten dan drag/drop tidak membatasi jenis file.

Tombol **Validasi dan kirim** tidak memiliki handler. Browser mengonfirmasi klik tidak mengubah halaman/state. Dengan demikian klaim bahwa hasil positif otomatis menjadi tugas kader belum memiliki implementasi.

Perbaikan: untuk MVP pilih fixture yang benar-benar diparsing dan divalidasi, atau labeli panel ini sebagai simulasi dan pindahkan integrasi ke generator fixture. Jangan menampilkan status keberhasilan berdasarkan nama file saja. Bila pengiriman dipertahankan, hubungkan ke store dan tangani duplikasi/kegagalan.

### R04 — P1: struktur CerviScan dalam UI tidak cocok dengan kontrak target

Lokasi: `src/screens/LabUnggah.tsx:16–17`, `:115–122`, `:172`, `:195–204`.

UI mengasumsikan empat kanal FAM/HEX/ROX/Cy5 dan tidak menyediakan target HPV52 tersendiri. MD bagian 5.2 dan 7.2 menjelaskan lima baris target per sampel: HPV16, HPV18, HPV52, HR lain, beta-globin. Mapping kanal di UI tidak dapat menggantikan group/pivot berdasarkan target. Pilihan kit juga hanya CerviScan.

Dampak: jalur integrasi yang digambarkan sekarang tidak dapat merepresentasikan seluruh target workbook. Perbaikan: normalisasi menurut nama target dan capability sumber, lalu render tabel dari view model; jangan menganggap empat kanal ini kontrak semua alat. Detail kanal aktual tetap perlu dicocokkan dengan workbook/export sumber.

### R05 — P1: dashboard memakai dataset berbeda dan agregasi yang tidak dapat ditelusuri

Lokasi: `src/screens/DinkesRingkasan.tsx:10–28`, `:38–51`, `:109–115`; `src/screens/DinkesPuskesmas.tsx:8–25`, `:29–59`, `:100–106`.

| Metrik | UI saat ini | Target MD |
|---|---:|---:|
| Diskrining | 1.006 | 180 |
| Positif 16/18 | 12 | 12 |
| Positif lain | 33 | 24 |
| Invalid | 11 | 9 |
| IVA dalam target | 29/45, ditampilkan 64% | 27/36 = 75% |

Seluruh nilai UI, tren mingguan, pembagian Puskesmas A/B/C dan alarm adalah konstanta. Satu angka yang kebetulan sama tidak membuktikan integrasi. Lokasi peserta/fasilitas asal dan statistik undangan tidak memiliki mapping data di repo. MD sendiri menyebut tidak tersedia field domisili dan membolehkan agregasi lab/facility hanya berdasarkan sumber yang tersedia.

Perbaikan: agregasikan satu dataset terverifikasi, tampilkan periode yang sesuai tanggal data, dan gunakan source/lab yang tersedia. Puskesmas asal, undangan, tren atau statistik kader hanya boleh dipertahankan bila ada sumber/mapping eksplisit atau diberi label sebagai skenario sintetis tambahan yang terpisah.

### R06 — P2: kolom kategori hasil lab terpotong pada desktop 1280 px

Lokasi: `src/screens/LabUnggah.tsx:162–163`, `:194–204`, `:227–233`, `:260`.

Sidebar, panel riset 304 px, dan lebar sel pratinjau menyisakan ruang yang terlalu sempit. Card pratinjau memakai `overflow-hidden` tanpa scroll tabel.

Bukti browser: batas kanan card sekitar **904,8 px**, sedangkan header **KATEGORI** mulai sekitar **952,8 px**. Screenshot menunjukkan kolom kategori tidak terlihat. Tidak adanya overflow halaman tidak berarti konten tabel muat: kontennya justru dipotong.

Perbaikan: beri container tabel dengan scroll horizontal dan lebar minimum, pindahkan panel riset pada breakpoint yang sesuai, serta biarkan ringkasan/tombol membungkus dengan tinggi otomatis.

### R07 — P2: CTA inti dan beberapa navigasi tidak memiliki aksi

Lokasi: `src/screens/KaderTugas.tsx:34–40`, `:45–56`, `:124`; `src/screens/KaderDetail.tsx:199–205`, `:237`; `src/screens/PesertaWhatsApp.tsx:127–130`, `:140`; `src/screens/DinkesRingkasan.tsx:95–105`; `src/components/ui.tsx:179`.

Contoh: Telepon/Ingatkan/Hubungi, Pasien/Profil, Ubah urutan, Eskalasi, filter dashboard, Alarm/Laporan, Saya akan datang dan Ubah jadwal. Tombol tersebut terlihat aktif tetapi tidak memiliki handler atau tujuan. Tautan telepon detail hanya `tel:` tanpa nomor.

Browser mengonfirmasi **Saya akan datang** tidak mengubah status. Form pesan hanya mengosongkan draft; pesan tidak ditambahkan ke percakapan. Untuk demo, aksi mock yang mengubah state sudah memadai; WhatsApp API produksi tidak diperlukan.

Perbaikan: prioritaskan CTA yang masuk walkthrough. Hubungkan ke state/route yang benar atau tandai fitur belum tersedia; jangan biarkan alur utama berhenti tanpa umpan balik.

### R08 — P2: antrean kontak memasukkan pasien selesai dan jumlah tidak sesuai

Lokasi: `src/screens/KaderTugas.tsx:62–64`, `:88`; data `src/data/kader.ts:18–22`.

Tab **Perlu ditelepon** mengembalikan seluruh array, termasuk pasien `tab: 'selesai'` dengan hasil negatif dan recall 10 tahun. Kartu ringkasan menampilkan lima perlu ditelepon, tetapi hanya empat record tersedia. Nilai dua lewat batas tidak berasal dari deadline record.

Perbaikan: filter berdasarkan status operasional yang membutuhkan kontak, hitung ringkasan dari antrean yang sama, dan hitung keterlambatan dari tanggal target yang eksplisit. Jika ingin menampilkan seluruh tugas, gunakan tab Semua yang berbeda.

### R09 — P2: prioritas dan konteks pasien belum mempunyai provenance

Lokasi: `src/screens/KaderDetail.tsx:27–31`, `:91–98`, `:147–159`; `src/data/kader.ts:19–22`.

Bobot HPV16 +3, usia +1 dan belum skrining +1 dibuat di komponen. Detail menyatakan sumber CerviScan tetapi tidak ada data terintegrasi yang memasok usia/riwayat, alamat atau NIK parsial. MD membolehkan prioritas operasional, tetapi meminta aturan terdokumentasi dan melarang mengarang profil yang tidak tersedia untuk sumber itu.

Ini bukan temuan bahwa aplikasi menjalankan ML: tidak ditemukan model prediksi atau probabilitas kanker. Masalahnya adalah dasar skor dan data profil belum dapat ditelusuri.

Perbaikan: pindahkan rule ke konfigurasi dengan provenance, gunakan nilai yang tersedia, tampilkan tidak tersedia untuk field yang hilang, dan gunakan ID pseudonim workbook.

## Kesenjangan terhadap target MD

Ini adalah fitur yang belum dibangun, dipisahkan dari bug pada perilaku yang sudah ditawarkan UI.

| Area | Kondisi repo | Yang diperlukan untuk target MD |
|---|---|---|
| Data utama | Empat pasien kader dan enam preview lab sintetis | Snapshot workbook, fixtures 180 record dan regression counts |
| Adapter | Tidak ada NUSA/CerviScan/cobas adapter | Tiga adapter, null handling dan parity dengan Format Standar |
| Domain | Jenis kategori di modul UI; tidak ada engine | Kategori, follow-up, review trigger dan konfigurasi terpisah |
| Patient | Simulasi percakapan WhatsApp | Result/journey negatif, positif, invalid dan next step dari record |
| Doctor | Tidak ada route atau workspace dokter | Queue/detail, alasan review, keputusan dan jejak hasil awal |
| Dinkes | Visual ringkasan/funnel sudah tersedia | Agregasi dataset utama dan per-source interoperability |
| Role demo | Kader, Dinkes, Lab, Peserta | Selaraskan Patient/Doctor/Dinkes dengan keputusan produk; tempatkan operasi kader/lab secara eksplisit |
| Backend/privacy | SPA Vite, semua halaman dapat dibuka langsung | Arsitektur produksi server/auth/otorisasi/audit; demo tetap jelas memakai data sintetis |
| Verifikasi | Build dan lint; tidak ada test/data scripts | Generator, validator, adapter/domain regression dan canonical scenario checks |

Tidak ada dasar untuk menyatakan kebocoran data pasien nyata dari fixture yang tersedia: data di repo dinyatakan sintetis. Namun role switch/navigasi bukan kontrol akses dan prototype ini belum boleh dipakai untuk record nyata. Simulasi WhatsApp juga menampilkan klaim akun resmi/enkripsi dan hasil di SATUSEHAT tanpa implementasi integrasi; beri label simulasi pada halaman itu sendiri.

## Review dokumen MD

Arahnya konsisten untuk membangun interoperabilitas dan follow-up: memisahkan raw/adapters/domain/view models, menjaga null cobas, memisahkan metilasi sebagai riset, memberi target hitungan dan skenario uji, serta menunda ML klinis. Beberapa kontrak perlu dipertegas sebelum implementasi:

1. **Asumsi framework tidak sesuai repo.** Bagian 17 memberi contoh kondisional Next.js, tetapi bagian 19 menyebut proyek saat ini sebagai Next app dan diagram bagian 24 mengasumsikan server Next.js. Repo sebenarnya React + Vite. Koreksi baseline teknis; migrasi framework bukan keharusan untuk integrasi mock. Domain/services/view models tetap dapat dibuat di Vite; dokumentasikan backend produksi atau putuskan migrasi secara terpisah dengan alasan yang jelas.

2. **Sumber utama belum disertakan.** Bagian 4/14/21/22 menyatakan detail workbook dan angka persis, tetapi repo hanya memiliki MD. Tambahkan snapshot sumber, checksum, versi data dan generator yang bisa dijalankan ulang. Dokumen tidak dapat menjadi pengganti bukti bahwa adapter menghasilkan isi workbook yang sama.

3. **Status tidak tersedia belum terwakili di hasil kualitatif.** Bagian 6 menekankan beda missing/NEG, tetapi `QualitativeResult` hanya POSITIVE/NEGATIVE/INVALID; doctor VM juga selalu memiliki HPV52 meskipun cobas tidak menyediakan hasil terpisah. Tambahkan representasi `NOT_AVAILABLE`/capability per target. Target wajib yang hilang harus memicu review/error, bukan jatuh ke cabang negatif pada category engine.

4. **Null Ct kehilangan alasan.** Null karena tidak terdeteksi berbeda dengan kanal tidak tersedia, data tidak dikirim, atau parsing gagal. Simpan status availability/provenance agar UI dapat membedakannya tanpa mengarang hasil. Pertahankan payload asal.

5. **Kontrak waktu follow-up belum lengkap.** Tetapkan `DEMO_AS_OF_DATE`, timezone, batas 60 hari inklusif/tidak, dan prioritas state. Enum mencantumkan IVA_SCHEDULED tetapi schema belum memisahkan jadwal dari pemeriksaan yang benar-benar selesai. Pisahkan tanggal rencana dan pelaksanaan; jangan menghitung tanggal rencana sebagai completed. Dengan begitu skenario pending/overdue tidak berubah hanya karena demo dibuka di tanggal berbeda.

6. **Identitas episode dan join perlu eksplisit.** Join patient ID + source cukup untuk snapshot jika memang unik, tetapi retest dapat menghasilkan beberapa tes untuk orang dan sumber yang sama. Tetapkan screening-test ID atau composite key source/sample/run, cek duplikasi/orphan, dan tautkan follow-up/review/event ke episode yang tepat. Pengelompokan CerviScan juga perlu mengecek konflik patient ID serta target hilang/duplikat.

7. **Aturan derivasi masih menyisakan ambiguitas.** Bagian 7.1 menulis `waktu/result date` meskipun raw NUSA tidak mempunyai field hasil yang jelas, dan rumus delta-Ct belum dinyatakan untuk beberapa target positif. Tetapkan sumber tanggal, pemilihan target dan pembulatan berdasarkan workbook. Tentukan apakah kategori/QC canonical dipertahankan atau dihitung ulang lalu dibandingkan; jangan menggantinya diam-diam.

8. **Definisi KPI perlu melengkapi angka target.** Tetapkan denominator positif (semua sampel atau hasil valid), aturan IVA on-time dibanding semua IVA, populasi dan pembulatan rata-rata hari kontak, perlakuan missing date, serta grain pasien versus episode tes. Ini mencegah dua implementasi yang sama-sama tampak masuk akal menghasilkan KPI berbeda.

Klaim riwayat keputusan/chat, aturan klinis, dan angka workbook dalam MD belum diaudit terhadap berkas aslinya. Review ini menilai konsistensi kontrak dan implementasi, bukan mengesahkan pedoman medis atau persetujuan tim.

## Cakupan per file

| File tracked | Hasil review |
|---|---|
| `.gitignore` | Mencakup node_modules/dist/log/local env; tidak ada temuan spesifik |
| `.oxlintrc.json` | Konfigurasi terbaca; satu warning berasal dari campuran export di ui.tsx |
| `README.md` | Masih boilerplate Vite; perlu petunjuk setup, role/route, batas demo dan sumber data |
| `package.json` | Build/lint berjalan; belum ada script generator, validator atau test |
| `package-lock.json` | Diparsing seluruhnya; manifest root sesuai package.json, 113 entry package, semua entry non-root memiliki resolved; npm ci berhasil |
| `index.html` | Bahasa id, viewport dan title ada; tidak ada temuan blocker |
| `vite.config.ts` | React + Tailwind pada Vite, bukan Next.js; konfigurasi berhasil dibuild |
| `tsconfig.json` | Project references valid pada build |
| `tsconfig.app.json` | Build berhasil; strict null/type checking belum diaktifkan sebagai konfigurasi strict |
| `tsconfig.node.json` | Build berhasil; tidak ada temuan blocker spesifik |
| `src/main.tsx` | Bootstrap React/StrictMode; tidak ada temuan spesifik |
| `src/App.tsx` | Route bekerja; patient-result dan doctor belum ada, belum ada fallback unknown route |
| `src/index.css` | Token desain reusable; belum ada aturan responsive lintas layar desktop; perbaikan overflow perlu di layout komponen |
| `src/components/ui.tsx` | Fondasi komponen reusable; warning Fast Refresh export asset; sidebar tanpa tujuan menjadi tombol tanpa aksi |
| `src/data/kader.ts` | Empat fixture Figma, bukan dataset canonical; lihat R08/R09 |
| `src/screens/KaderTugas.tsx` | R07/R08; tab lain melakukan filter, tetapi antrean telepon mencakup semua pasien |
| `src/screens/KaderDetail.tsx` | R01/R07/R09; data pasien/hasil/timeline tetap |
| `src/screens/CatatHasilSheet.tsx` | R02; belum mengelola focus awal/trap/restore atau membuat background inert meskipun aria-modal=true |
| `src/screens/LabUnggah.tsx` | R03/R04/R06/R07 |
| `src/screens/DinkesRingkasan.tsx` | R05/R07; label Data sintetis sudah ada |
| `src/screens/DinkesPuskesmas.tsx` | R05; garis tren dari SVG Figma, bukan seri waktu dari data; label agregat/sintetis sudah ada |
| `src/screens/dinkesNav.ts` | Route ringkasan/detail tersedia; Alarm/Laporan belum memiliki tujuan |
| `src/screens/PesertaWhatsApp.tsx` | R07; belum menjadi patient clinical result/journey; label simulasi perlu dibuat eksplisit |
| `public/favicon.svg` | XML valid; tidak ditemukan script/event handler/external href |
| `public/assets/catat/*.svg` — 8 file | Seluruhnya dicek sebagai XML/SVG dan konten aktif |
| `public/assets/detail/*.svg` — 22 file | Seluruhnya dicek sebagai XML/SVG dan konten aktif |
| `public/assets/lab/*.svg` — 30 file | Seluruhnya dicek sebagai XML/SVG dan konten aktif |
| `public/assets/puskesmas/*.svg` — 20 file | Seluruhnya dicek sebagai XML/SVG dan konten aktif |
| `public/assets/ringkasan/*.svg` — 30 file | Seluruhnya dicek sebagai XML/SVG dan konten aktif |
| `public/assets/tugas/*.svg` — 22 file | Seluruhnya dicek sebagai XML/SVG dan konten aktif |
| `public/assets/wa/*.svg` — 14 file | Seluruhnya dicek sebagai XML/SVG dan konten aktif |

Seluruh 147 SVG valid secara XML. Tidak ditemukan script, foreignObject, event handler atau external href pada pemeriksaan tersebut. Referensi asset literal di tujuh screen ditemukan. Halaman Dinkes, detail Puskesmas dan Lab yang diobservasi browser tidak memiliki broken image. Ini bukan penilaian visual satu per satu terhadap 147 ikon atau audit kerentanan dependency.

## Hasil verifikasi

| Pemeriksaan | Hasil |
|---|---|
| `npm ci --ignore-scripts` | Berhasil dari lockfile; lifecycle script tidak dijalankan |
| `npm run build` | Lulus: TypeScript project build + Vite production build, 34 modul |
| `npm run lint` | Exit 0, satu warning `react/only-export-components` pada `src/components/ui.tsx:5` |
| Browser route smoke | Home, kader, detail, sheet, Dinkes, detail Puskesmas dan Lab/peserta dapat dimuat |
| Pemilihan pasien negatif | Gagal: membuka detail pasien positif yang sama |
| Simpan kontak/jadwal | Gagal: data hilang setelah sheet ditutup/dibuka |
| Validasi dan kirim lab | Gagal: klik tidak mengubah state |
| CTA Saya akan datang / Kirim | Gagal: tidak mengubah state percakapan/jadwal |
| Lab pada desktop 1280 px | Gagal: kolom kategori terpotong |
| Regression workbook | Belum dapat dijalankan: workbook/fixtures/adapters/test runner belum ada |

## Urutan pekerjaan yang disarankan

1. Sertakan workbook dan bekukan checksum/versi data; koreksi baseline Vite dalam MD.
2. Bangun types/config dan normalisasi fixtures, lalu buktikan 60 + 60 + 60 record serta hitungan kategori/follow-up terhadap workbook.
3. Hubungkan pemilihan pasien, detail, simpan kontak dan journey ke satu store/domain; jalankan skenario canonical negatif/positif/invalid.
4. Ganti angka Dinkes dengan agregasi dataset yang sama dan tambahkan tampilan per-source.
5. Bangun patient result dan doctor review minimal; tetapkan penempatan operasi kader/lab dalam demo role.
6. Rapikan CTA walkthrough, clipping tabel, akses keyboard dan label simulasi. Dokumentasikan setup serta batas prototype di README.

Kriteria demo paling berguna: satu record yang dipilih menampilkan hasil yang benar, aksi tindak lanjut mengubah statusnya, dan perubahan tersebut terlihat pada agregasi yang relevan tanpa mengganti hasil sumber asli.
