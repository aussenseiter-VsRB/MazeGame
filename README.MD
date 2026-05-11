


# Dokumentasi Game Maze

## 1. Maze Generation

Algoritma yang digunakan adalah **Iterative DFS (Recursive Backtracking)** untuk menghasilkan perfect maze, yaitu maze yang memiliki tepat satu jalur antara dua titik mana pun.

Langkah-langkah:
1. Inisialisasi grid 15x15. Setiap cell memiliki empat tembok (atas, kanan, bawah, kiri).
2. Mulai dari cell pojok kiri atas (0,0), tandai sebagai sudah dikunjungi.
3. Masukkan cell awal ke dalam stack.
4. Selama stack tidak kosong:
   - Ambil cell dari puncak stack.
   - Cari tetangga yang belum dikunjungi.
   - Jika ada, pilih secara acak, hapus tembok antara cell saat ini dan tetangga yang dipilih, tandai tetangga sebagai sudah dikunjungi, lalu masukkan ke stack.
   - Jika tidak ada, pop stack (mundur).
5. Ulangi hingga semua cell telah dikunjungi.

## 2. Struktur Data Cell

Setiap cell direpresentasikan sebagai objek dengan properti berikut:

```javascript
{
  row: number,     // indeks baris
  col: number,     // indeks kolom
  walls: {         // status tembok di setiap sisi
    top: boolean,
    right: boolean,
    bottom: boolean,
    left: boolean
  },
  visited: boolean // status kunjungan untuk algoritma generasi
}
```

Nilai `true` pada properti `walls` berarti tembok masih ada. Nilai `false` berarti tembok sudah dihapus dan dapat dilewati.

## 3. Player Movement

Saat pemain menggerakkan karakter, fungsi `movePlayer(direction) akan:

1. Memeriksa status `gameOver`. Jika true, tidak ada aksi.
2. Mengambil data cell tempat pemain berada.
3. Memeriksa keberadaan tembok di arah yang dituju:
   - Jika ada tembok, pergerakan dibatalkan.
   - Jika tidak, lanjut ke langkah berikutnya.
4. Memperbarui posisi baris/kolom pemain.
5. Menghitung ulang posisi visual menggunakan rumus `left = col * CELL_SIZE + 3` dan `top = row * CELL_SIZE + 3`.
6. Memeriksa apakah pemain mencapai cell exit (pojok kanan bawah). Jika ya, game over, timer berhenti, dan pesan kemenangan ditampilkan.

Kontrol keyboard mendukung:
- `ArrowUp` / `W` → atas
- `ArrowDown` / `S` → bawah
- `ArrowLeft` / `A` → kiri
- `ArrowRight` / `D` → kanan

## 4. Rendering

Fungsi `renderMaze()`:
1. Membersihkan elemen `#maze`.
2. Mengatur CSS Grid dengan `grid-template-columns` dan `grid-template-rows` sesuai ukuran maze.
3. Melakukan iterasi seluruh cell:
   - Membuat elemen `<div class="cell">`.
   - Jika cell adalah exit, tambahkan class `exit`.
   - Untuk setiap tembok yang masih ada, buat elemen `<div class="wall (top|right|bottom|left)">` di dalam cell.
   - Masukkan cell ke dalam elemen `#maze`.
4. Player dirender secara terpisah menggunakan CSS `position: absolute`, bukan sebagai bagian dari grid.

## 5. Timer

Fungsi `startTimer()`:
- Menginisialisasi `seconds = 0`.
- Menampilkan `00:00`.
- Menggunakan `setInterval` dengan interval 1 detik untuk increment `seconds`.
- Format tampilan: `MM:SS`.

Fungsi `stopTimer()`:
- Menghentikan interval dengan `clearInterval`.

## 6. Alur Game

1. `initGame()` dipanggil saat halaman dimuat.
2. Di dalam `initGame()`:
   - Menyembunyikan pesan kemenangan.
   - Menghentikan timer.
   - Mereset variabel (posisi pemain ke (0,0), `gameOver = false`).
   - Memanggil `generateMaze()` untuk membuat maze baru.
   - Memanggil `renderMaze()` untuk menampilkan maze.
   - Memanggil `updatePlayerPosition()` untuk menempatkan pemain.
   - Memanggil `startTimer()` untuk memulai timer.
3. Pemain bergerak menggunakan tombol navigasi.
4. Saat mencapai exit, timer berhenti dan pesan kemenangan muncul.
5. Tombol "Try Again" memanggil `initGame()` untuk memulai game baru.

## 7. Konfigurasi

| Variable | Nilai | Deskripsi |
|---|---|---|
| `COLS` | 15 | Jumlah kolom maze |
| `ROWS` | 15 | Jumlah baris maze |
| `CELL_SIZE` | 35 | Ukuran cell dalam pixel |
