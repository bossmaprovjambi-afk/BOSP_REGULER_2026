// Kunci API resmi gratisan yang baru saja kamu buat di Google Cloud
const apiKey = "AIzaSyBOXoFmL1qmQKB_jQMewivQt-R07ib6M4E";

// ID unik file Google Spreadsheet kamu (diambil dari URL link edit spreadsheet)
const spreadsheetId = "1eqNg_asXE8QFR1_HKELJUDtKZkzejonaVozv6XbS4mk";

// Menggunakan Google Sheets API v4 resmi untuk mengambil data tab 'STATUS KIRIM' secara instan
const apiUrl = `https://googleapis.com{spreadsheetId}/values/STATUS KIRIM?key=${apiKey}`;

// Fungsi Menampilkan Jam Waktu Live Real-Time
function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').innerText = `Update terakhir: ${now.toLocaleDateString('id-ID')}, ${now.toLocaleTimeString('id-ID')}`;
}
setInterval(updateClock, 1000);

// Logika Utama Mengambil Data dari Google Sheets API v4
async function AmbilDataBospJambi() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Ambil baris data tabel dari respons JSON resmi Google
    const rows = data.values;

    if (!rows || rows.length === 0) {
      throw new Error("Data tidak ditemukan atau sheet kosong.");
    }

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ""; // Bersihkan baris lama

    let totalSekolahCount = 0;
    let lengkapCount = 0;
    let belumLengkapCount = 0;

    // Loop membaca baris data (Dimulai dari baris ke-3 / indeks 2 agar judul merged atas terlewati)
    for (let i = 2; i < rows.length; i++) {
      const col = rows[i];
      
      // Pengaman: Lewati jika baris kosong atau tidak memiliki data NPSN & Nama Sekolah
      if (!col || col.length < 5) continue;
      if (!col[1] || !col[2]) continue;

      const npsn = col[1].trim();
      const namaSekolah = col[2].trim();

      // Abaikan jika baris tersebut adalah teks judul kolom bawaan spreadsheet
      if (namaSekolah.toUpperCase() === "NAMA SEKOLAH" || npsn.toUpperCase() === "NPSN" || namaSekolah.toUpperCase().includes("LAPORAN")) {
        continue;
      }

      totalSekolahCount++;
      
      // Pemetaan Utama: Lewati kolom E (Kecamatan) di indeks ke-4, gunakan kolom F (Kabupaten) di indeks ke-5
      const statusSekolah = col[3] ? col[3].trim() : "Negeri"; 
      const kabupaten = col[5] ? col[5].trim() : "Provinsi Jambi"; 

      let checkedMonthsHtml = "";
      let totalSudahKirimBulan = 0;

      // LOOP MATRIKS 12 BULAN: Lewati kolom G (Nama Kepsek) dan H (No HP) di indeks 6 & 7
      // Bulan Januari dimulai tepat dari indeks ke-8 (Kolom I) sampai indeks ke-19 (Kolom T)
      for (let m = 8; m <= 19; m++) {
        const statusBulan = col[m] ? col[m].toUpperCase().trim() : "";
        
        if (statusBulan.includes("SUDAH") || statusBulan.includes("✓")) {
          checkedMonthsHtml += `<td><i class="fa-solid fa-square-check icon-green"></i></td>`;
          totalSudahKirimBulan++;
        } else {
          checkedMonthsHtml += `<td><i class="fa-solid fa-square-xmark icon-red"></i></td>`;
        }
      }

      // Tentukan status kelengkapan berkas (Lengkap jika 12 bulan penuh)
      if (totalSudahKirimBulan === 12) {
        lengkapCount++;
      } else {
        belumLengkapCount++;
      }

      // Susun baris HTML dan suntikkan ke dalam tabel web
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

    // Suntikkan Angka Hasil Rekapitulasi Kumulatif ke Kartu Atas
    document.getElementById('totalSekolah').innerText = totalSekolahCount;
    document.getElementById('lengkapSekolah').innerText = lengkapCount;
    document.getElementById('belumLengkapSekolah').innerText = belumLengkapCount;
    document.getElementById('persenSelesai').innerText = totalSekolahCount > 0 ? ((lengkapCount / totalSekolahCount) * 100).toFixed(1) + "%" : "0%";

    // Matikan pesan loading, tampilkan tabel data utama
    document.getElementById('tableLoading').style.display = "none";
    document.getElementById('mainTable').style.display = "table";

  } catch (error) {
    document.getElementById('tableLoading').innerHTML = `<span style="color:#dc2626;"><i class="fa-solid fa-circle-exclamation"></i> Gagal memuat data live dari Google Sheet API. Pastikan setelan share spreadsheet Anda sudah 'Siapa saja yang memiliki link'.</span>`;
    console.error(error);
  }
}

// Jalankan fungsi penarikan data secara otomatis saat web dibuka pertama kali
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
