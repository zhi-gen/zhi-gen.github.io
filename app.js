document.addEventListener('DOMContentLoaded', async () => {
    // =========================================================================
    // BAGIAN KONFIGURASI - GANTI DENGAN DATA ANDA
    // =========================================================================
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbw2YmhgCFpbRIgUkc7nZgYaOkIOWXCg2dq78npUgKa-WY_NWD14KePGYG8vU1O_TIQ2Nw/exec';
    const AUTH0_DOMAIN = 'dev-qijbemgc31r4iyd8.us.auth0.com';
    const AUTH0_CLIENT_ID = 'xmF7sJsU1CsgFLwuukJFNuXcPql4CAOZ';
    // =========================================================================

    // Variabel Global
    let auth0Client = null;
    let allProducts = [];
    
    // Elemen DOM
    const productContainer = document.getElementById('product-container');
    const loadingMessage = document.getElementById('loading-message');
    const judulProduk = document.getElementById('judul-produk');
    const authContainer = document.getElementById('auth-container');

    // =========================================================================
    // LOGIKA OTENTIKASI (AUTH0)
    // =========================================================================
    const configureAuth0Client = async () => {
        try {
            auth0Client = await auth0.createAuth0Client({
                domain: AUTH0_DOMAIN,
                clientId: AUTH0_CLIENT_ID,
                authorizationParams: { redirect_uri: window.location.origin }
            });
        } catch (e) {
            console.error("Gagal menginisialisasi Auth0 Client:", e);
        }
    };

    const updateUI = async () => {
        const isAuthenticated = await auth0Client.isAuthenticated();
        if (isAuthenticated) {
            const user = await auth0Client.getUser();
            authContainer.innerHTML = `
                <span class="navbar-text text-white me-3">Halo, ${user.name}!</span>
                <button class="btn btn-sm btn-outline-light" onclick="logout()">Logout</button>
            `;
        } else {
            authContainer.innerHTML = `<a class="nav-link" href="#" id="btn-login"><i class="bi bi-person-plus-fill"></i> Daftar/Login</a>`;
            document.getElementById('btn-login').addEventListener('click', login);
        }
    };

    const login = async () => await auth0Client.loginWithRedirect();
    
    window.logout = () => auth0Client.logout({ logoutParams: { returnTo: window.location.origin } });

    // =========================================================================
    // LOGIKA PRODUK
    // =========================================================================
    const displayProducts = (filter) => {
        productContainer.innerHTML = '';
        judulProduk.textContent = `Produk ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
        
        const filteredProducts = allProducts.filter(p => filter === 'semua' || p.kategori.toLowerCase() === filter);

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
    
    const loadAllProducts = async () => {
        try {
            const response = await fetch(GOOGLE_SHEET_URL);
            allProducts = await response.json();
            loadingMessage.style.display = 'none';
            displayProducts('semua');
        } catch (error) {
            console.error('Gagal memuat produk:', error);
            loadingMessage.textContent = 'Gagal memuat produk.';
            loadingMessage.style.color = 'red';
        }
    };

    // =========================================================================
    // INISIALISASI HALAMAN
    // =========================================================================
    // 1. Konfigurasi Auth0
    await configureAuth0Client();
    
    // 2. Cek jika ini adalah redirect dari Auth0
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }
    
    // 3. Update UI Login/Logout
    await updateUI();
    
    // 4. Muat Produk
    await loadAllProducts();

    // 5. Pasang Event Listener untuk Filter
    document.getElementById('filter-semua').addEventListener('click', (e) => { e.preventDefault(); displayProducts('semua'); });
    document.getElementById('menu-dashboard').addEventListener('click', (e) => { e.preventDefault(); displayProducts('semua'); });
    document.getElementById('filter-premium').addEventListener('click', (e) => { e.preventDefault(); displayProducts('premium'); });
    document.getElementById('filter-free').addEventListener('click', (e) => { e.preventDefault(); displayProducts('free'); });
});
