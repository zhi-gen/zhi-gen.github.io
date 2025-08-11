document.addEventListener('DOMContentLoaded', () => {
    // URL Google Sheet Anda
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbw2YmhgCFpbRIgUkc7nZgYaOkIOWXCg2dq78npUgKa-WY_NWD14KePGYG8vU1O_TIQ2Nw/exec';

    const productContainer = document.getElementById('product-container');
    const loadingMessage = document.getElementById('loading-message');
    const judulProduk = document.getElementById('judul-produk');

    // Variabel untuk menyimpan semua produk setelah diambil dari sheet
    let allProducts = [];

    // Fungsi untuk menampilkan produk berdasarkan filter
    const displayProducts = (filter) => {
        productContainer.innerHTML = ''; // Kosongkan kontainer
        judulProduk.textContent = `Produk ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;

        const filteredProducts = allProducts.filter(product => {
            if (filter === 'semua') {
                return true; // Tampilkan semua
            }
            return product.kategori.toLowerCase() === filter;
        });

        if (filteredProducts.length === 0) {
            productContainer.innerHTML = '<p>Tidak ada produk dalam kategori ini.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            let buttonHtml = '';
            if (product.kategori.toLowerCase() === 'premium') {
                buttonHtml = `<a href="${product.file_url}" class="btn btn-success w-100" target="_blank" rel="noopener noreferrer">Beli Sekarang</a>`;
            } else {
                buttonHtml = `<a href="${product.file_url}" class="btn btn-primary w-100" target="_blank" rel="noopener noreferrer">Download Gratis</a>`;
            }

            const productCard = document.createElement('div');
            productCard.className = 'col-lg-3 col-md-4 col-sm-6';

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
    };

    // Fungsi utama untuk memuat semua produk
    const loadAllProducts = async () => {
        try {
            const response = await fetch(GOOGLE_SHEET_URL);
            if (!response.ok) {
                throw new Error('Gagal mengambil data.');
            }
            allProducts = await response.json();
            
            loadingMessage.style.display = 'none';
            displayProducts('semua'); // Tampilkan semua produk saat pertama kali dimuat

        } catch (error) {
            console.error('Terjadi kesalahan:', error);
            loadingMessage.textContent = 'Gagal memuat produk.';
            loadingMessage.style.color = 'red';
        }
    };

    // Menambahkan event listener ke menu filter
    document.getElementById('filter-semua').addEventListener('click', (e) => {
        e.preventDefault();
        displayProducts('semua');
    });
    document.getElementById('menu-dashboard').addEventListener('click', (e) => {
        e.preventDefault();
        displayProducts('semua');
    });
    document.getElementById('filter-premium').addEventListener('click', (e) => {
        e.preventDefault();
        displayProducts('premium');
    });
    document.getElementById('filter-free').addEventListener('click', (e) => {
        e.preventDefault();
        displayProducts('free');
    });

    // Panggil fungsi utama saat halaman dimuat
    loadAllProducts();
});
