# Dunia dalam Angka — Atlas Statistik 12 Negara

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/aam110/makefun-national-statistics-20261126/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/aam110/makefun-national-statistics-20261126/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)

**Dunia dalam Angka** adalah atlas pembanding statistik nasional untuk 12 negara —
Indonesia, Jepang, China, India, Amerika Serikat, Brasil, Jerman, Prancis, Inggris,
Kanada, Australia, dan Korea Selatan — dengan 8 indikator dari World Bank, World
Development Indicators (WDI), tahun 2015–2024.

Bukan portal satu negara: situs ini adalah **alat banding + peringkat + profil**.
Pilih dua atau tiga negara dan bandingkan kedelapan indikatornya berdampingan, lihat
peringkat 12 negara per indikator, atau buka profil satu negara beserta posisinya
terhadap rata-rata 12 negara.

## Yang ada di dalam

- **Beranda** — total penduduk & PDB gabungan 12 negara, PDB per kapita tertinggi,
  pertumbuhan tercepat, grafik tren PDB gabungan 2015–2024, 5 ekonomi terbesar,
  dan kartu semua negara.
- **Peringkat** — tabel peringkat 12 negara per indikator (bisa diurutkan naik/turun)
  plus grafik batang, dengan pemilih indikator dan tahun.
- **Bandingkan** — comparer 3-arah: pilih negara A/B/C, indikator, dan jenis grafik
  (garis/batang); pemenang tiap indikator ditandai ★.
- **Negara** — cari negara, lalu lihat profil lengkapnya: 8 indikator + peringkat,
  grafik tren PDB, dan perbandingan terhadap rata-rata 12 negara.
- **Indikator** — deep-dive per indikator: definisi, kode WDI, grafik tren per negara,
  dan tabel nilai semua negara.
- **Metodologi & Sumber** — semua sumber, kode WDI, dan cara angka dihitung
  (PDB per kapita = PDB ÷ penduduk; peringkat = urutan nilai yang sama).

## Data — nyata, bersumber, konsisten

Semua angka berasal dari **World Bank, World Development Indicators** (dataset
diunduh 26 November 2026, pembaruan terakhir 11 November 2026):

| Indikator | Kode WDI | Tahun |
| --- | --- | --- |
| Penduduk | SP.POP.TOTL | 2015–2024 |
| PDB (US$ berlaku) | NY.GDP.MKTP.CD | 2015–2024 |
| PDB per kapita | PDB ÷ penduduk | 2015–2024 |
| Pertumbuhan PDB | NY.GDP.MKTP.KD.ZG | 2019–2024 |
| Inflasi (CPI) | FP.CPI.TOTL.ZG | 2019–2024 |
| Pengangguran (ILO) | SL.UEM.TOTL.ZS | 2019–2024 |
| Harapan hidup | SP.DYN.LE00.IN | 2019–2023 |
| Penduduk perkotaan | SP.URB.TOTL.IN.ZS | 2019–2024 |

Angka konsisten antar halaman karena semuanya dihitung dari seri data yang sama
di `app/data.js`. Harapan hidup menampilkan tahun 2023 bila tahun 2024 dipilih,
karena WDI terakhir menerbitkan 2023 — dan itu ditandai di layar.

## Menjalankan

```sh
node serve.ts        # lalu buka http://localhost:8080
```

Situs statis murni (HTML + CSS + JS, grafik SVG tanpa library, tanpa network).
Program `main.ts` menyalin `app/` dan `screenshots/` ke `/output` dan menulis
`dossier.json` dengan `vendor/makefun-frontend.ts` dari kit make.fun.

## Kompetisi

Entri untuk [make.fun — Make the best national statistics site](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
(`best-national-statistics-site-20261126-0539`).

## Lisensi

MIT — lihat `LICENSE`.
