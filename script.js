/* =========================================================
   BOOKNEST - script.js
   Berisi: data buku, statistik otomatis, pencarian, filter,
   pengurutan, dan modal detail buku.
   ========================================================= */

/* ---------------------------------------------------------
   1. DATA BUKU
   Semua informasi koleksi disimpan dalam array objek.
   Catatan: stok pada data ini hanya contoh.
   Sampul diambil dari Open Library berdasarkan nomor ISBN.
   Jika gambar gagal dimuat, sampul pengganti dibuat otomatis.
   --------------------------------------------------------- */
const books = [
  {
    id: 1,
    judul: "Clean Code",
    penulis: "Robert C. Martin",
    kategori: "Pemrograman",
    tahun: 2008,
    penerbit: "Prentice Hall",
    isbn: "9780132350884",
    stok: 4,
    deskripsi:
      "Buku panduan menulis kode yang rapi, mudah dibaca, dan mudah dirawat. Pembaca diajak membiasakan penamaan yang jelas, fungsi yang ringkas, serta cara memperbaiki kode yang berantakan."
  },
  {
    id: 2,
    judul: "Pedagogy of the Oppressed",
    penulis: "Paulo Freire",
    kategori: "Pendidikan",
    tahun: 1970,
    penerbit: "Continuum",
    isbn: "9780826412768",
    stok: 2,
    deskripsi:
      "Karya klasik tentang pendidikan yang membebaskan. Freire menekankan dialog antara guru dan murid agar belajar menjadi proses berpikir kritis, bukan sekadar menerima informasi."
  },
  {
    id: 3,
    judul: "Laskar Pelangi",
    penulis: "Andrea Hirata",
    kategori: "Fiksi",
    tahun: 2005,
    penerbit: "Bentang Pustaka",
    isbn: "9789793062792",
    stok: 0,
    deskripsi:
      "Novel tentang sepuluh anak di Belitung yang bersekolah dengan fasilitas serba terbatas, namun tetap bersemangat belajar dan menjaga persahabatan."
  },
  {
    id: 4,
    judul: "Sapiens: Riwayat Singkat Umat Manusia",
    penulis: "Yuval Noah Harari",
    kategori: "Sejarah",
    tahun: 2015,
    penerbit: "Harper",
    isbn: "9780062316097",
    stok: 3,
    deskripsi:
      "Menelusuri sejarah manusia dari zaman berburu dan meramu hingga era modern, serta bagaimana pertanian, uang, dan kepercayaan bersama membentuk peradaban."
  },
  {
    id: 5,
    judul: "A Brief History of Time",
    penulis: "Stephen Hawking",
    kategori: "Sains",
    tahun: 1988,
    penerbit: "Bantam Books",
    isbn: "9780553380163",
    stok: 5,
    deskripsi:
      "Pengantar populer tentang alam semesta, mulai dari lubang hitam, Big Bang, hingga sifat waktu, ditulis dengan bahasa yang dapat dipahami pembaca umum."
  },
  {
    id: 6,
    judul: "The Lean Startup",
    penulis: "Eric Ries",
    kategori: "Bisnis",
    tahun: 2011,
    penerbit: "Crown Business",
    isbn: "9780307887894",
    stok: 1,
    deskripsi:
      "Membahas cara membangun usaha rintisan dengan menguji ide secara cepat, belajar dari pelanggan, dan memperbaiki produk secara bertahap agar tidak membuang sumber daya."
  }
];

/* ---------------------------------------------------------
   2. MENGAMBIL ELEMEN HTML
   --------------------------------------------------------- */
const bookGrid = document.getElementById("bookGrid");
const emptyMessage = document.getElementById("emptyMessage");
const resultInfo = document.getElementById("resultInfo");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

const statTotalBuku = document.getElementById("statTotalBuku");
const statTotalKategori = document.getElementById("statTotalKategori");

const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalSampul = document.getElementById("modalSampul");
const modalJudul = document.getElementById("modalJudul");
const modalPenulis = document.getElementById("modalPenulis");
const modalKategori = document.getElementById("modalKategori");
const modalPenerbit = document.getElementById("modalPenerbit");
const modalTahun = document.getElementById("modalTahun");
const modalStok = document.getElementById("modalStok");
const modalStatus = document.getElementById("modalStatus");
const modalDeskripsi = document.getElementById("modalDeskripsi");

// Menyimpan tombol kartu yang terakhir diklik agar fokus bisa dikembalikan
let kartuTerakhir = null;

/* ---------------------------------------------------------
   3. FUNGSI BANTU: SAMPUL
   --------------------------------------------------------- */

// Alamat gambar sampul dari Open Library (berdasarkan ISBN).
// "default=false" membuat server mengembalikan error jika gambar tidak ada,
// sehingga sampul pengganti bisa dipakai.
function alamatSampul(book) {
  return "https://covers.openlibrary.org/b/isbn/" + book.isbn + "-L.jpg?default=false";
}

// Membuat gambar pengganti (SVG) berisi huruf awal judul dan kategori.
function sampulPengganti(book) {
  const huruf = book.judul.charAt(0).toUpperCase();
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">' +
    '<rect width="300" height="450" fill="#DCEAF7"/>' +
    '<rect x="24" y="24" width="252" height="402" fill="none" stroke="#355070" stroke-width="3"/>' +
    '<text x="150" y="235" font-family="Arial, sans-serif" font-size="120" font-weight="700" ' +
    'fill="#355070" text-anchor="middle">' + huruf + '</text>' +
    '<text x="150" y="300" font-family="Arial, sans-serif" font-size="22" ' +
    'fill="#355070" text-anchor="middle">' + book.kategori + '</text>' +
    '</svg>';
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

// Memasang gambar sampul pada elemen <img>, lengkap dengan gambar pengganti.
function pasangSampul(imgElement, book) {
  imgElement.alt = "Sampul buku " + book.judul;
  imgElement.onerror = function () {
    imgElement.onerror = null; // cegah pengulangan tanpa henti
    imgElement.src = sampulPengganti(book);
  };
  imgElement.src = alamatSampul(book);
}

/* ---------------------------------------------------------
   4. STATISTIK OTOMATIS
   Dihitung dari array books, bukan ditulis manual.
   --------------------------------------------------------- */
function tampilkanStatistik() {
  // Set hanya menyimpan nilai unik, jadi kategori yang sama dihitung satu kali
  const kategoriUnik = new Set(books.map(function (book) {
    return book.kategori;
  }));

  statTotalBuku.textContent = books.length;
  statTotalKategori.textContent = kategoriUnik.size;
}

/* ---------------------------------------------------------
   5. PILIHAN KATEGORI OTOMATIS
   --------------------------------------------------------- */
function isiPilihanKategori() {
  const kategoriUnik = Array.from(new Set(books.map(function (book) {
    return book.kategori;
  })));

  kategoriUnik.forEach(function (kategori) {
    const option = document.createElement("option");
    option.value = kategori;
    option.textContent = kategori;
    categoryFilter.appendChild(option);
  });
}

/* ---------------------------------------------------------
   6. MENAMPILKAN KARTU BUKU
   --------------------------------------------------------- */
function buatKartu(book) {
  // Seluruh kartu berupa <button> agar bisa dipilih dengan keyboard
  const kartu = document.createElement("button");
  kartu.type = "button";
  kartu.className = "book-card";
  kartu.setAttribute("aria-label", "Lihat detail buku " + book.judul);

  const gambar = document.createElement("img");
  gambar.loading = "lazy";
  pasangSampul(gambar, book);

  const isi = document.createElement("div");
  isi.className = "card-body";

  const judul = document.createElement("h3");
  judul.className = "card-title";
  judul.textContent = book.judul;

  const penulis = document.createElement("p");
  penulis.className = "card-author";
  penulis.textContent = book.penulis;

  const meta = document.createElement("div");
  meta.className = "card-meta";

  const kategori = document.createElement("span");
  kategori.className = "card-category";
  kategori.textContent = book.kategori;

  const tahun = document.createElement("span");
  tahun.className = "card-year";
  tahun.textContent = book.tahun;

  meta.appendChild(kategori);
  meta.appendChild(tahun);

  isi.appendChild(judul);
  isi.appendChild(penulis);
  isi.appendChild(meta);

  kartu.appendChild(gambar);
  kartu.appendChild(isi);

  // Saat kartu diklik, buka modal detail
  kartu.addEventListener("click", function () {
    bukaModal(book, kartu);
  });

  return kartu;
}

function tampilkanBuku(daftarBuku) {
  bookGrid.innerHTML = "";

  daftarBuku.forEach(function (book) {
    bookGrid.appendChild(buatKartu(book));
  });

  // Tampilkan pesan jika tidak ada buku yang cocok
  emptyMessage.hidden = daftarBuku.length !== 0;

  resultInfo.textContent =
    "Menampilkan " + daftarBuku.length + " dari " + books.length + " buku.";
}

/* ---------------------------------------------------------
   7. PENCARIAN, FILTER, DAN PENGURUTAN
   Urutannya: cari -> filter kategori -> urutkan -> tampilkan.
   --------------------------------------------------------- */
function perbaruiKatalog() {
  const kataKunci = searchInput.value.trim().toLowerCase();
  const kategoriDipilih = categoryFilter.value;
  const urutan = sortSelect.value;

  // Langkah 1 dan 2: cari berdasarkan judul/penulis, lalu saring kategori
  let hasil = books.filter(function (book) {
    const cocokKataKunci =
      book.judul.toLowerCase().includes(kataKunci) ||
      book.penulis.toLowerCase().includes(kataKunci);

    const cocokKategori =
      kategoriDipilih === "semua" || book.kategori === kategoriDipilih;

    return cocokKataKunci && cocokKategori;
  });

  // Langkah 3: urutkan (copy dulu agar array asli tidak berubah)
  hasil = hasil.slice();

  if (urutan === "judul-az") {
    hasil.sort(function (a, b) {
      return a.judul.localeCompare(b.judul, "id");
    });
  } else if (urutan === "tahun-terbaru") {
    hasil.sort(function (a, b) {
      return b.tahun - a.tahun;
    });
  }

  // Langkah 4: tampilkan
  tampilkanBuku(hasil);
}

/* ---------------------------------------------------------
   8. MODAL DETAIL BUKU
   --------------------------------------------------------- */
function bukaModal(book, kartu) {
  kartuTerakhir = kartu;

  pasangSampul(modalSampul, book);
  modalJudul.textContent = book.judul;
  modalPenulis.textContent = book.penulis;
  modalKategori.textContent = book.kategori;
  modalPenerbit.textContent = book.penerbit;
  modalTahun.textContent = book.tahun;
  modalStok.textContent = book.stok + " eksemplar";
  modalDeskripsi.textContent = book.deskripsi;

  // Status ketersediaan ditentukan dari jumlah stok
  if (book.stok > 0) {
    modalStatus.textContent = "Tersedia";
    modalStatus.className = "badge tersedia";
  } else {
    modalStatus.textContent = "Tidak tersedia";
    modalStatus.className = "badge tidak-tersedia";
  }

  modalOverlay.hidden = false;
  document.body.style.overflow = "hidden"; // cegah halaman ikut bergulir
  modalClose.focus();
}

function tutupModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = "";

  // Kembalikan fokus ke kartu yang tadi dipilih
  if (kartuTerakhir) {
    kartuTerakhir.focus();
  }
}

// Tombol tutup (x)
modalClose.addEventListener("click", tutupModal);

// Klik area gelap di luar kotak modal
modalOverlay.addEventListener("click", function (event) {
  if (event.target === modalOverlay) {
    tutupModal();
  }
});

// Tombol Escape pada keyboard
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !modalOverlay.hidden) {
    tutupModal();
  }
});

/* ---------------------------------------------------------
   9. MENJALANKAN PROGRAM
   --------------------------------------------------------- */
searchInput.addEventListener("input", perbaruiKatalog);
categoryFilter.addEventListener("change", perbaruiKatalog);
sortSelect.addEventListener("change", perbaruiKatalog);

tampilkanStatistik();
isiPilihanKategori();
perbaruiKatalog();
