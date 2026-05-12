# BlindMaze

Game memori maze berbasis web. Dimainkan di resolusi tablet 1000x600px.

## Cara Bermain

1. Masukkan username, klik **Play Game**.
2. **Fase Menghafal (10 detik)**: Dinding terlihat. Hafalkan jalur menuju titik finish. Pemain tidak bisa bergerak.
3. **Fase Bergerak (20 detik)**: Dinding menghilang. Gunakan **tanda panah** untuk bergerak ke finish tanpa menabrak dinding.
4. Jika menabrak dinding atau kehabisan waktu, **1 nyawa berkurang** dan stage diulang.
5. Jika sampai finish, naik ke **stage berikutnya** dengan dinding dan posisi start/finish baru.
6. **Hint**: Klik tombol Hint (1x per stage) untuk melihat dinding selama 1 detik.
7. **Game Over** saat nyawa habis. Skor bisa disimpan ke Leaderboard.

## Alur Game

1. `init()` dipanggil saat halaman dimuat → layar welcome muncul.
2. User input username → klik Play Game → `startGame()` dipanggil.
3. `generateNewStage()`:
   - Generate dinding acak (segmen horizontal, vertikal, L-shape, block 2x2).
   - Validasi BFS untuk memastikan jalur dari start ke finish selalu ada.
   - Render grid 10x10.
   - Mulai fase menghafal (10 detik).
4. Setelah 10 detik → fase bergerak (20 detik).
5. Pemain bergerak dengan arrow key → `movePlayer()`.
   - Jika kena dinding → alert + `loseLife()` → restart stage atau game over.
   - Jika sampai finish → alert + `stageNumber++` + `generateNewStage()`.
   - Jika waktu habis → alert + `loseLife()`.
6. **Game Over** (`gameOver()`):
   - Modal muncul dengan username, stage, tombol Save Score.
   - Save score → simpan ke localStorage → tampilkan leaderboard → kembali ke welcome.

## Generate Dinding

- 6-9 segmen dinding ditempatkan secara acak.
- Tipe segmen: horizontal (2-4 cell), vertikal (2-4 cell), L-shape, atau block 2x2.
- Start selalu di kolom kiri (baris acak), finish di kolom kanan (baris acak).
- Start dan finish tidak pernah menjadi dinding.
- **BFS (Breadth-First Search)** memvalidasi jalur dari start ke finish.
- Jika jalur terblokir, dinding yang menghalangi dihapus satu per satu hingga jalur terbuka.
- Terverifikasi: 2000/2000 generasi memiliki jalur valid.

## Struktur Grid

- Grid 10x10, setiap cell 48x48px.
- Class CSS: `.cell` (default), `.start` (hijau), `.finish` (kuning), `.wall` (abu-abu), `.wall-hidden` (sama dengan default, untuk dinding yang disembunyikan).
- Pemain dirender terpisah dengan `position: absolute` (lingkaran biru 38px).

## Layar

| Layar | Deskripsi |
|---|---|
| Welcome | Input username, Play Game, Show Instructions, Leaderboard |
| Game | Header (username, stage, timer, lives, phase), grid 10x10, tombol Hint |
| Instructions Modal | Penjelasan cara bermain |
| Leaderboard Modal | Tabel skor dari localStorage, urutan stage descending |
| Game Over Modal | Username, stage, tombol Save Score |

## Leaderboard

- Disimpan di `localStorage` dengan key `blindmaze_scores`.
- Format: `[{ username, stage, date }]`.
- Diurutkan stage descending.
- Ditampilkan di tabel dengan peringkat.

## Konfigurasi

| Variabel | Nilai | Deskripsi |
|---|---|---|
| `GRID_SIZE` | 10 | Ukuran grid (10x10) |
| `MEMORIZE_TIME` | 10 | Durasi fase menghafal (detik) |
| `MOVE_TIME` | 20 | Durasi fase bergerak (detik) |
| `MAX_LIVES` | 5 | Jumlah nyawa maksimal |
| `CELL_SIZE` | 48 | Ukuran cell dalam pixel |
| `GAME_WIDTH` | 1000 | Lebar container game |
| `GAME_HEIGHT` | 600 | Tinggi container game |

## Catatan

- Single page application (index.html).
- Tidak menggunakan ES6 modules (import/export).
- Kontrol hanya dengan arrow keys.
- Tidak ada console error di Google Chrome.
