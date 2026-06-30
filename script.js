// Menunggu seluruh elemen HTML selesai dimuat di browser
document.addEventListener('DOMContentLoaded', () => {

  // 1. Mengambil semua elemen baris menu di dalam sidebar
  const menuItems = document.querySelectorAll('.menu-item');

  // 2. Memasang fungsi pemantau klik (Event Listener) ke setiap menu
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      
      // Mencegah perpindahan halaman default sementara jika link belum diisi URL asli
      // e.preventDefault(); 

      // 3. Menghapus tanda aktif (.active) dari menu lama yang sebelumnya menyala
      menuItems.forEach(el => el.classList.remove('active'));
      
      // 4. Memindahkan tanda aktif (.active) ke menu baru yang baru saja diklik pengguna
      this.classList.add('active');
      
    });
  });

});
