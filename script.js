// Mengambil semua elemen menu navigasi
const menuItems = document.querySelectorAll('.menu-item');

// Menambahkan fungsi klik ke setiap menu
menuItems.forEach(item => {
  item.addEventListener('click', function(e) {
    // Menghapus kelas 'active' dari semua menu terlebih dahulu
    menuItems.forEach(i => i.classList.remove('active'));
    
    // Menambahkan kelas 'active' ke menu yang baru saja diklik
    this.classList.add('active');
  });
});
