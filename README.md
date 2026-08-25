# 📱 Carwash Mobile App - APEX Management System

Aplikasi Mobile Management System modern untuk **Carwash Management System (APEX Auto Detailing & Carwash)** yang dibangun menggunakan **React Native**, **Expo**, **TypeScript**, dan **NativeWind / Tailwind CSS**. Aplikasi ini terhubung secara penuh dengan Carwash REST API Backend untuk mengelola data master pelanggan, kendaraan, operasional pencucian, penugasan teknisi/staff, pembayaran instan, dan penerbitan nota invoice digital.

---

## 🛠️ Tech Stack

* **Core:** React Native, Expo v57+, TypeScript
* **Styling:** NativeWind / Tailwind CSS (Dark Luxury & Neon Purple Theme)
* **Navigation:** React Navigation (Native Stack Navigation)
* **State Management:** React Context API (`AuthContext`) & `@react-native-async-storage/async-storage`
* **HTTP Client:** Axios (Centralized API client dengan Request/Response Interceptor & Token Bearer)
* **Safe Area & UI Components:** `react-native-safe-area-context`, `react-native-screens`

---

## 📁 Project Structure

```text
Carwash-MobileApp4/
├── assets/                  # Asset logo, icon, & splash screen
├── src/
│   ├── components/          # Reusable UI & Modal components
│   │   ├── CRUD CustomerVehicle/
│   │   │   ├── CreateCustomerVehicle.tsx   # Modal tambah customer & vehicle
│   │   │   ├── DeleteCustomerVehicle.tsx   # Modal konfirmasi hapus data
│   │   │   ├── ReadCustomerVehicle.tsx     # List view customer & vehicle cards
│   │   │   └── UpdateCustomerVehicle.tsx   # Modal edit data customer & vehicle
│   │   └── CRUD Orders/
│   │       ├── CreateOrder.tsx             # Modal buat order baru (Multi-Services & Staff)
│   │       ├── InvoiceModal.tsx            # Modal nota invoice digital resmi
│   │       ├── ReadOrder.tsx               # List view order cards & status tabs
│   │       └── UpdateOrder.tsx             # Action sheet status cuci & pembayaran
│   ├── config/              # Centralized Axios API client configuration
│   │   └── api.ts
│   ├── context/             # Global Auth Context & Token Management
│   │   └── authContext.tsx
│   ├── screens/             # Application screen views
│   │   ├── CustomerVehicle.tsx             # Layanan kelola pelanggan & unit
│   │   ├── Dashboard.tsx                   # Statistik dashboard & shortcut menu
│   │   ├── Login.tsx                       # Halaman login admin
│   │   └── OrderScreens.tsx                # Layanan operasional transaksi order
│   ├── services/            # API communication services (Service Layer)
│   │   ├── authServices.ts
│   │   ├── customerServices.ts
│   │   ├── dashboardService.ts
│   │   ├── orderServices.ts
│   │   ├── serviceService.ts
│   │   ├── staffServices.ts
│   │   └── vehicleServices.ts
│   └── types/               # Strict TypeScript interfaces & data contracts
│       ├── api.ts
│       ├── auth.ts
│       ├── customer.ts
│       ├── invoice.ts
│       ├── order.ts
│       ├── service.ts
│       ├── staff.ts
│       └── vehicle.ts
├── App.tsx                  # Root component & Navigation Stack table
├── app.json                 # Expo configuration
├── index.ts                 # Mobile app entry point
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 🔐 Authentication & Session Flow

Aplikasi mobile menggunakan JWT Authentication yang tersimpan aman pada `AsyncStorage`:

1. **Login:** Admin memasukkan email dan password di layar `LoginScreen`.
2. **Token Storage:** Token JWT dan profile admin disimpan di `AsyncStorage` via `AuthContext`.
3. **Axios Interceptor:** Setiap HTTP request secara otomatis menyertakan header otentikasi:
   ```http
   Authorization: Bearer <token>
   ```
4. **Protected Navigation:** Navigator mengecek status autentikasi. Jika belum login, otomatis mengarahkan ke `LoginScreen`, dan jika sudah login, diarahkan ke `DashboardScreen`.
5. **Logout:** Menghapus token dari storage dan mengembalikan navigasi ke layar login.

---

## 📌 Main Features

### 1. Authentication & Security
* Admin login dengan validasi input, loading spinner, dan handling error response dari backend.
* Proteksi sesi aplikasi mobile berbasis token JWT.
* Logout flow dengan pembersihan sesi instan.

### 2. Operational Dashboard
* Ringkasan statistik performa operasional (Total Pelanggan, Total Kendaraan, Antrean Aktif, Pendapatan).
* Menu shortcut cepat menuju **Pelanggan & Unit** serta **Transaksi Order**.
* Header profil admin aktif.

### 3. Customer & Vehicle Management
* **Dual Tab Management:** Tab Pelanggan & Tab Unit Kendaraan dalam 1 layar responsif.
* **Pencarian Real-Time:** Filter pencarian instan berdasarkan nama pelanggan, nomor HP, nomor plat, merk, atau model kendaraan.
* **CRUD Lengkap:** Tambah, Edit, dan Hapus data Pelanggan maupun Kendaraan dengan modal konfirmasi.
* Relasi otomatis antara pemilik (Customer) dengan unit kendaraan (Vehicle).

### 4. Order & Washing Progression
* **Status Filter Tabs:** Filter cepat transaksi berdasarkan status (`ALL`, `WAITING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
* **Pencarian Transaksi:** Pencarian transaksi berdasarkan nomor plat kendaraan atau nama pelanggan.
* **Modal Tambah Order Dinamis:**
  * Pemilihan Pelanggan (otomatis memfilter unit kendaraan milik pelanggan tersebut).
  * Pemilihan Unit Kendaraan.
  * Pemilihan Staff/Teknisi yang bertugas mencuci (`GET /staff`).
  * **Multi-Select Services:** Pemilihan lebih dari 1 paket layanan cuci sekaligus beserta pengatur jumlah/kuantitas (`-` dan `+`).
  * **Kalkulasi Total Real-Time:** Menghitung total tagihan transaksi secara instan.

### 5. Order Action & Payment Settlement
* **Update Status Pengerjaan:** Mengubah status pengerjaan secara langsung (`WAITING` ➔ `IN_PROGRESS` ➔ `COMPLETED` ➔ `CANCELLED`).
* **Pelunasan Pembayaran:** Pilihan metode pembayaran instan (**CASH**, **QRIS**, **TRANSFER**) dan pencatatan lunas.
* **Hapus Order:** Menghapus transaksi order dengan dialog konfirmasi keamanan.

### 6. Digital Invoice Receipt
* **Nota Invoice Digital:** Menampilkan nota invoice resmi (`INV-YYYYMMDD-ID`) yang memuat data pelanggan, plat kendaraan, teknisi bertugas, rincian layanan per baris, total tagihan, dan badge status lunas.

---

## 💳 Order & Payment Lifecycle Flow

```text
[Buat Order Baru (+ Multi-Services & Staff)]
                    ↓
        WAITING (Menunggu Antrean)
                    ↓  (Pilih: Sedang Dicuci)
      IN_PROGRESS (Proses Pencucian)
                    ↓  (Pilih: Selesai)
        COMPLETED (Pencucian Selesai)
                    ↓  (Pilih Metode & Bayar)
     [Pembayaran (CASH / QRIS / TRANSFER)]
                    ↓
               PAID (Lunas)
                    ↓
      [Penerbitan Nota Invoice Digital]
```

---

## 🚀 Installation & Running Locally

### 1. Clone Repository
```bash
git clone <repository-url>
cd Carwash-MobileApp4
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variable
Buat file `.env` di root direktori project:
```env
EXPO_PUBLIC_API_BASE_URL="http://YOUR_LOCAL_IP:5000/api"
```
*(Ganti `YOUR_LOCAL_IP` dengan IP Address lokal komputer Anda, contoh: `http://192.168.1.10:5000/api`)*

### 4. Jalankan Expo Development Server
```bash
npx expo start -c
```

### 5. Jalankan di Smartphone / Emulator
* **Android (Expo Go):** Scan QR Code yang muncul di terminal menggunakan aplikasi **Expo Go**.
* **Android Emulator:** Tekan huruf `a` di terminal.
* **iOS Simulator:** Tekan huruf `i` di terminal.

---

## 🔑 Default Login Admin

Sesuai kredensial seed backend:
```text
Email    : admin@carwash.com
Password : admin123
```

---

## 📜 License

This project is developed for educational and portfolio demonstration purposes.
