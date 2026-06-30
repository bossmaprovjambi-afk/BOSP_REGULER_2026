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
    
    const lines = textData.split("\n");
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ""; 

    let totalSekolahCount = 0;
    let lengkapCount = 0;
    let belumLengkapCount = 0;

    // Loop membaca data dari baris paling atas sampai bawah
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].trim()) continue; 

      // Pemisah tanda koma berbasis regex cerdas
      const col = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(item => item.replace(/"/g, '').trim());

      // KUNCI AMAN: Jika kolom terlalu pendek (seperti baris judul/merged), langsung lewati!
      if (!col || col.length < 5) continue;
      
      // Ambil kolom NPSN (Indeks 1) dan pastikan berupa angka murni (menyaring judul kolom)
      const npsn = col[1];
      if (!npsn || isNaN(npsn)) continue; 

      totalSekolahCount++;
      
      const namaSekolah = col[2] || "-";
      const statusSekolah = col[3] || "Negeri";
      const kabupaten = col[4] || "Provinsi Jambi";

      let checkedMonthsHtml = "";
      let totalSudahKirimBulan = 0;

      // Loop membaca status 12 bulan (Kolom G sampai R / indeks 6 sampai 17)
      for (let m = 6; m <= 17; m++) {
        const statusBulan = col[m] ? col[m].toUpperCase() : "";
        
        if (statusBulan.includes("SUDAH") || statusBulan.includes("✓")) {
          checkedMonthsHtml += `<td><i class="fa-solid fa-square-check icon-green"></i></td>`;
          totalSudahKirimBulan++;
        } else {
          checkedMonthsHtml += `<td><i class="fa-solid fa-square-xmark icon-red"></i></td>`;
        }
      }

      if (totalSudahKirimBulan === 12) {
        lengkapCount++;
      } else {
        belumLengkapCount++;
      }

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

    // Suntikkan Angka Hasil Rekapitulasi Otomatis ke Kartu Atas
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

// Logika Kotak Input Pencarian Sekolah Aktif
document.getElementById('searchInput').addEventListener('keyup', function() {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#tableBody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
});
