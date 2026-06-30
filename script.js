// Tautan CSV resmi dari Google Sheet yang sudah dipublikasikan
const csvUrl = "https://google.com";

// Fungsi Jam Live Real-Time
function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').innerText = `Update terakhir: ${now.toLocaleDateString('id-ID')}, ${now.toLocaleTimeString('id-ID')}`;
}
setInterval(updateClock, 1000);

// Logika Membaca File CSV Google Sheet
async function AmbilDataBospJambi() {
  try {
    const response = await fetch(csvUrl);
    const textData = await response.text();
    
    // Memisahkan teks data berdasarkan baris baru
    const lines = textData.split("\n");
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ""; // Bersihkan baris dummy lama

    let totalSekolahCount = 0;
    let lengkapCount = 0;
    let belumLengkapCount = 0;

    // Membaca data mulai dari baris ke-3 (indeks 2) untuk melewati judul baris atas spreadsheet
    for (let i = 2; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Lewati jika ada baris kosong di bagian bawah

      // Regex cerdas untuk memisahkan koma tetapi menjaga teks yang berada di dalam tanda kutip dua
      const col = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(item => item.replace(/"/g, '').trim());

      // Validasi: Pastikan kolom utama terisi data (Indeks 0: No, Indeks 1: NPSN, Indeks 2: Nama Sekolah)
      if (col[1] && col[2]) {
        totalSekolahCount++;
        
        const npsn = col[1];
        const namaSekolah = col[2];
        const statusSekolah = col[3] || "Negeri";
        const kabupaten = col[4] || "Provinsi Jambi";

        let checkedMonthsHtml = "";
        let totalSudahKirimBulan = 0;

        // MATRIKS BULANAN (Menyesuaikan letak kolom Januari - Desember di spreadsheet asli kamu)
        // Di spreadsheet kamu, kolom bulan dimulai dari indeks ke-6 (Kolom G) sampai indeks ke-17 (Kolom R)
        for (let m = 6; m <= 17; m++) {
          const statusBulan = col[m] ? col[m].toUpperCase() : "";
          
          // Membaca status centang hijau 'SUDAH' vs silang merah 'BELUM'
          if (statusBulan.includes("SUDAH") || statusBulan.includes("✓")) {
            checkedMonthsHtml += `<td><i class="fa-solid fa-square-check icon-green"></i></td>`;
            totalSudahKirimBulan++;
          } else {
            checkedMonthsHtml += `<td><i class="fa-solid fa-square-xmark icon-red"></i></td>`;
          }
        }

        // Tentukan kelengkapan berkas sekolah (Lengkap jika 12 bulan penuh berstatus SUDAH)
        if (totalSudahKirimBulan === 12) {
          lengkapCount++;
        } else {
          belumLengkapCount++;
        }

        // Susun struktur baris dan suntikkan ke dalam tabel web
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${totalSekolahCount}</td>
          <td style="color: #64748b;">${npsn}</td>
          <td class="school-name">${namaSekolah}</td>
          <td>${statusSekolah}</td>
          <td>${kabupaten}</td>
          ${checkedMonthsHtml}
          <td class="text-center font-bold">${totalSudahKirimBulan}/12</td>
        `;
        tbody.appendChild(tr);
      }
    }

    // Perbarui Angka Akumulasi Kumulatif pada Kartu Rekapitulasi Atas
    document.getElementById('totalSekolah').innerText = totalSekolahCount;
    document.getElementById('lengkapSekolah').innerText = lengkapCount;
    document.getElementById('belumLengkapSekolah').innerText = belumLengkapCount;
    document.getElementById('persenSelesai').innerText = totalSekolahCount > 0 ? ((lengkapCount / totalSekolahCount) * 100).toFixed(1) + "%" : "0%";

    // Matikan teks loading, tampilkan tabel data live utama
    document.getElementById('tableLoading').style.display = "none";
    document.getElementById('mainTable').style.display = "table";

  } catch (error) {
    document.getElementById('tableLoading').innerHTML = `<span style="color:#dc2626;"><i class="fa-solid fa-circle-exclamation"></i> Gagal memuat data live dari Google Sheet. Periksa kembali jaringan Anda.</span>`;
    console.error(error);
  }
}

// Jalankan penarikan data secara otomatis saat web dibuka
window.onload = () => {
  updateClock();
  AmbilDataBospJambi();
};

// Logika Input Kotak Filter Pencarian Sekolah Aktif
document.getElementById('searchInput').addEventListener('keyup', function() {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#tableBody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
});
