// =================================================================
// KONFIGURASI WAJIB - GANTI DENGAN INFO DARI DASHBOARD AUTH0 ANDA
// =================================================================
const auth0Domain = 'dev-qijbemgc31r4iyd8.us.auth0.com';      // <-- Ganti ini. Contoh: 'dev-xxxx.us.auth0.com'
const auth0ClientId = 'xmF7sJsU1CsgFLwuukJFNuXcPql4CAOZ'; // <-- Ganti ini.

// =================================================================
// BAGIAN UTAMA APLIKASI - TIDAK PERLU DIUBAH
// =================================================================

let auth0Client = null;

// Fungsi untuk menginisialisasi Auth0
const configureClient = async () => {
    try {
        auth0Client = await auth0.createAuth0Client({
            domain: auth0Domain,
            clientId: auth0ClientId,
            authorizationParams: {
                redirect_uri: window.location.origin
            }
        });
    } catch (e) {
        console.error("Gagal menginisialisasi Auth0 Client:", e);
        alert("Terjadi kesalahan saat mengkonfigurasi sistem otentikasi. Pastikan domain dan client ID sudah benar.");
    }
};

// Fungsi yang dijalankan saat halaman selesai dimuat
window.onload = async () => {
    await configureClient();
    if (!auth0Client) return; // Hentikan jika inisialisasi gagal

    // Cek apakah URL berisi parameter dari redirect Auth0
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        await auth0Client.handleRedirectCallback();
        // Hapus parameter dari URL agar bersih
        window.history.replaceState({}, document.title, "/");
    }
    
    await updateUI();
    await loadProducts();
};

// Fungsi untuk memperbarui tampilan tombol login/logout
const updateUI = async () => {
    const isAuthenticated = await auth0Client.isAuthenticated();
    const authContainer = document.getElementById('auth-container');
    
    if (isAuthenticated) {
        const userProfile = await auth0Client.getUser();
        authContainer.innerHTML = `
            <p>Halo, ${userProfile.name || userProfile.email}!</p>
            <button onclick="logout()">Logout</button>
        `;
    } else {
        authContainer.innerHTML = '<button onclick="login()">Login untuk Membeli</button>';
    }
};

// Fungsi untuk login
const login = async () => {
    await auth0Client.loginWithRedirect();
};

// Fungsi untuk logout
const logout = () => {
    auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin
        }
    });
};

// Fungsi untuk memuat dan menampilkan produk dari file JSON
const loadProducts = async () => {
    const isAuthenticated = await auth0Client.isAuthenticated();
    
    try {
        const response = await fetch('produk.json');
        if (!response.ok) {
            throw new Error('Gagal memuat produk.json');
        }
        const products = await response.json();

        const freeContainer = document.getElementById('produk-free');
        const premiumContainer = document.getElementById('produk-premium');
        
        freeContainer.innerHTML = '';
        premiumContainer.innerHTML = '';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            let buyButtonHtml = '';

            if (product.kategori === 'Free') {
                // Produk gratis selalu bisa diunduh
                buyButtonHtml = `<a href="${product.url}" class="buy-button" target="_blank" rel="noopener noreferrer">Download</a>`;
            } else if (product.kategori === 'Premium') {
                if (isAuthenticated) {
                    // Produk premium, tombol aktif jika sudah login
                    buyButtonHtml = `<a href="${product.url}" class="buy-button" target="_blank" rel="noopener noreferrer">Beli/Download</a>`;
                } else {
                    // Tombol non-aktif jika belum login, panggil fungsi login saat diklik
                    buyButtonHtml = `<a href="#" class="buy-button disabled" onclick="login()">Beli/Download</a>`;
                }
            }

            productCard.innerHTML = `
                <h4>${product.nama}</h4>
                <p>${product.deskripsi}</p>
                ${buyButtonHtml}
            `;

            if (product.kategori === 'Free') {
                freeContainer.appendChild(productCard);
            } else {
                premiumContainer.appendChild(productCard);
            }
        });
    } catch(e) {
        console.error("Error saat memuat produk:", e);
        document.getElementById('produk-free').innerHTML = "<p>Gagal memuat produk. Cek file produk.json.</p>";
    }
};
