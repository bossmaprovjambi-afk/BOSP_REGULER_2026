// Kunci API resmi gratisan yang sudah kamu aktifkan di Google Cloud
const apiKey = "AIzaSyBOXoFmL1qmQKB_jQMewivQt-R07ib6M4E";

// ID unik file Google Spreadsheet kamu
const spreadsheetId = "1eqNg_asXE8QFR1_HKELJUDtKZkzejonaVozv6XbS4mk";

// PERBAIKAN UTAMA: Menggunakan %20 untuk spasi nama tab STATUS KIRIM agar dibaca akurat oleh API
const apiUrl = `https://googleapis.com{spreadsheetId}/values/STATUS%20KIRIM?key=${apiKey}`;

function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').innerText = `Update terakhir: ${now.toLocaleDateString('id-ID')}, ${now.toLocaleTimeString('id-ID')}`;
}
setInterval(updateClock, 1000);

async function AmbilDataBospJambi() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Jika Google API mengembalikan pesan error atau penolakan
    if (data.error) {
      throw new Error(data.error.message);
    }

    const rows = data.values;
    if (!rows || rows.length === 0) {
      throw new Error("Data tidak ditemukan atau sheet kosong.");
    }

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ""; 

    let totalSekolahCount = 0;
    let lengkapCount = 0;
    let belumLengkapCount = 0;

    // Loop membaca data dari baris ke-3 (indeks 2) melewati judul tabel merged atas
    for (let i = 2; i < rows.length; i++) {
      const col = rows[i];
      
      // Pengaman baris: Pastikan baris memiliki isi kolom data utama
      if (!col || col.length < 5) continue;
      if (col[1] === undefined || col[2] === undefined) continue;

      const npsn = String(col[1]).trim();
      const namaSekolah = String(col[2]).trim();

      // Lewati jika baris tersebut berisi teks judul kolom pembuka spreadsheet
      if (!namaSekolah || namaSekolah.toUpperCase() === "NAMA SEKOLAH" || npsn.toUpperCase() === "NPSN" || namaSekolah.toUpperCase().includes("LAPORAN")) {
        continue;
      }

      totalSekolahCount++;
      
      // Sesuai Permintaan: Saring kolom E (Kecamatan di indeks 4), gunakan kolom F (Kabupaten di indeks 5)
      const statusSekolah = col[3] ? String(col[3]).trim() : "Negeri"; 
      const kabupaten = col[5] ? String(col[5]).trim() : "Provinsi Jambi"; 

      let checkedMonthsHtml = "";
      let totalSudahKirimBulan = 0;

      // LOOP MATRIKS 12 BULAN: Lewati kolom G (Nama Kepsek) dan H (No HP) di indeks 6 & 7
      // Bulan Januari dimulai tepat dari indeks ke-8 (Kolom I) sampai indeks ke-19 (Kolom T)
      for (let m = 8; m <= 19; m++) {
        const valBulan = col[m] ? String(col[m]).toUpperCase().trim() : "";
        
        if (valBulan.includes("SUDAH") || valBulan.includes("✓")) {
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

    // Tampilkan tabel utama, matikan teks loading
    document.getElementById('tableLoading').style.display = "none";
    document.getElementById('mainTable').style.display = "table";

  } catch (error) {
    document.getElementById('tableLoading').innerHTML = `<span style="color:#dc2626;"><i class="fa-solid fa-circle-exclamation"></i> Gagal memuat data: ${error.message}. Periksa setelan nama tab atau share spreadsheet Anda.</span>`;
    console.error(error);
  }
}

window.onload = () => {
  updateClock();
  AmbilDataBospJambi();
};

document.getElementById('searchInput').addEventListener('keyup', function() {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#tableBody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
});
