// Mengubah link spreadsheet kamu menjadi format pembacaan jalur data CSV eksternal
const csvUrl = "https://google.com";

// Menampilkan Jam Waktu Live Real-Time
function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').innerText = `Update terakhir: ${now.toLocaleDateString('id-ID')}, ${now.toLocaleTimeString('id-ID')}`;
}
setInterval(updateClock, 1000);

async function muatDataGoogleSheet() {
  try {
    const response = await fetch(csvUrl);
    const textData = await response.text();
    
    // Parsing text CSV menjadi baris array matriks
    const rows = textData.split("\n").map(row => {
      // Mengatasi pemisah koma di dalam tanda kutip teks nama sekolah
      return row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(",");
    });

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ""; // Bersihkan baris dummy awal

    let totalSekolahCount = 0;
    let lengkapCount = 0;
    let belumLengkapCount = 0;

    // Mulai loop data pada baris ke-3 (indeks 2) untuk mengabaikan judul tabel spreadsheet
    for (let i = 2; i < rows.length; i++) {
      const col = rows[i].map(c => c.replace(/"/g, '').trim()); // Bersihkan tanda petik teks

      // Validasi kolom memastikan data NPSN dan Nama Sekolah ada
      if (col[1] && col[2]) {
        totalSekolahCount++;
        
        let checkedMonthsHtml = "";
        let totalSudahKirimBulan = 0;

        // Membaca 12 kolom bulan (Kolom G sampai R atau indeks 6 sampai 17)
        for (let m = 6; m <= 17; m++) {
          const statusBulan = col[m] ? col[m].toUpperCase() : "";
          if (statusBulan.includes("SUDAH")) {
            checkedMonthsHtml += `<td><i class="fa-solid fa-square-check icon-green"></i></td>`;
            totalSudahKirimBulan++;
          } else {
            checkedMonthsHtml += `<td><i class="fa-solid fa-square-xmark icon-red"></i></td>`;
          }
        }

        // Tentukan kelengkapan data 12 bulan penuh
        if (totalSudahKirimBulan === 12) {
          lengkapCount++;
        } else {
          belumLengkapCount++;
        }

        // Susun baris HTML untuk disuntikkan ke dalam tabel web
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

    // Suntikkan angka total kalkulasi kumulatif ke kartu rekapitulasi atas
    document.getElementById('totalSekolah').innerText = totalSekolahCount;
    document.getElementById('lengkapSekolah').innerText = lengkapCount;
    document.getElementById('belumLengkapSekolah').innerText = belumLengkapCount;
    document.getElementById('persenSelesai').innerText = ((lengkapCount / totalSekolahCount) * 100).toFixed(1) + "%";

    // Matikan indikator loading dan nyalakan tabel
    document.getElementById('tableLoading').style.display = "none";
    document.getElementById('mainTable').style.display = "table";

  } catch (err) {
    document.getElementById('tableLoading').innerHTML = `<span style="color:#dc2626;"><i class="fa-solid fa-circle-exclamation"></i> Gagal Memuat Data. Pastikan opsi 'Publish to Web' di Google Sheet Anda aktif.</span>`;
    console.error(err);
  }
}

// Jalankan sistem saat browser selesai dimuat
window.onload = () => {
  updateClock();
  muatDataGoogleSheet();
};

// Logika Filter Kolom Pencarian Sekolah Atas
document.getElementById('searchInput').addEventListener('keyup', function() {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#tableBody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
});
