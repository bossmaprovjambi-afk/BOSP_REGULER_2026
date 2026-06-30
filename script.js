// Link CSV resmi dari publikasi web Google Sheet kamu
const csvUrl = "https://google.com";

function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').innerText = `Update terakhir: ${now.toLocaleDateString('id-ID')}, ${now.toLocaleTimeString('id-ID')}`;
}
setInterval(updateClock, 1000);

// Parser CSV anti-error tingkat pro
function parseCSV(text) {
  let lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    let next = text[i+1];
    
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++; 
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

async function AmbilDataBospJambi() {
  try {
    const response = await fetch(csvUrl);
    const textData = await response.text();
    
    const rows = parseCSV(textData);
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ""; 

    let totalSekolahCount = 0;
    let lengkapCount = 0;
    let belumLengkapCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const col = rows[i];

      // PENGAMAN 1: Lewati baris kosong atau baris judul atas yang pendek agar tidak mbuat patah kode
      if (!col || col.length < 10) continue;
      if (!col[1] || !col[2]) continue; // Wajib ada kolom NPSN dan Nama Sekolah
      
      const npsn = col[1].replace(/"/g, '').trim();
      const namaSekolah = col[2].replace(/"/g, '').trim();

      // PENGAMAN 2: Lewati baris nama-nama header tabel asli spreadsheet
      if (namaSekolah.toUpperCase() === "NAMA SEKOLAH" || npsn.toUpperCase() === "NPSN" || namaSekolah.toUpperCase().includes("LAPORAN")) {
        continue;
      }

      totalSekolahCount++;
      
      // PEMETAAN DATA UTAMA (Melompati kolom E/Kecamatan di indeks ke-4)
      const statusSekolah = col[3] ? col[3].replace(/"/g, '').trim() : "Negeri"; 
      const kabupaten = col[5] ? col[5].replace(/"/g, '').trim() : "Provinsi Jambi"; // Kolom F/Kabupaten berada di indeks ke-5

      let checkedMonthsHtml = "";
      let totalSudahKirimBulan = 0;

      // LOOP MATRIKS 12 BULAN LENGKAP (Melompati kolom G/Nama Kepsek dan H/No HP di indeks 6 & 7)
      // Kolom Januari dimulai tepat dari indeks ke-8 (Kolom I) sampai indeks ke-19 (Kolom T)
      for (let m = 8; m <= 19; m++) {
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

    // Suntikkan Angka Hasil Rekapitulasi Akhir ke Dasbor Atas
    document.getElementById('totalSekolah').innerText = totalSekolahCount;
    document.getElementById('lengkapSekolah').innerText = lengkapCount;
    document.getElementById('belumLengkapSekolah').innerText = belumLengkapCount;
    document.getElementById('persenSelesai').innerText = totalSekolahCount > 0 ? ((lengkapCount / totalSekolahCount) * 100).toFixed(1) + "%" : "0%";

    // Tampilkan tabel murni, matikan loading
    document.getElementById('tableLoading').style.display = "none";
    document.getElementById('mainTable').style.display = "table";

  } catch (error) {
    document.getElementById('tableLoading').innerHTML = `<span style="color:#dc2626;"><i class="fa-solid fa-circle-exclamation"></i> Gagal memuat data live dari Google Sheet. Periksa kembali jaringan Anda.</span>`;
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
