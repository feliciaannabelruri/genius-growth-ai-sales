// Set default date to today
document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];

let salesData = [
    {
        no: 1,
        waktu: '09:30',
        customer: 'PT ABC Corp',
        produk: 'AI Marketing Package',
        jumlah: 1,
        harga: 5000000,
        total: 5000000,
        status: 'Closing',
        keterangan: 'Deal sukses'
    },
    {
        no: 2,
        waktu: '11:15',
        customer: 'CV Digital Startup',
        produk: 'Growth Consultation',
        jumlah: 3,
        harga: 1500000,
        total: 4500000,
        status: 'Closing',
        keterangan: 'Follow up next month'
    },
    {
        no: 3,
        waktu: '14:20',
        customer: 'Toko Online Makmur',
        produk: 'Social Media Management',
        jumlah: 1,
        harga: 3000000,
        total: 3000000,
        status: 'Follow Up',
        keterangan: 'Perlu presentasi ulang'
    }
];

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function updateSummary() {
    const closingData = salesData.filter(item => item.status === 'Closing');
    const totalSales = closingData.reduce((sum, item) => sum + item.total, 0);
    const totalProspects = salesData.length;
    const conversionRate = totalProspects > 0 ? (closingData.length / totalProspects * 100) : 0;
    const target = parseFloat(document.getElementById('dailyTarget').value) || 15000000;
    const targetAchievement = (totalSales / target * 100);

    document.getElementById('totalSales').textContent = formatCurrency(totalSales);
    document.getElementById('totalProspects').textContent = totalProspects;
    document.getElementById('conversionRate').textContent = conversionRate.toFixed(1) + '%';
    document.getElementById('targetAchievement').textContent = targetAchievement.toFixed(1) + '%';

    // Update card colors based on performance
    const achievementCard = document.getElementById('targetAchievement').parentElement;
    if (targetAchievement >= 100) {
        achievementCard.className = 'summary-card success';
    } else if (targetAchievement >= 80) {
        achievementCard.className = 'summary-card warning';
    } else {
        achievementCard.className = 'summary-card danger';
    }
}

function addSampleData() {
    const additionalData = [
        {
            no: salesData.length + 1,
            waktu: '16:45',
            customer: 'Restaurant Chain Indo',
            produk: 'Digital Marketing Automation',
            jumlah: 2,
            harga: 2500000,
            total: 5000000,
            status: 'Closing',
            keterangan: 'Kontrak 6 bulan'
        },
        {
            no: salesData.length + 2,
            waktu: '17:30',
            customer: 'Fashion Boutique',
            produk: 'E-commerce Integration',
            jumlah: 1,
            harga: 4000000,
            total: 4000000,
            status: 'Nego',
            keterangan: 'Diskusi budget'
        }
    ];

    salesData = [...salesData, ...additionalData];
    updateTable();
    updateSummary();
}

function clearData() {
    salesData = [];
    updateTable();
    updateSummary();
}

function updateTable() {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';

    salesData.forEach(item => {
        const row = tbody.insertRow();
        const statusIcon = item.status === 'Closing' ? '✅' : 
                         item.status === 'Follow Up' ? '🔄' : 
                         item.status === 'Nego' ? '💬' : '❓';
        
        row.innerHTML = `
            <td>${item.no}</td>
            <td>${item.waktu}</td>
            <td>${item.customer}</td>
            <td>${item.produk}</td>
            <td>${item.jumlah}</td>
            <td>${formatCurrency(item.harga)}</td>
            <td>${formatCurrency(item.total)}</td>
            <td>${statusIcon} ${item.status}</td>
            <td>${item.keterangan}</td>
        `;
    });
}

function generateExcel() {
    const reportDate = document.getElementById('reportDate').value;
    const salesName = document.getElementById('salesName').value || 'Sales Representative';
    const dailyTarget = parseFloat(document.getElementById('dailyTarget').value) || 15000000;
    const salesArea = document.getElementById('salesArea').value || 'Jakarta';
    const salesTeam = document.getElementById('salesTeam').value || 'Team Alpha';
    const salesContact = document.getElementById('salesContact').value || 'contact@geniusgrowth.ai';

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Header info
    const headerData = [
        ['🚀 GENIUS GROWTH AI - DAILY SALES REPORT', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ''],
        ['📅 Tanggal:', reportDate, '', '👤 Sales:', salesName, '', '📍 Area:', salesArea, ''],
        ['🎯 Target:', formatCurrency(dailyTarget), '', '🏢 Tim:', salesTeam, '', '📱 Kontak:', salesContact, ''],
        ['', '', '', '', '', '', '', '', ''],
        ['No', 'Waktu', 'Customer', 'Produk/Service', 'Qty', 'Harga Satuan', 'Total', 'Status', 'Keterangan']
    ];

    // Sales data
    const salesTableData = salesData.map(item => [
        item.no,
        item.waktu,
        item.customer,
        item.produk,
        item.jumlah,
        item.harga,
        item.total,
        item.status,
        item.keterangan
    ]);

    // Summary calculations
    const closingData = salesData.filter(item => item.status === 'Closing');
    const totalSales = closingData.reduce((sum, item) => sum + item.total, 0);
    const totalProspects = salesData.length;
    const conversionRate = totalProspects > 0 ? (closingData.length / totalProspects * 100) : 0;
    const targetAchievement = (totalSales / dailyTarget * 100);

    // Summary data
    const summaryData = [
        ['', '', '', '', '', '', '', '', ''],
        ['📊 RINGKASAN PERFORMANCE', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ''],
        ['💰 Total Penjualan:', formatCurrency(totalSales), '', '👥 Total Prospek:', totalProspects, '', '📈 Conversion Rate:', conversionRate.toFixed(1) + '%', ''],
        ['🎯 Target Achievement:', targetAchievement.toFixed(1) + '%', '', '📋 Status Breakdown:', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ''],
    ];

    // Status breakdown
    const statusCount = {};
    salesData.forEach(item => {
        statusCount[item.status] = (statusCount[item.status] || 0) + 1;
    });

    Object.entries(statusCount).forEach(([status, count]) => {
        const statusIcon = status === 'Closing' ? '✅' : 
                         status === 'Follow Up' ? '🔄' : 
                         status === 'Nego' ? '💬' : '❓';
        summaryData.push([`${statusIcon} ${status}:`, count, '', '', '', '', '', '', '']);
    });

    // Combine all data
    const allData = [
        ...headerData,
        ...salesTableData,
        ...summaryData
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths
    ws['!cols'] = [
        {wch: 5},   // No
        {wch: 8},   // Waktu
        {wch: 20},  // Customer
        {wch: 25},  // Produk
        {wch: 6},   // Qty
        {wch: 15},  // Harga
        {wch: 15},  // Total
        {wch: 12},  // Status
        {wch: 25}   // Keterangan
    ];

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Sales Report');

    // Generate filename
    const fileName = `Genius_Growth_AI_Sales_Report_${reportDate}_${salesName.replace(/\s+/g, '_')}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);

    // Show success message
    setTimeout(() => {
        alert(`✅ Excel report berhasil di-generate!\n\nFile: ${fileName}\n\n📊 Summary:\n💰 Total Sales: ${formatCurrency(totalSales)}\n🎯 Target Achievement: ${targetAchievement.toFixed(1)}%\n📈 Conversion Rate: ${conversionRate.toFixed(1)}%`);
    }, 500);
}

// Initialize
updateSummary();

// Auto-update summary when target changes
document.getElementById('dailyTarget').addEventListener('input', updateSummary);