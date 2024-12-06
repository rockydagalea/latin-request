
// Configuration
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbwEH-6FvqSiBIZag2afTY-cwxS3xM-E9XbqQIbr_WiXNRuCi_DbRx8Sd98GL3_q3oAxFw/exec',
    CURRENCY: 'USD',
    MIN_VALUE: 0,
    STEP_VALUE: 0.01
};

// Global counters
let miscEntryCount = 1;
let maintenanceEntryCount = 1;

// Utility Functions
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function setupNumberInput(input) {
    input.addEventListener('input', function() {
        if (this.value < CONFIG.MIN_VALUE) {
            this.value = CONFIG.MIN_VALUE;
        }
        updateSummary();
    });
}

function processEntryData(key, value, targetArray, descriptionPrefix) {
    const index = key.split('_')[1];
    const entryType = key.startsWith(descriptionPrefix) ? 'description' : 'amount';
    
    if (!targetArray[index]) {
        targetArray[index] = {};
    }
    targetArray[index][entryType] = value;
}

// Dynamic Entry Management Functions
function createEntryHTML(type, count) {
    return `
        <div class="input-group">
            <label for="${type}Description_${count}">Description:</label>
            <input type="text" 
                   id="${type}Description_${count}" 
                   name="${type}Description_${count}" 
                   placeholder="Specify ${type === 'otherExpense' ? 'other expenses' : 'maintenance'}">
        </div>
        <div class="input-group">
            <label for="${type}Amount_${count}">Amount:</label>
            <input type="number" 
                   id="${type}Amount_${count}" 
                   name="${type}Amount_${count}" 
                   min="0" 
                   step="0.01" 
                   placeholder="Input US Dollar">
        </div>
        <button type="button" 
                class="remove-entry" 
                onclick="${type === 'otherExpense' ? 'removeEntry' : 'removeMaintenanceEntry'}(this)">×</button>
    `;
}

function addMiscEntry() {
    const miscEntries = document.getElementById('miscEntries');
    const newEntry = document.createElement('div');
    newEntry.className = 'misc-entry';
    newEntry.innerHTML = createEntryHTML('otherExpense', miscEntryCount);
    
    miscEntries.appendChild(newEntry);
    miscEntryCount++;

    const firstEntry = miscEntries.querySelector('.misc-entry:first-child .remove-entry');
    if (firstEntry) {
        firstEntry.style.visibility = 'visible';
    }

    setupNumberInput(newEntry.querySelector('input[type="number"]'));
}

function addMaintenanceEntry() {
    const maintenanceEntries = document.getElementById('maintenanceEntries');
    const newEntry = document.createElement('div');
    newEntry.className = 'misc-entry';
    newEntry.innerHTML = createEntryHTML('maintenance', maintenanceEntryCount);
    
    maintenanceEntries.appendChild(newEntry);
    maintenanceEntryCount++;

    const firstEntry = maintenanceEntries.querySelector('.misc-entry:first-child .remove-entry');
    if (firstEntry) {
        firstEntry.style.visibility = 'visible';
    }

    setupNumberInput(newEntry.querySelector('input[type="number"]'));
}


// Entry Removal Functions
function removeEntry(button) {
    const entry = button.parentElement;
    const miscEntries = document.getElementById('miscEntries');
    
    entry.remove();
    
    if (miscEntries.children.length === 1) {
        miscEntries.querySelector('.misc-entry:first-child .remove-entry').style.visibility = 'hidden';
    }
    updateSummary();
}

function removeMaintenanceEntry(button) {
    const entry = button.parentElement;
    const maintenanceEntries = document.getElementById('maintenanceEntries');
    
    entry.remove();
    
    if (maintenanceEntries.children.length === 1) {
        maintenanceEntries.querySelector('.misc-entry:first-child .remove-entry').style.visibility = 'hidden';
    }
    updateSummary();
}

// Reset Functions
function resetMiscEntries() {
    const miscEntries = document.getElementById('miscEntries');
    miscEntries.innerHTML = `
        <div class="misc-entry">
            <div class="input-group">
                <label for="otherExpenseDescription_0">Description:</label>
                <input type="text" id="otherExpenseDescription_0" name="otherExpenseDescription_0" placeholder="Specify other expenses">
            </div>
            <div class="input-group">
                <label for="otherExpenseAmount_0">Amount:</label>
                <input type="number" id="otherExpenseAmount_0" name="otherExpenseAmount_0" min="0" step="0.01" placeholder="Input US Dollar">
            </div>
            <button type="button" class="remove-entry" onclick="removeEntry(this)" style="visibility: hidden;">×</button>
        </div>
    `;
    miscEntryCount = 1;
}

function resetMaintenanceEntries() {
    const maintenanceEntries = document.getElementById('maintenanceEntries');
    maintenanceEntries.innerHTML = `
        <div class="misc-entry">
            <div class="input-group">
                <label for="maintenanceDescription_0">Description:</label>
                <input type="text" id="maintenanceDescription_0" name="maintenanceDescription_0" placeholder="Specify maintenance">
            </div>
            <div class="input-group">
                <label for="maintenanceAmount_0">Amount:</label>
                <input type="number" id="maintenanceAmount_0" name="maintenanceAmount_0" min="0" step="0.01" placeholder="Input US Dollar">
            </div>
            <button type="button" class="remove-entry" onclick="removeMaintenanceEntry(this)" style="visibility: hidden;">×</button>
        </div>
    `;
    maintenanceEntryCount = 1;
}

// Calculation Functions
function calculateMaintenanceTotal() {
    let total = 0;
    const maintenanceAmounts = document.querySelectorAll('[id^="maintenanceAmount_"]');
    maintenanceAmounts.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    return total;
}

function calculateMiscTotal() {
    let total = 0;
    const miscAmounts = document.querySelectorAll('[id^="otherExpenseAmount_"]');
    miscAmounts.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    return total;
}

// Summary Update Functions
function updateMaintenanceSummaryDetails() {
    const summaryDetails = document.getElementById('maintenanceSummaryDetails');
    if (!summaryDetails) return;
    
    summaryDetails.innerHTML = '';
    
    const maintenanceEntries = document.querySelectorAll('#maintenanceEntries .misc-entry');
    maintenanceEntries.forEach((entry) => {
        const description = entry.querySelector('[id^="maintenanceDescription_"]').value;
        const amount = parseFloat(entry.querySelector('[id^="maintenanceAmount_"]').value) || 0;
        
        if (description || amount) {
            const detail = document.createElement('small');
            detail.innerHTML = `${description || 'Unspecified'}: <span>${formatCurrency(amount)}</span>`;
            summaryDetails.appendChild(detail);
        }
    });
}

function updateMiscSummaryDetails() {
    const summaryDetails = document.getElementById('miscSummaryDetails');
    summaryDetails.innerHTML = '';
    
    const miscEntries = document.querySelectorAll('#miscEntries .misc-entry');
    miscEntries.forEach((entry) => {
        const description = entry.querySelector('[id^="otherExpenseDescription_"]').value;
        const amount = parseFloat(entry.querySelector('[id^="otherExpenseAmount_"]').value) || 0;
        
        if (description || amount) {
            const detail = document.createElement('small');
            detail.innerHTML = `${description || 'Unspecified'}: <span>${formatCurrency(amount)}</span>`;
            summaryDetails.appendChild(detail);
        }
    });
}


// Main Summary Update Function
function updateSummary() {
    // Utilities Total
    const rentAmount = parseFloat(document.getElementById('localeRent').value) || 0;
    const electricityAmount = parseFloat(document.getElementById('electricity').value) || 0;
    const waterAmount = parseFloat(document.getElementById('water').value) || 0;
    const gasAmount = parseFloat(document.getElementById('gas').value) || 0;
    const internetAmount = parseFloat(document.getElementById('internet').value) || 0;
    const communicationAmount = parseFloat(document.getElementById('communication').value) || 0;
    
    const utilitiesTotal = rentAmount + electricityAmount + waterAmount + 
                          gasAmount + internetAmount + communicationAmount;

    // Update Utilities Summary
    document.getElementById('rentSum').textContent = formatCurrency(rentAmount);
    document.getElementById('electricitySum').textContent = formatCurrency(electricityAmount);
    document.getElementById('waterSum').textContent = formatCurrency(waterAmount);
    document.getElementById('gasSum').textContent = formatCurrency(gasAmount);
    document.getElementById('internetSum').textContent = formatCurrency(internetAmount);
    document.getElementById('communicationSum').textContent = formatCurrency(communicationAmount);
    document.getElementById('utilitiesTotal').textContent = formatCurrency(utilitiesTotal);

    // Allowance Total
    const allowanceAmount = parseFloat(document.getElementById('workersAllowance').value) || 0;
    document.getElementById('workersAllowanceSum').textContent = formatCurrency(allowanceAmount);
    document.getElementById('allowanceTotal').textContent = formatCurrency(allowanceAmount);

    // LKD Total
    const lkdAmount = parseFloat(document.getElementById('lkdMedical').value) || 0;
    document.getElementById('lkdMedicalSum').textContent = formatCurrency(lkdAmount);
    document.getElementById('lkdTotal').textContent = formatCurrency(lkdAmount);

    // Food Total
    const foodBudgetAmount = parseFloat(document.getElementById('avgFoodBudget').value) || 0;
    const foodExpenseAmount = parseFloat(document.getElementById('avgFoodExpense').value) || 0;
    const foodTotal = foodBudgetAmount + foodExpenseAmount;
    
    document.getElementById('foodBudgetSum').textContent = formatCurrency(foodBudgetAmount);
    document.getElementById('foodExpenseSum').textContent = formatCurrency(foodExpenseAmount);
    document.getElementById('foodTotal').textContent = formatCurrency(foodTotal);

    // Transportation Total
    const transportIndividualAmount = parseFloat(document.getElementById('transportIndividual').value) || 0;
    const transportBSAmount = parseFloat(document.getElementById('transportBS').value) || 0;
    const transportTotal = transportIndividualAmount + transportBSAmount;

    document.getElementById('transportIndividualSum').textContent = formatCurrency(transportIndividualAmount);
    document.getElementById('transportBSSum').textContent = formatCurrency(transportBSAmount);
    document.getElementById('transportationTotal').textContent = formatCurrency(transportTotal);

    // Update Maintenance Total and Details
    const maintenanceTotal = calculateMaintenanceTotal();
    document.getElementById('maintenanceTotal').textContent = formatCurrency(maintenanceTotal);
    updateMaintenanceSummaryDetails();

    // Update Miscellaneous Total and Details
    const miscTotal = calculateMiscTotal();
    document.getElementById('miscTotal').textContent = formatCurrency(miscTotal);
    updateMiscSummaryDetails();

    // Grand Total
    const grandTotal = utilitiesTotal + allowanceAmount + lkdAmount + foodTotal + 
                      transportTotal + maintenanceTotal + miscTotal;
    document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
}

// PDF Generation Function
async function generatePDF() {
    const pdfButton = document.querySelector('.pdf-button');
    pdfButton.disabled = true;
    pdfButton.textContent = 'Generating PDF...';

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 20;
        
        // Add title
        doc.setFontSize(18);
        doc.text('Budget Request Summary', 105, y, { align: 'center' });
        y += 15;

        // Add header information
        doc.setFontSize(12);
        const date = document.getElementById('requestDate').value;
        const country = document.getElementById('country').value;
        const city = document.getElementById('city').value;
        const requestedBy = document.getElementById('requestedBy').value;
        const approvedBy = document.getElementById('approvedBy').value;
        const budgetMonth = document.getElementById('budgetMonth').value;

        doc.text(`Date: ${date}`, 20, y);
        y += 8;
        doc.text(`Country: ${country}`, 20, y);
        y += 8;
        doc.text(`City: ${city}`, 20, y);
        y += 8;
        doc.text(`Budget Month: ${budgetMonth}`, 20, y);
        y += 8;
        doc.text(`Requested By: ${requestedBy}`, 20, y);
        y += 8;
        doc.text(`Approved By: ${approvedBy}`, 20, y);
        y += 15;

        function addSection(title, items) {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(title, 20, y);
            y += 8;
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            
            items.forEach(item => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(`${item.label}: ${formatCurrency(item.value)}`, 30, y);
                y += 6;
            });
            
            y += 5;
        }

        // Add sections
        const utilities = [
            { label: 'Locale Rent', value: parseFloat(document.getElementById('localeRent').value) || 0 },
            { label: 'Electricity', value: parseFloat(document.getElementById('electricity').value) || 0 },
            { label: 'Water & Drinking', value: parseFloat(document.getElementById('water').value) || 0 },
            { label: 'Water & Gas', value: parseFloat(document.getElementById('gas').value) || 0 },
            { label: 'Internet', value: parseFloat(document.getElementById('internet').value) || 0 },
            { label: 'Communication', value: parseFloat(document.getElementById('communication').value) || 0 }
        ];
        addSection('Utilities', utilities);

        const allowance = [
            { label: 'Workers Allowance & Food', value: parseFloat(document.getElementById('workersAllowance').value) || 0 }
        ];
        addSection('Allowance', allowance);

        const lkd = [
            { label: 'LKD Medical & Financial', value: parseFloat(document.getElementById('lkdMedical').value) || 0 }
        ];
        addSection('LKD Assistance', lkd);

        const food = [
            { label: 'Average Food Budget (Brethren)', value: parseFloat(document.getElementById('avgFoodBudget').value) || 0 },
            { label: 'Average Food Expense (BS/Doktrina)', value: parseFloat(document.getElementById('avgFoodExpense').value) || 0 }
        ];
        addSection('Food', food);

        const transportation = [
            { label: 'Individual Expenses', value: parseFloat(document.getElementById('transportIndividual').value) || 0 },
            { label: 'BS/Dokrina', value: parseFloat(document.getElementById('transportBS').value) || 0 }
        ];
        addSection('Transportation', transportation);

        // Maintenance Section
        const maintenanceEntries = document.querySelectorAll('#maintenanceEntries .misc-entry');
        const maintenanceItems = Array.from(maintenanceEntries).map(entry => {
            const description = entry.querySelector('[id^="maintenanceDescription_"]').value;
            const amount = parseFloat(entry.querySelector('[id^="maintenanceAmount_"]').value) || 0;
            return { label: description || 'Unspecified', value: amount };
        }).filter(item => item.value > 0);

        if (maintenanceItems.length > 0) {
            addSection('Maintenance', maintenanceItems);
        }

        // Miscellaneous Section
        const miscEntries = document.querySelectorAll('#miscEntries .misc-entry');
        const miscItems = Array.from(miscEntries).map(entry => {
            const description = entry.querySelector('[id^="otherExpenseDescription_"]').value;
            const amount = parseFloat(entry.querySelector('[id^="otherExpenseAmount_"]').value) || 0;
            return { label: description || 'Unspecified', value: amount };
        }).filter(item => item.value > 0);

        if (miscItems.length > 0) {
            addSection('Miscellaneous', miscItems);
        }

        // Add Grand Total
        if (y > 250) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        const grandTotal = parseFloat(document.getElementById('grandTotal').textContent.replace(/[^0-9.-]+/g, ''));
        doc.text(`Grand Total: ${formatCurrency(grandTotal)}`, 105, y, { align: 'center' });

        // Save the PDF
        const fileName = `Budget_Request_${country}_${city}_${date}.pdf`;
        doc.save(fileName);
        
        pdfButton.disabled = false;
        pdfButton.textContent = 'Download PDF Summary';
    } catch (error) {
        console.error('PDF generation failed:', error);
        pdfButton.disabled = false;
        pdfButton.textContent = 'Download PDF Summary';
        alert('Failed to generate PDF. Please try again.');
    }
}


// Form Submission Function
async function submitForm(formData) {
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 'success') {
            alert('Budget request submitted successfully!');
            document.getElementById('budgetRequestForm').reset();
            resetMiscEntries();
            resetMaintenanceEntries();
            updateSummary();
        } else {
            throw new Error(result.message || 'Server returned an error');
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert(`Failed to submit budget request. ${error.message}`);
        throw error;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Budget Request';
    }
}

// Form Initialization and Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('budgetRequestForm');
    const budgetTypeSelect = document.getElementById('budgetType');
    const otherBudgetTypeContainer = document.getElementById('otherBudgetTypeContainer');
    const otherBudgetTypeInput = document.getElementById('otherBudgetType');

    // Budget type selection handler
    budgetTypeSelect.addEventListener('change', function() {
        const isOther = this.value === 'Other';
        otherBudgetTypeContainer.style.display = isOther ? 'block' : 'none';
        otherBudgetTypeInput.required = isOther;
    });

    // Set up all number inputs
    form.querySelectorAll('input[type="number"]').forEach(setupNumberInput);

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {
            miscEntries: [],
            maintenanceEntries: []
        };
    
        // Process form data
        for (let [key, value] of formData.entries()) {
            if (key.startsWith('otherExpenseDescription_') || key.startsWith('otherExpenseAmount_')) {
                processEntryData(key, value, data.miscEntries, 'otherExpenseDescription_');
            } else if (key.startsWith('maintenanceDescription_') || key.startsWith('maintenanceAmount_')) {
                processEntryData(key, value, data.maintenanceEntries, 'maintenanceDescription_');
            } else {
                data[key] = value;
            }
        }
    
        try {
            await submitForm(data);
        } catch (error) {
            // Error is already handled in submitForm
            console.error('Form submission failed:', error);
        }
    });

    // Initial summary update
    updateSummary();
});
