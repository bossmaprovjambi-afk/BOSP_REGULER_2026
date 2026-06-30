// Menggunakan jalur API publik Google Sheets agar pembacaan sel kilat dan anti-loading lama
const spreadsheetId = "1vTNn0ZAz-vXzFtyT2PTWH05V-RjZtHI4AK3VfOhqOc0bAxo2X_kp21i96tBBjMs04_XWs_0-Sa_nCSc"; 
const jsonUrl = `https://google.com{spreadsheetId}/gviz/tq?tqx=out:json&gid=147011660`;

function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').innerText = `Update terakhir: ${now.toLocaleDateString('id-ID')}, ${now.toLocaleTimeString('id-ID')}`;
}
setInterval(updateClock, 1000);

async function muatDataGoogleSheet() {
  try {
    const response = await fetch(jsonUrl);
    const rawText = await response.text();
    
    // Membersihkan teks bungkus Google API agar menjadi format JSON murni
    const jsonString = rawText.substring(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1);
    const json = JSON.parse(jsonString);
    const rows = json.table.rows;

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ""; 

    let totalSekolahCount = 0;
    let lengkapCount = 0;
    let belumLengkapCount = 0;

    // Loop membaca baris data (Dimulai dari baris ke-2 / indeks 1 agar judul baris atas terlewati)
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].c;
      
      // Memastikan Kolom B (NPSN) dan Kolom C (Nama Sekolah) tidak kosong
      if (cells && cells[1] && cells[2]) {
        const npsn = cells[1].v ? cells[1].v.toString() : "";
        const namaSekolah = cells[2].v ? cells[2].v.toString() : "";
        const statusSekolah = cells[3] && cells[3].v ? cells[3].v.toString() : "Negeri";
        const kabupaten = cells[4] && cells[4].v ? cells[4].v.toString() : "Provinsi Jambi";

        totalSekolahCount++;
        let checkedMonthsHtml = "";
        let totalSudahKirimBulan = 0;

        // Membaca status bulan dari Kolom G sampai R (Indeks cell 6 sampai 17)
        for (let m = 6; m <= 17; m++) {
          const valBulan = cells[m] && cells[m].v ? cells[m].v.toString().toUpperCase() : "";
          if (valBulan.includes("SUDAH")) {
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
    }

    // Update Angka Rekap Utama Atas
    document.getElementById('totalSekolah').innerText = totalSekolahCount;
    document.getElementById('lengkapSekolah').innerText = lengkapCount;
    document.getElementById('belumLengkapSekolah').innerText = belumLengkapCount;
    document.getElementById('persenSelesai').innerText = totalSekolahCount > 0 ? ((lengkapCount / totalSekolahCount) * 100).toFixed(1) + "%" : "0%";

    // Matikan Loading, Tampilkan Tabel Utama
    document.getElementById('tableLoading').style.display = "none";
    document.getElementById('mainTable').style.display = "table";

  } catch (err) {
    document.getElementById('tableLoading').innerHTML = `<span style="color:#dc2626;"><i class="fa-solid fa-circle-exclamation"></i> Gagal terhubung. Pastikan setelan share spreadsheet Anda sudah 'Siapa saja yang memiliki link'.</span>`;
    console.error(err);
  }
}

window.onload = () => {
  updateClock();
  muatDataGoogleSheet();
};

// Fungsi Kolom Pencarian Aktif
document.getElementById('searchInput').addEventListener('keyup', function() {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#tableBody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
});
