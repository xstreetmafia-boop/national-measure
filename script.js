// --- OPTIONS DATA ---
const GRILL_OPTIONS = [
    "None", 
    "12mm round rad",
    "12mm square rad",
    "12mm patta kambi",
    "16mm round rad",
    "16mm square rad",
    "20mm square rad",
    "25mm square rad",
    "16mm sq tube",
    "16mm round tube",
    "16mm diamond tube",
    "20mm sq tube",
    "20mm round tube",
    "20mm ss grill",
    "25mm sq tube",
    "25mm round tube",
    "20mm diamond tube" 
];

const FRAME_OPTIONS = [
    "3x2.5",
    "4x2.5",
    "4x3",
    "5x3",
    "6x3",
    "6x4",
    "7x3",
    "7x4",
    "8x4",
    "9x4",
    "10x4"
];
// --------------------------


// Get references to DOM elements
const addRowBtn = document.getElementById('addRowBtn');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const tableBody = document.getElementById('orderTable').getElementsByTagName('tbody')[0];
const frameOptionsList = document.getElementById('frameOptionsList'); 

// Header Inputs
const inputPartyName = document.getElementById('inputPartyName'); 
const inputLocation = document.getElementById('inputLocation'); 

// Item Inputs
const inputItem = document.getElementById('inputItem');
const inputWidth = document.getElementById('inputWidth');
const inputHeight = document.getElementById('inputHeight');
const inputQty = document.getElementById('inputQty');
const inputGrillType = document.getElementById('inputGrillType'); 
const inputFrameSize = document.getElementById('inputFrameSize'); 


// Function to populate the dropdowns (Grill only)
function populateSelectOptions(selectElement, optionsArray, selectedValue = 'None') {
    selectElement.innerHTML = ''; 
    optionsArray.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        if (optionText === selectedValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

// Function to populate the Datalist for Frame Size
function populateDatalist(datalistElement, optionsArray) {
    datalistElement.innerHTML = '';
    optionsArray.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        datalistElement.appendChild(option);
    });
}


// Function to check if the table has any rows and enable/disable the PDF button
function updatePdfButtonState() {
    generatePdfBtn.disabled = tableBody.rows.length === 0;
}

// Function to create an input element for a table cell (used for text/number/Frame Size)
function createInputCell(type, value, placeholder, className = '', isFrameSize = false) {
    const td = document.createElement('td');
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.placeholder = placeholder;
    input.className = 'form-control-plaintext ' + className; 
    input.setAttribute('data-type', type);
    
    if (isFrameSize) {
        input.setAttribute('placeholder', 'Type here...');
    }
    
    // Add event listeners for dynamic updates
    if (type === 'number') {
        input.setAttribute('min', '0');
        input.addEventListener('change', () => {
            if (input.value < 0 || input.value === '') {
                input.value = (type === 'number' && input.getAttribute('min') === '1') ? '1' : '0';
            }
        });
    }

    td.appendChild(input);
    return td;
}

// Function to create a Grill Type Select cell
function createGrillSelectCell(selectedValue) {
    const td = document.createElement('td');
    const select = document.createElement('select');
    select.className = 'form-select form-select-sm';
    select.setAttribute('data-type', 'select');

    populateSelectOptions(select, GRILL_OPTIONS, selectedValue); 

    td.appendChild(select);
    return td;
}


// Function to add a new row to the table
function addRow(item, width, height, qty, grillType, frameSize) {
    const newRow = tableBody.insertRow();

    // Data cells
    newRow.appendChild(createInputCell('text', item, 'Item Name'));
    newRow.appendChild(createInputCell('number', width, '0', 'table-input-number'));
    newRow.appendChild(createInputCell('number', height, '0', 'table-input-number'));
    newRow.appendChild(createInputCell('number', qty, '1', 'table-input-number'));
    newRow.appendChild(createGrillSelectCell(grillType)); 
    newRow.appendChild(createInputCell('text', frameSize, '4x3 or Custom', '', true)); 

    // Delete Button
    const actionCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function() {
        tableBody.removeChild(newRow);
        updatePdfButtonState();
    };
    actionCell.appendChild(deleteBtn);
    newRow.appendChild(actionCell);

    // Clear main inputs and update button state
    inputItem.value = '';
    inputWidth.value = '';
    inputHeight.value = '';
    inputQty.value = '';
    inputGrillType.value = 'None'; 
    inputFrameSize.value = ''; 
    inputItem.focus();
    updatePdfButtonState();
}

// Event listener for the "Add Item" button
addRowBtn.addEventListener('click', () => {
    // Basic validation
    const item = inputItem.value.trim();
    const width = parseFloat(inputWidth.value) || 0;
    const height = parseFloat(inputHeight.value) || 0;
    const qty = parseInt(inputQty.value) || 1;
    const grillType = inputGrillType.value; 
    const frameSize = inputFrameSize.value.trim(); 

    if (item === '') {
        alert('Please enter an Item Name.');
        inputItem.focus();
        return;
    }
    if (width < 0 || height < 0 || qty < 1) {
        alert('Width, Height must be non-negative, and Quantity must be at least 1.');
        return;
    }

    addRow(item, width, height, qty, grillType, frameSize); 
});


// Function to collect data from the table for PDF generation
function collectTableData() {
    const data = [];
    const rows = tableBody.rows;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.cells;
        
        const itemInput = cells[0].querySelector('input');
        const widthInput = cells[1].querySelector('input');
        const heightInput = cells[2].querySelector('input');
        const qtyInput = cells[3].querySelector('input');
        const grillSelect = cells[4].querySelector('select'); 
        const frameInput = cells[5].querySelector('input'); 

        if (itemInput && widthInput && heightInput && qtyInput && grillSelect && frameInput) {
            data.push([
                itemInput.value.trim(),
                parseFloat(widthInput.value) || 0,
                parseFloat(heightInput.value) || 0,
                parseInt(qtyInput.value) || 1,
                grillSelect.value,
                frameInput.value.trim() 
            ]);
        }
    }
    return data;
}

// Event listener for the "Generate PDF" button
generatePdfBtn.addEventListener('click', () => {
    const tableData = collectTableData();
    const partyName = inputPartyName.value.trim(); 
    const location = inputLocation.value.trim(); 
    
    if (tableData.length === 0) {
        alert('The table is empty. Add some items first!');
        return;
    }

    // Capture CURRENT DATE and TIME when the PDF is generated
    const now = new Date();
    const date = now.toLocaleDateString();
    // Format time (e.g., 03:48 PM)
    const timeDisplay = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); 

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20; 

    // 1. Document Title (UPDATED HERE)
    doc.setFontSize(22);
    doc.text('NMF Angamaly', 14, y);
    y += 10;

    // 2. Party Name
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Party Name:`, 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(partyName || 'N/A', 45, y); 
    y += 8;
    
    // 3. Location
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Location:`, 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(location || 'N/A', 40, y); 
    y += 8;

    // 4. Date and Time
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`Date:`, 14, y);
    doc.setFont(undefined, 'normal');
    doc.text(`${date}`, 27, y);
    
    doc.setFont(undefined, 'bold');
    doc.text(`Time:`, 55, y);
    doc.setFont(undefined, 'normal');
    doc.text(`${timeDisplay}`, 68, y);
    y += 8;

    // 5. Table Header Definition
    const head = [
        ['Item', 'Width (cm)', 'Height (cm)', 'Quantity', 'Grill Type', 'Frame Size'] 
    ];

    // Convert the data to string format for autoTable
    const body = tableData.map(row => row.map(cell => cell.toString()));

    // 6. Generate the table using autoTable plugin
    doc.autoTable({
        head: head,
        body: body,
        startY: y + 5, 
        theme: 'grid', 
        styles: { fontSize: 8, cellPadding: 2, halign: 'center' }, 
        headStyles: { fillColor: [50, 50, 50] },
        columnStyles: { 
            0: { cellWidth: 35 }, 
            4: { cellWidth: 30 },  
            5: { cellWidth: 25 }  
        }
    });

    // Save the PDF
    doc.save(`${partyName || 'Untitled_Order'}_Summary.pdf`);
});

// --- Initialization ---
// 1. Populate the main input dropdown (Grill)
populateSelectOptions(inputGrillType, GRILL_OPTIONS);

// 2. Populate the Frame Size datalist
populateDatalist(frameOptionsList, FRAME_OPTIONS);

// 3. Initialize the button state on load
updatePdfButtonState();

// 4. Optional: Add a few default rows for testing
addRow('Custom Frame', 20, 30, 5, '16mm square rad', '4x3'); 
addRow('Sliding Door', 150, 210, 1, '20mm ss grill', 'Custom 6x4.5');
// --- DRAG AND DROP ROW REORDERING ---
let draggedRow = null;

// Allow rows to be draggable
function enableRowDragging() {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        row.draggable = true;

        row.addEventListener('dragstart', (e) => {
            draggedRow = row;
            row.style.opacity = '0.5';
        });

        row.addEventListener('dragend', (e) => {
            row.style.opacity = '';
            draggedRow = null;
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            const bounding = row.getBoundingClientRect();
            const offset = bounding.y + bounding.height / 2;
            const after = (e.clientY - offset) > 0;
            const parent = row.parentNode;

            if (after) {
                parent.insertBefore(draggedRow, row.nextSibling);
            } else {
                parent.insertBefore(draggedRow, row);
            }
        });
    });
}

// Re-enable dragging after every new row is added
const originalAddRow = addRow;
addRow = function (...args) {
    originalAddRow.apply(this, args);
    enableRowDragging();
};

// Initialize on load (for default rows)
enableRowDragging();


