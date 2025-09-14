# 🚀 Genius Growth AI - Excel Sales Report Generator

## 📋 Deskripsi
Web application untuk generate laporan penjualan harian dalam format Excel untuk tim sales Genius Growth AI. Aplikasi ini memiliki interface yang modern dan user-friendly dengan fitur analytics real-time.

## ✨ Fitur Utama
- **📊 Report Builder**: Setup informasi sales dan target harian
- **📈 Real-time Analytics**: Dashboard summary dengan metrics otomatis
- **📱 Responsive Design**: Optimized untuk desktop dan mobile
- **💾 Excel Export**: Generate file Excel dengan format profesional
- **🔄 Sample Data**: Generate sample data untuk testing
- **🎨 Modern UI**: Interface dengan animasi dan gradient yang menarik

## 🛠 Teknologi
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Library**: SheetJS (XLSX) untuk Excel generation
- **Deployment**: Vercel
- **Design**: CSS Grid, Flexbox, CSS Animations

## 📁 Struktur File
```
genius-growth-ai-sales/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   ├── script.js           # JavaScript logic
│   └── favicon.ico         # Website icon (optional)
├── package.json            # Node.js dependencies
├── vercel.json             # Vercel deployment config
└── README.md               # Documentation
```

## 🚀 Deploy ke Vercel

### Method 1: Git Repository (Recommended)
1. **Create Git Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sales Report Generator"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/username/genius-growth-ai-sales.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy di Vercel**:
   - Login ke [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import dari GitHub repository
   - Deploy otomatis akan berjalan

### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Method 3: Drag & Drop
1. Zip semua file dalam folder `genius-growth-ai-sales/`
2. Login ke [vercel.com](https://vercel.com)
3. Drag & drop zip file ke dashboard Vercel

## 🔧 Setup Lokal
1. **Clone/Download files**
2. **Install dependencies** (optional):
   ```bash
   npm install
   ```
3. **Run local server**:
   ```bash
   # Menggunakan Python
   python -m http.server 8000
   
   # Menggunakan Node.js
   npx serve public
   
   # Atau buka langsung index.html di browser
   ```

## 📊 Fitur Excel Export
File Excel yang di-generate akan berisi:
- **Header Information**: Tanggal, nama sales, target, area, tim, kontak
- **Sales Data Table**: Data penjualan lengkap dengan status
- **Performance Summary**: Total penjualan, prospek, conversion rate, target achievement
- **Status Breakdown**: Detail jumlah per status deal

## 🎯 Metrics yang Ditracking
- 💰 **Total Penjualan**: Sum dari semua closing deals
- 👥 **Total Prospek**: Jumlah semua prospek yang dicontact
- 📈 **Conversion Rate**: Persentase closing dari total prospek
- 🎯 **Target Achievement**: Persentase pencapaian target harian

## 🎨 Customization
Untuk customize branding atau fitur:
- **Colors**: Edit CSS variables di `styles.css`
- **Company Info**: Update di `index.html` dan `script.js`
- **Sample Data**: Modify array `salesData` di `script.js`
- **Excel Template**: Customize di function `generateExcel()`

## 📱 Browser Support
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## 🔗 Demo
Live demo akan tersedia setelah deployment di Vercel: `https://your-app-name.vercel.app`

## 📝 License
MIT License - feel free to use for your sales team!

## 👥 Support
Untuk support atau feature request, contact: support@geniusgrowth.ai

---
Developed with ❤️ for Genius Growth AI Sales Team