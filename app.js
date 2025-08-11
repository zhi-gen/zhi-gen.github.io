document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // PENTING: GANTI URL DI BAWAH INI DENGAN URL WEB APP DARI GOOGLE APPS SCRIPT ANDA
    // =========================================================================
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbw2YmhgCFpbRIgUkc7nZgYaOkIOWXCg2dq78npUgKa-WY_NWD14KePGYG8vU1O_TIQ2Nw/exec';
    // =========================================================================

    const productContainer = document.getElementById('product-container');
    const loadingMessage = document.getElementById('loading-message');

    const loadProducts = async () => {
        try {
            const response = await fetch(GOOGLE_SHEET_URL);
            if (!response.ok) {
                throw new Error('Gagal mengambil data dari Google Sheet. Status: ' + response.status);
            }
            const products = await response.json();

            // Sembunyikan pesan loading
            loadingMessage.style.display = 'none';

            // Hapus konten sebelumnya jika ada
            productContainer.innerHTML = '';

            if (products.length === 0) {
                productContainer.innerHTML = '<p>Belum ada produk yang tersedia.</p>';
                return;
            }

            products.forEach(product => {
                // Buat tombol berdasarkan kategori
                let buttonHtml = '';
                if (product.kategori.toLowerCase() === 'premium') {
                    // Tombol untuk produk Premium (link ke Gumroad)
                    buttonHtml = `<a href="${product.file_url}" class="btn btn-success w-100" target="_blank" rel="noopener noreferrer">Beli di Gumroad</a>`;
                } else {
                    // Tombol untuk produk Free (link ke Google Drive)
                    buttonHtml = `<a href="${product.file_url}" class="btn btn-primary w-100" target="_blank" rel="noopener noreferrer">Download Gratis</a>`;
                }

                const productCard = document.createElement('div');
                productCard.className = 'col-lg-3 col-md-4 col-sm-6'; // Ukuran kolom Bootstrap

                productCard.innerHTML = `
                    <div class="card h-100 shadow-sm product-card">
                        <img src="${product.gambar_url}" class="card-img-top" alt="${product.nama}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.nama}</h5>
                            <p class="card-text flex-grow-1">${product.deskripsi}</p>
                            <p class="card-price mb-3">${product.harga}</p>
                            ${buttonHtml}
                        </div>
                    </div>
                `;

                productContainer.appendChild(productCard);
            });

        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            loadingMessage.textContent = 'Gagal memuat produk. Silakan cek URL Apps Script Anda di file app.js dan pastikan Google Sheet bisa diakses.';
            loadingMessage.style.color = 'red';
        }
    };

    loadProducts();
});
