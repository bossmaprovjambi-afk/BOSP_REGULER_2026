// Menggunakan API Query Google Sheets agar data ditarik dalam bentuk JSON yang stabil dan cepat
const spreadsheetId = "1vTNn0ZAz-vXzFtyT2PTWH05V-RjZtHI4AK3VfOhqOc0bAxo2X_kp21i96tBBjMs04_XWs_0-Sa_nCSc";
const jsonUrl = `https://google.com{spreadsheetId}/gviz/tq?tqx=out:json&gid=147011660`;

// Fungsi Menampilkan Waktu Pembaruan Real-Time
function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').innerText = `Update terakhir: ${now.toLocaleDateString('id-ID')}, ${now.toLocaleTimeString('id-ID')}`;
}
setInterval(updateClock, 1000);

// Logika Utama Mengambil dan Memproses Data Google Sheet
async function AmbilDataBospJambi() {
  try {
    const response = await fetch(jsonUrl);
    const rawText = await response.text();
    
    // Membersihkan teks bungkus bawaan Google agar menjadi format JSON murni yang valid
    const jsonString = rawText.substring(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1);
    const jsonData = JSON.parse(jsonString);
    const rows = jsonData.table.rows;

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ""; // Bersihkan baris lama

    let totalSekolahCount = 0;
    let lengkapCount = 0;
    let belumLengkapCount = 0;

    // Loop membaca baris data Google Sheet
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].c;
      
      // Keamanan: Pastikan sel data tidak kosong dan memiliki kolom minimum
      if (!cells || cells.length < 5) continue;

      // Ambil nilai data berdasarkan posisi kolom di spreadsheet
      const npsn = cells[1] && cells[1].v ? cells[1].v.toString().trim() : "";
      const namaSekolah = cells[2] && cells[2].v ? cells[2].v.toString().trim() : "";
      const statusSekolah = cells[3] && cells[3].v ? cells[3].v.toString().trim() : "Negeri";
      const kabupaten = cells[4] && cells[4].v ? cells[4].v.toString().trim() : "Provinsi Jambi";

      // Saring baris: Jangan masukkan baris judul tabel atau baris kosong ke daftar sekolah
      if (!namaSekolah || namaSekolah.toUpperCase() === "NAMA SEKOLAH" || npsn.toUpperCase() === "NPSN" || namaSekolah.toUpperCase().includes("LAPORAN")) {
        continue;
      }

      totalSekolahCount++;
      let checkedMonthsHtml = "";
      let totalSudahKirimBulan = 0;

      // LOOP MATRIKS 12 BULAN: Membaca kolom G sampai R (Indeks cell 6 sampai 17)
      for (let m = 6; m <= 17; m++) {
        const statusBulan = cells[m] && cells[m].v ? cells[m].v.toString().toUpperCase().trim() : "";
        
        if (statusBulan.includes("SUDAH") || statusBulan.includes("✓")) {
          checkedMonthsHtml += `<td><i class="fa-solid fa-square-check icon-green"></i></td>`;
          totalSudahKirimBulan++;
        } else {
          checkedMonthsHtml += `<td><i class="fa-solid fa-square-xmark icon-red"></i></td>`;
        }
      }

      // Hitung akumulasi kelengkapan sekolah (Lengkap jika sudah mengirim 12 bulan penuh)
      if (totalSudahKirimBulan === 12) {
        lengkapCount++;
      } else {
        belumLengkapCount++;
      }

      // Susun baris HTML dan suntikkan ke tabel
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

    // Suntikkan Angka Ringkasan ke Kartu Statistik Atas secara Akurat
    document.getElementById('totalSekolah').innerText = totalSekolahCount;
    document.getElementById('lengkapSekolah').innerText = lengkapCount;
    document.getElementById('belumLengkapSekolah').innerText = belumLengkapCount;
    document.getElementById('persenSelesai').innerText = totalSekolahCount > 0 ? ((lengkapCount / totalSekolahCount) * 100).toFixed(1) + "%" : "0%";

    // Matikan indikator pesan loading, tampilkan tabel data live utama
    document.getElementById('tableLoading').style.display = "none";
    document.getElementById('mainTable').style.display = "table";

  } catch (error) {
    document.getElementById('tableLoading').innerHTML = `<span style="color:#dc2626;"><i class="fa-solid fa-circle-exclamation"></i> Gagal memuat data live dari Google Sheet. Periksa kembali koneksi atau setelan share Anda.</span>`;
    console.error(error);
  }
}

// Eksekusi otomatis saat seluruh halaman web selesai dimuat
window.onload = () => {
  updateClock();
  AmbilDataBospJambi();
};

// Logika Input Kotak Filter Pencarian Aktif
document.getElementById('searchInput').addEventListener('keyup', function() {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#tableBody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
});
