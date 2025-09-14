import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, where, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firestore Debug Logging
setLogLevel('debug');

// Global variables provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Firebase Initialization ---
let app, db, auth;
let userId = null;
let isAuthReady = false;

function initializeFirebase() {
    try {
        if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing or empty.");
            showMessage("Error: Firebase config is not available.", "bg-red-500");
            return;
        }
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                document.getElementById('firebase-user-id').textContent = `User ID: ${userId}`;
                isAuthReady = true;
                console.log("Firebase initialized and authenticated.", userId);
                loadSalespersons();
                loadReport();
            } else {
                userId = null;
                await signInAnonymously(auth);
            }
        });

        if (initialAuthToken) {
            signInWithCustomToken(auth, initialAuthToken).catch(error => {
                console.error("Custom token sign-in failed:", error);
                signInAnonymously(auth);
            });
        } else {
            signInAnonymously(auth);
        }
    } catch (e) {
        console.error("Firebase initialization failed:", e);
        showMessage("Error: Firebase initialization failed.", "bg-red-500");
    }
}

// --- DOM Elements ---
const reportDateInput = document.getElementById('reportDate');
const salesNameSelect = document.getElementById('salesName');
const dailyTargetInput = document.getElementById('dailyTarget');
const salesAreaInput = document.getElementById('salesArea');
const salesTeamInput = document.getElementById('salesTeam');
const salesContactInput = document.getElementById('salesContact');

const salesTableBody = document.getElementById('sales-table-body');
const initialMessage = document.getElementById('initial-message');
const loadingSpinner = document.getElementById('loading-spinner');

// Buttons and Modals
const addSalesBtn = document.getElementById('add-sales-btn');
const generateExcelBtn = document.getElementById('generate-excel-btn');
const addSalespersonBtn = document.getElementById('add-salesperson-btn');

const addSalesModal = document.getElementById('add-sales-modal');
const saveSalesBtn = document.getElementById('save-sales-btn');
const cancelSalesBtn = document.getElementById('cancel-sales-btn');

const addSalespersonModal = document.getElementById('add-salesperson-modal');
const saveNewSalespersonBtn = document.getElementById('save-new-salesperson-btn');
const cancelNewSalespersonBtn = document.getElementById('cancel-new-salesperson-btn');
const newSalespersonNameInput = document.getElementById('newSalespersonName');

const messageBox = document.getElementById('message-box');

// Data Storage
let salesData = [];
let salespersons = new Set(['Audrey', 'Frendy', 'Sakura']);

// --- Helper Functions ---
function showMessage(message, bgColor) {
    messageBox.textContent = message;
    messageBox.className = `message-box fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg font-semibold text-white transition-all duration-300 transform translate-y-0 opacity-100 ${bgColor}`;
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.classList.add('-translate-y-full', 'opacity-0');
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showModal(modal) {
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
    }, 10);
}

function hideModal(modal) {
    modal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// --- Firebase Functions ---
async function loadSalespersons() {
    if (!isAuthReady) return;
    try {
        const salespersonsCollection = collection(db, `artifacts/${appId}/public/data/salespersons`);
        onSnapshot(salespersonsCollection, (snapshot) => {
            snapshot.forEach(doc => {
                const data = doc.data();
                salespersons.add(data.name);
            });
            updateSalespersonDropdown();
        });
    } catch (error) {
        console.error("Error loading salespersons:", error);
        showMessage("Gagal memuat daftar sales.", "bg-red-500");
    }
}

async function saveSalesperson(name) {
    if (!isAuthReady) return;
    try {
        const salespersonsCollection = collection(db, `artifacts/${appId}/public/data/salespersons`);
        await addDoc(salespersonsCollection, { name: name.trim() });
        showMessage(`Nama sales '${name}' berhasil ditambahkan.`, "bg-green-500");
    } catch (e) {
        console.error("Error adding salesperson:", e);
        showMessage("Gagal menambahkan nama sales.", "bg-red-500");
    }
}

async function loadReport() {
    if (!isAuthReady) return;
    const reportDate = reportDateInput.value;
    const salesName = salesNameSelect.value;
    const reportDocId = `${reportDate}_${salesName}`;
    
    initialMessage.style.display = 'none';
    loadingSpinner.style.display = 'flex';
    salesData = [];

    try {
        const reportDocRef = doc(db, `artifacts/${appId}/users/${userId}/salesReports`, reportDocId);
        const docSnap = await getDoc(reportDocRef);

        if (docSnap.exists()) {
            const report = docSnap.data();
            salesData = report.salesData || [];
            dailyTargetInput.value = report.dailyTarget;
            salesAreaInput.value = report.salesArea;
            salesTeamInput.value = report.salesTeam;
            salesContactInput.value = report.salesContact;
        } else {
            // Reset fields for a new report
            dailyTargetInput.value = '';
            salesAreaInput.value = '';
            salesTeamInput.value = '';
            salesContactInput.value = '';
        }
    } catch (e) {
        console.error("Error loading report:", e);
        showMessage("Gagal memuat laporan.", "bg-red-500");
    } finally {
        updateTable();
        updateSummary();
        loadingSpinner.style.display = 'none';
    }
}

async function saveReport() {
    if (!isAuthReady) return;
    const reportDate = reportDateInput.value;
    const salesName = salesNameSelect.value;
    const dailyTarget = parseFloat(dailyTargetInput.value) || 0;
    const salesArea = salesAreaInput.value;
    const salesTeam = salesTeamInput.value;
    const salesContact = salesContactInput.value;
    
    const reportDocId = `${reportDate}_${salesName}`;
    const reportDocRef = doc(db, `artifacts/${appId}/users/${userId}/salesReports`, reportDocId);
    
    const reportData = {
        reportDate,
        salesName,
        dailyTarget,
        salesArea,
        salesTeam,
        salesContact,
        salesData,
        createdAt: new Date()
    };

    try {
        await setDoc(reportDocRef, reportData);
        showMessage("Laporan berhasil disimpan!", "bg-green-500");
    } catch (e) {
        console.error("Error saving report:", e);
        showMessage("Gagal menyimpan laporan.", "bg-red-500");
    }
}

async function deleteSale(index) {
    salesData.splice(index, 1);
    updateTable();
    updateSummary();
    await saveReport();
}

// --- UI Update Functions ---
function updateSalespersonDropdown() {
    salesNameSelect.innerHTML = '';
    const sortedSalespersons = Array.from(salespersons).sort();
    sortedSalespersons.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        salesNameSelect.appendChild(option);
    });
}

function updateSummary() {
    const closingData = salesData.filter(item => item.status === 'Closing');
    const totalSales = closingData.reduce((sum, item) => sum + item.total, 0);
    const totalProspects = salesData.length;
    const conversionRate = totalProspects > 0 ? (closingData.length / totalProspects * 100) : 0;
    const target = parseFloat(dailyTargetInput.value) || 0;
    const targetAchievement = target > 0 ? (totalSales / target * 100) : 0;

    document.getElementById('totalSales').textContent = formatCurrency(totalSales);
    document.getElementById('totalProspects').textContent = totalProspects;
    document.getElementById('conversionRate').textContent = conversionRate.toFixed(1) + '%';
    document.getElementById('targetAchievement').textContent = targetAchievement.toFixed(1) + '%';

    // Update card colors
    const achievementCard = document.getElementById('targetAchievementCard');
    if (targetAchievement >= 100) {
        achievementCard.classList.remove('from-red-500', 'to-red-600', 'from-yellow-500', 'to-yellow-600');
        achievementCard.classList.add('from-green-500', 'to-teal-600');
    } else if (targetAchievement >= 80) {
        achievementCard.classList.remove('from-green-500', 'to-teal-600', 'from-red-500', 'to-red-600');
        achievementCard.classList.add('from-yellow-500', 'to-yellow-600');
    } else {
        achievementCard.classList.remove('from-green-500', 'to-teal-600', 'from-yellow-500', 'to-yellow-600');
        achievementCard.classList.add('from-red-500', 'to-red-600');
    }
}

function updateTable() {
    salesTableBody.innerHTML = '';
    if (salesData.length === 0) {
        salesTableBody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center py-4 text-slate-500">
                    Tambah penjualan baru untuk memulai!
                </td>
            </tr>
        `;
    } else {
        salesData.forEach((item, index) => {
            const row = document.createElement('tr');
            const statusIcon = item.status === 'Closing' ? '✅' :
                item.status === 'Follow Up' ? '🔄' :
                item.status === 'Nego' ? '💬' :
                item.status === 'Prospek' ? '🕵️' : '❓';
            row.className = `transition-all duration-300 hover:bg-slate-50 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`;
            row.innerHTML = `
                <td class="px-6 py-3 text-sm text-slate-500 font-medium">${index + 1}</td>
                <td class="px-6 py-3 text-sm text-slate-500 whitespace-nowrap">${item.waktu}</td>
                <td class="px-6 py-3 text-sm text-slate-700 font-semibold whitespace-nowrap">${item.customer}</td>
                <td class="px-6 py-3 text-sm text-slate-500">${item.produk}</td>
                <td class="px-6 py-3 text-sm text-slate-500 text-center">${item.jumlah}</td>
                <td class="px-6 py-3 text-sm text-slate-500 whitespace-nowrap">${formatCurrency(item.harga)}</td>
                <td class="px-6 py-3 text-sm text-slate-700 font-semibold whitespace-nowrap">${formatCurrency(item.total)}</td>
                <td class="px-6 py-3 text-sm text-slate-600 whitespace-nowrap">${statusIcon} ${item.status}</td>
                <td class="px-6 py-3 text-sm text-slate-500">${item.keterangan}</td>
                <td class="px-6 py-3 text-sm text-slate-500">${item.buktiPenjualan || 'N/A'}</td>
                <td class="px-6 py-3 text-sm font-medium whitespace-nowrap text-center">
                    <button onclick="deleteSale(${index})" class="text-red-600 hover:text-red-900 transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" /></svg>
                    </button>
                </td>
            `;
            salesTableBody.appendChild(row);
        });
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    reportDateInput.value = new Date().toISOString().split('T')[0];
    initializeFirebase();
});

salesNameSelect.addEventListener('change', loadReport);
reportDateInput.addEventListener('change', loadReport);
dailyTargetInput.addEventListener('input', updateSummary);

addSalespersonBtn.addEventListener('click', () => {
    newSalespersonNameInput.value = '';
    showModal(addSalespersonModal);
});

cancelNewSalespersonBtn.addEventListener('click', () => {
    hideModal(addSalespersonModal);
});

saveNewSalespersonBtn.addEventListener('click', async () => {
    const name = newSalespersonNameInput.value;
    if (name.trim()) {
        await saveSalesperson(name);
        hideModal(addSalespersonModal);
    } else {
        showMessage("Nama tidak boleh kosong.", "bg-red-500");
    }
});

addSalesBtn.addEventListener('click', () => {
    // Reset modal inputs
    document.getElementById('inputTime').value = new Date().toLocaleTimeString('en-US', {hour12: false, hour: '2-digit', minute: '2-digit'});
    document.getElementById('inputCustomer').value = '';
    document.getElementById('inputProduct').value = '';
    document.getElementById('inputQuantity').value = 1;
    document.getElementById('inputPrice').value = '';
    document.getElementById('inputStatus').value = 'Closing';
    document.getElementById('inputNote').value = '';
    document.getElementById('inputProof').value = '';
    showModal(addSalesModal);
});

cancelSalesBtn.addEventListener('click', () => {
    hideModal(addSalesModal);
});

saveSalesBtn.addEventListener('click', async () => {
    const newSale = {
        no: salesData.length + 1,
        waktu: document.getElementById('inputTime').value,
        customer: document.getElementById('inputCustomer').value,
        produk: document.getElementById('inputProduct').value,
        jumlah: parseInt(document.getElementById('inputQuantity').value),
        harga: parseInt(document.getElementById('inputPrice').value),
        total: parseInt(document.getElementById('inputQuantity').value) * parseInt(document.getElementById('inputPrice').value),
        status: document.getElementById('inputStatus').value,
        keterangan: document.getElementById('inputNote').value,
        buktiPenjualan: document.getElementById('inputProof').value
    };
    
    if (!newSale.customer || !newSale.produk || isNaN(newSale.jumlah) || isNaN(newSale.harga)) {
        showMessage("Data penjualan tidak lengkap.", "bg-red-500");
        return;
    }

    salesData.push(newSale);
    updateTable();
    updateSummary();
    await saveReport();
    hideModal(addSalesModal);
});

generateExcelBtn.addEventListener('click', () => {
    if (salesData.length === 0) {
        showMessage("Tidak ada data untuk di-download.", "bg-red-500");
        return;
    }
    
    const reportDate = reportDateInput.value;
    const salesName = salesNameSelect.value;
    const dailyTarget = parseFloat(dailyTargetInput.value) || 0;
    const salesArea = salesAreaInput.value || 'N/A';
    const salesTeam = salesTeamInput.value || 'N/A';
    const salesContact = salesContactInput.value || 'N/A';

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Header info
    const headerData = [
        ['🚀 GENIUS GROWTH AI - DAILY SALES REPORT', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', ''],
        ['📅 Tanggal:', reportDate, '', '👤 Sales:', salesName, '', '📍 Area:', salesArea, '', ''],
        ['🎯 Target:', formatCurrency(dailyTarget), '', '🏢 Tim:', salesTeam, '', '📱 Kontak:', salesContact, '', ''],
        ['', '', '', '', '', '', '', '', '', '', ''],
        ['No', 'Waktu', 'Customer', 'Produk/Service', 'Qty', 'Harga Satuan', 'Total', 'Status', 'Keterangan', 'Bukti Penjualan']
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
        item.keterangan,
        item.buktiPenjualan
    ]);

    // Summary calculations
    const closingData = salesData.filter(item => item.status === 'Closing');
    const totalSales = closingData.reduce((sum, item) => sum + item.total, 0);
    const totalProspects = salesData.length;
    const conversionRate = totalProspects > 0 ? (closingData.length / totalProspects * 100) : 0;
    const targetAchievement = target > 0 ? (totalSales / target * 100) : 0;

    // Status breakdown
    const statusCount = {};
    salesData.forEach(item => {
        statusCount[item.status] = (statusCount[item.status] || 0) + 1;
    });
    const statusBreakdownData = Object.entries(statusCount).map(([status, count]) => [`- ${status}:`, count]);

    // Combine all data for a single sheet
    const allData = [
        ...headerData,
        ...salesTableData,
        ['', '', '', '', '', '', '', '', '', ''],
        ['📊 RINGKASAN PERFORMANCE', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['💰 Total Penjualan:', formatCurrency(totalSales), '', '👥 Total Prospek:', totalProspects, '', '📈 Conversion Rate:', conversionRate.toFixed(1) + '%', '', ''],
        ['🎯 Target Achievement:', targetAchievement.toFixed(1) + '%', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ''],
        ['📋 Status Breakdown:', '', '', ...statusBreakdownData.flat()] // Flatten array for single row
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths
    ws['!cols'] = [
        {wch: 5},   // No
        {wch: 8},   // Waktu
        {wch: 25},  // Customer
        {wch: 25},  // Produk
        {wch: 8},   // Qty
        {wch: 15},  // Harga
        {wch: 15},  // Total
        {wch: 15},  // Status
        {wch: 25},  // Keterangan
        {wch: 30}   // Bukti Penjualan
    ];

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Sales Report');

    // Generate filename
    const fileName = `GGSalesReport_${reportDate}_${salesName.replace(/\s+/g, '_')}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, fileName);
    showMessage(`✅ Laporan Excel berhasil diunduh!`, "bg-green-500");
});

// Expose deleteSale to the global scope so it can be called from the table button
window.deleteSale = deleteSale;
