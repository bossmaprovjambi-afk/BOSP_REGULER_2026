// Link CSV resmi yang sudah dipublikasikan dari Google Sheet kamu
const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNn0ZAz-vXzFtyT2PTWH05V-RjZtHI4AK3VfOhqOc0bAxo2X_kp21i96tBBjMs04_XWs_0-Sa_nCSc/pub?gid=147011660&single=true&output=csv";

// Fungsi Menampilkan Waktu Pembaruan Real-Time
function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').innerText = `Update terakhir: ${now.toLocaleDateString('id-ID')}, ${now.toLocaleTimeString('id-ID')}`;
}
setInterval(updateClock, 1000);

// Logika Membaca Data CSV dan Memasukkannya ke Tabel
async function AmbilDataBospJambi() {
  try {
    const response = await fetch(csvUrl);
    const textData = await response.text();
    
    // Memisahkan baris data CSV secara berurutan
    const lines = textData.split("\n");
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ""; // Bersihkan isi baris draf lama

    let totalSekolahCount = 0;
    let lengkapCount = 0;
    let belumLengkapCount = 0;

    // Membaca baris mulai indeks ke-2 (Baris ke-3 di Sheet asli) agar judul kolom terlewati
    for (let i = 2; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Abaikan jika ada baris kosong di bawah tabel

      // Regex handal untuk memisahkan koma, menjaga agar teks nama sekolah yang mengandung koma tidak hancur
      const col = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(item => item.replace(/"/g, '').trim());

      // Validasi: Pastikan kolom NPSN (Indeks 1) dan Nama Sekolah (Indeks 2) terisi data
      if (col[1] && col[2]) {
        totalSekolahCount++;
        
        let checkedMonthsHtml = "";
        let totalSudahKirimBulan = 0;

        // Loop membaca 12 bulan (Kolom Januari - Desember berada di indeks kolom 6 sampai 17)
        for (let m = 6; m <= 17; m++) {
          const statusBulan = col[m] ? col[m].toUpperCase() : "";
          
          if (statusBulan.includes("SUDAH") || statusBulan.includes("✓")) {
            checkedMonthsHtml += `<td><i class="fa-solid fa-square-check icon-green"></i></td>`;
            totalSudahKirimBulan++;
          } else {
            checkedMonthsHtml += `<td><i class="fa-solid fa-square-xmark icon-red"></i></td>`;
          }
        }

        // Tentukan status akumulasi sekolah (Lengkap jika sudah kirim 12 bulan penuh)
        if (totalSudahKirimBulan === 12) {
          lengkapCount++;
        } else {
          belumLengkapCount++;
        }

        // Buat baris baru di dalam tabel web
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${totalSekolahCount}</td>
          <td style="color: #64748b;">${col[1]}</td>
          <td class="school-name">${col[2]}</td>
          <td>${col[3] || 'Negeri'}</td>
          <td>${col[4] || 'Provinsi Jambi'}</td>
          ${checkedMonthsHtml}
          <td class="text-center font-bold">${totalSudahKirimBulan}/12</td>
        `;
        tbody.appendChild(tr);
      }
    }

    // Suntikkan Angka Hasil Rekapitulasi Otomatis ke Kartu Statistik Atas
    document.getElementById('totalSekolah').innerText = totalSekolahCount;
    document.getElementById('lengkapSekolah').innerText = lengkapCount;
    document.getElementById('belumLengkapSekolah').innerText = belumLengkapCount;
    document.getElementById('persenSelesai').innerText = totalSekolahCount > 0 ? ((lengkapCount / totalSekolahCount) * 100).toFixed(1) + "%" : "0%";

    // Hilangkan indikator loading, tampilkan tabel utama
    document.getElementById('tableLoading').style.display = "none";
    document.getElementById('mainTable').style.display = "table";

  } catch (error) {
    document.getElementById('tableLoading').innerHTML = `<span style="color:#dc2626;"><i class="fa-solid fa-circle-exclamation"></i> Gagal memuat data secara live. Mohon periksa jaringan atau tautan spreadsheet Anda.</span>`;
    console.error(error);
  }
}

// Eksekusi fungsi penarikan data saat website dibuka pertama kali
window.onload = () => {
  updateClock();
  AmbilDataBospJambi();
};

// Logika Kotak Input Pencarian Sekolah Aktif
document.getElementById('searchInput').addEventListener('keyup', function() {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#tableBody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
});
