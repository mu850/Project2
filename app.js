// (app.js) extracted from user's HTML - handles calculations and storage
// Constants
const GRINDING_RATE_WITH_SAFAI = 4.25;
const GRINDING_RATE_WITHOUT_SAFAI = 3.00;

// DOM Elements
const form = document.getElementById('calculator-form');
const receiptSection = document.getElementById('receipt-section');
const receiptDetails = document.getElementById('receipt-details');
const recordTypeDropdown = document.getElementById('record-type-dropdown');
const dateFilter = document.getElementById('date-filter');
const viewRecordsBtn = document.getElementById('view-records-btn');
const recordsList = document.getElementById('records-list');
const summarySection = document.getElementById('summary-section');
const totalNetWeightSpan = document.getElementById('total-net-weight');
const totalKatotiWeightSpan = document.getElementById('total-katoti-weight');
const totalAmountSpan = document.getElementById('total-amount');

// Modals
const paymentModal = document.getElementById('payment-modal');
const paymentAmountDisplay = document.getElementById('payment-amount-display');
const paidAmountInput = document.getElementById('paid-amount');
const closeModalBtn = document.getElementById('close-modal-btn');
const submitPaymentBtn = document.getElementById('submit-payment-btn');

const confirmationModal = document.getElementById('confirmation-modal');
const confirmationText = document.getElementById('confirmation-text');
const confirmActionBtn = document.getElementById('confirm-action-btn');
const cancelActionBtn = document.getElementById('cancel-action-btn');

const addWeightModal = document.getElementById('add-weight-modal');
const addWeightCustomerName = document.getElementById('add-weight-customer-name');
const additionalWeightInput = document.getElementById('additional-weight');
const closeAddModalBtn = document.getElementById('close-add-modal-btn');
const submitAddWeightBtn = document.getElementById('submit-add-weight-btn');

let currentReceiptData = null;
let editingRecordId = null;
let editingRecordType = null;
let currentRecordToPay = null;
let currentRecordToAddWeight = null;
let currentAction = null;

// View records button
viewRecordsBtn.addEventListener('click', () => {
    const selectedType = recordTypeDropdown.value;
    if (selectedType === 'summary') {
        renderSummary();
    } else if (selectedType === 'backup' || selectedType === 'khata') {
        renderRecords(selectedType);
    } else {
        recordsList.innerHTML = `<p class="text-center text-gray-500 mt-4">ایک ریکارڈ کی قسم منتخب کریں اور دیکھیں پر کلک کریں۔</p>`;
        summarySection.classList.add('hidden');
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const totalWeight = parseFloat(document.getElementById('totalWeight').value) || 0;
    const flourRatePerKg = parseFloat(document.getElementById('flourRatePerKg').value) || 0;
    const advanceFlour = parseFloat(document.getElementById('advanceFlour').value) || 0;
    const noSafai = document.getElementById('noSafai').checked;
    const noKatoti = document.getElementById('noKatoti').checked;
    const billInFlour = document.getElementById('billInFlour').checked;

    if (billInFlour && flourRatePerKg <= 0) {
         return;
    }

    let netWeight = totalWeight;

    const actualGrindingRate = noSafai ? GRINDING_RATE_WITHOUT_SAFAI : GRINDING_RATE_WITH_SAFAI;

    const grindingCost = totalWeight * actualGrindingRate;

    const katotiWeight = totalWeight * 0.05;
    const katotiValue = katotiWeight * flourRatePerKg;

    let totalAmount = grindingCost;
    if (noKatoti) {
        totalAmount = grindingCost + katotiValue;
    }

    let flourEquivalent = 0;
    if (billInFlour) {
        flourEquivalent = totalAmount / flourRatePerKg;
    }

    if (!noKatoti) {
        netWeight -= katotiWeight;
    }

    if (advanceFlour > 0) {
        netWeight -= advanceFlour;
    }

    if (flourEquivalent > 0) {
        netWeight -= flourEquivalent;
    }

    const now = new Date();
    currentReceiptData = {
        id: editingRecordId || Date.now(),
        customerName,
        totalWeight: totalWeight.toFixed(2),
        flourRatePerKg: flourRatePerKg.toFixed(2),
        advanceFlour: advanceFlour.toFixed(2),
        netWeight: netWeight.toFixed(2),
        katotiWeight: katotiWeight.toFixed(2),
        grindingCost: grindingCost.toFixed(2),
        actualGrindingRate: actualGrindingRate.toFixed(2),
        katotiValue: katotiValue.toFixed(2),
        amount: totalAmount.toFixed(2),
        flourEquivalent: flourEquivalent.toFixed(2),
        balance: totalAmount.toFixed(2), 
        date: now.toLocaleDateString('ur-PK'),
        time: now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime(),
        noSafai,
        noKatoti,
        billInFlour,
        status: 'unpaid', 
        paymentHistory: [],
        transactions: [{
            weight: totalWeight,
            grindingCost: grindingCost,
            amount: totalAmount,
            date: now.toLocaleDateString('ur-PK'),
            time: now.toLocaleTimeString('ur-PK', { hour: '2-digit', minute: '2-digit' }),
            noSafai, noKatoti, billInFlour,
            transactionType: 'Initial Entry'
        }]
    };

    displayReceipt();
});

function displayReceipt() {
    if (!currentReceiptData) return;

    const { customerName, totalWeight, advanceFlour, netWeight, katotiWeight, amount, date, time, noKatoti, flourEquivalent } = currentReceiptData;

    receiptDetails.innerHTML = `
        <p><strong>نام:</strong> ${customerName}</p>
        <p><strong>وزن:</strong> ${totalWeight} کلوگرام</p>
        <p><strong>کٹوتی کا وزن:</strong> ${katotiWeight} کلوگرام</p>
        <p><strong>بل رقم:</strong> ${amount} روپے</p>
        ${(flourEquivalent > 0) ? `<p><strong>بل رقم (آٹے میں):</strong> ${flourEquivalent} کلوگرام</p>` : ''}
        <p><strong>خالص آٹا:</strong> ${netWeight} کلوگرام</p>
    `;

    receiptSection.classList.remove('hidden');
}

document.getElementById('save-backup-btn').addEventListener('click', () => {
    currentAction = 'save-backup';
    confirmationText.textContent = 'کیا آپ واقعی یہ ریکارڈ بیک اپ میں محفوظ کرنا چاہتے ہیں؟';
    confirmationModal.classList.remove('hidden');
});
document.getElementById('save-khata-btn').addEventListener('click', () => {
    currentAction = 'save-khata';
    confirmationText.textContent = 'کیا آپ واقعی یہ ریکارڈ کھاتے میں شامل کرنا چاہتے ہیں؟';
    confirmationModal.classList.remove('hidden');
});
document.getElementById('delete-receipt-btn').addEventListener('click', () => {
    currentReceiptData = null;
    editingRecordId = null;
    receiptSection.classList.add('hidden');
    form.reset();
});

confirmActionBtn.addEventListener('click', () => {
    confirmationModal.classList.add('hidden');
    if (currentAction === 'save-backup') {
        saveRecord('backup');
    } else if (currentAction === 'save-khata') {
        saveRecord('khata');
    } else if (currentAction === 'delete-record') {
        deleteRecord(currentRecordToPay.id, currentRecordToPay.type);
    } else if (currentAction === 'move-to-khata') {
        moveToKhata(currentRecordToPay.id);
    }
});

cancelActionBtn.addEventListener('click', () => {
    confirmationModal.classList.add('hidden');
    currentAction = null;
});

function saveRecord(type) {
    if (!currentReceiptData) return;

    const records = JSON.parse(localStorage.getItem(type)) || [];
    if (editingRecordId) {
        const recordIndex = records.findIndex(rec => rec.id === editingRecordId);
        if (recordIndex > -1) {
            records[recordIndex] = currentReceiptData;
        }
    } else {
        records.push(currentReceiptData);
    }
    localStorage.setItem(type, JSON.stringify(records));

    currentReceiptData = null;
    editingRecordId = null;
    editingRecordType = null;
    receiptSection.classList.add('hidden');
    form.reset();
    viewRecordsBtn.click();
}

function moveToKhata(id) {
    const backupRecords = JSON.parse(localStorage.getItem('backup')) || [];
    const khataRecords = JSON.parse(localStorage.getItem('khata')) || [];

    const recordToMove = backupRecords.find(rec => rec.id === id);
    if (recordToMove) {
        if (!recordToMove.paymentHistory) {
            recordToMove.paymentHistory = [];
        }
        khataRecords.push(recordToMove);
        const updatedBackup = backupRecords.filter(rec => rec.id !== id);
        localStorage.setItem('backup', JSON.stringify(updatedBackup));
        localStorage.setItem('khata', JSON.stringify(khataRecords));
    }
    viewRecordsBtn.click();
}

function handleRecordAction(event) {
    const target = event.target;
    const action = target.getAttribute('data-action');
    const id = parseFloat(target.getAttribute('data-id'));
    const type = target.getAttribute('data-type');
    if (!action || !id || !type) return;

    if (action === 'delete') {
        currentAction = 'delete-record';
        currentRecordToPay = {id, type};
        confirmationText.textContent = `کیا آپ واقعی یہ ریکارڈ (${type}) سے حذف کرنا چاہتے ہیں؟`;
        confirmationModal.classList.remove('hidden');
    } else if (action === 'edit') {
        editRecord(id, type);
    } else if (action === 'pay') {
        showPaymentModal(id, type);
    } else if (action === 'move-to-khata') {
        currentAction = 'move-to-khata';
        currentRecordToPay = {id, type};
        confirmationText.textContent = 'کیا آپ واقعی یہ ریکارڈ کھاتے میں شامل کرنا چاہتے ہیں؟';
        confirmationModal.classList.remove('hidden');
    } else if (action === 'add-weight') {
        showAddWeightModal(id, type);
    }
}

def_placeholder = "// placeholder to avoid syntax errors in environment"
