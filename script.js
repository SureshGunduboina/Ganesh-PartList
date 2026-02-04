let serialNumber = 1;

/* =======================
   SET CURRENT DATE
======================= */
function setCurrentDate() {
  const today = new Date();
  const formatted =
    today.getDate().toString().padStart(2, "0") + "-" +
    (today.getMonth() + 1).toString().padStart(2, "0") + "-" +
    today.getFullYear();
  document.getElementById("currentDate").innerText = formatted;
}
setCurrentDate();

/* =======================
   ADD PART
======================= */
function addPart() {
  const partName = document.getElementById("partName").value.trim();
  const quantity = document.getElementById("quantity").value.trim();

  if (!partName || !quantity) {
    alert("Please enter part name and quantity");
    return;
  }

  const tableBody = document.querySelector("#partsTable tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${serialNumber}</td>
    <td contenteditable="true">${partName}</td>
    <td contenteditable="true">${quantity}</td>
    <td></td>
    <td></td>
    <td><button onclick="removeRow(this)">Remove</button></td>
  `;
  tableBody.appendChild(row);
  serialNumber++;

  document.getElementById("partName").value = "";
  document.getElementById("quantity").value = "";
}

/* =======================
   REMOVE ROW
======================= */
function removeRow(btn) {
  btn.closest("tr").remove();
  updateSerialNumbers();
}

function updateSerialNumbers() {
  const rows = document.querySelectorAll("#partsTable tbody tr");
  serialNumber = 1;
  rows.forEach(row => {
    row.cells[0].innerText = serialNumber++;
  });
}

/* =======================
   UTILITY FUNCTIONS
======================= */
function rgbToArray(rgb) {
  const result = rgb.match(/\d+/g);
  return result ? result.map(Number) : [0,0,0];
}

function getHeaderStyle() {
  const el = document.getElementById("pdfHeader");
  const comp = getComputedStyle(el);
  return { 
    bg: rgbToArray(comp.backgroundColor), 
    color: rgbToArray(comp.color), 
    fontSize: parseInt(comp.fontSize.replace("px","")) || 14 
  };
}

function getFooterStyle() {
  const el = document.getElementById("pdfFooter");
  const comp = getComputedStyle(el);
  return { 
    bg: rgbToArray(comp.backgroundColor), 
    color: rgbToArray(comp.color), 
    fontSize: parseInt(comp.fontSize.replace("px","")) || 10 
  };
}

function getHeaderText() { return document.getElementById("companyName").innerText; }
function getFooterText() { return document.getElementById("pdfFooter").innerText; }

function getHeaderLogo() {
  const imgEl = document.getElementById("companyLogo");
  const logo = new Image();
  logo.crossOrigin = "Anonymous";
  logo.src = imgEl.src;
  return logo;
}

/* =======================
   DOWNLOAD PDF
======================= */
function downloadPDF() {
  const { jsPDF } = window.jspdf;

  const customerName = document.getElementById("customerName").value || "Customer";
  const customerNumber = document.getElementById("customerNumber").value || "";
  const date = document.getElementById("currentDate").innerText;

  const headerText = getHeaderText();
  const footerText = getFooterText();
  const headerStyle = getHeaderStyle();
  const footerStyle = getFooterStyle();
  const logoImg = getHeaderLogo();

  const marginLeft = 20; // 2 cm

  // Build table rows from HTML table
  const rows = [];
  document.querySelectorAll("#partsTable tbody tr").forEach(tr => {
    rows.push([
      tr.cells[0].innerText,
      tr.cells[1].innerText,
      tr.cells[2].innerText,
      tr.cells[3]?.innerText || "",
      tr.cells[4]?.innerText || ""
    ]);
  });

  const rowHeight = 8;
  const headerHeight = 55;
  const footerHeight = 25;
  const tableHeight = rows.length * rowHeight + 15;
  const pdfHeight = Math.max(297, headerHeight + tableHeight + footerHeight);

  const doc = new jsPDF({ unit: 'mm', format: [210, pdfHeight] });

  function renderPDF(logoImg) {
    // Header background
    if (headerStyle.bg.some(c => c !== 0)) {
      doc.setFillColor(...headerStyle.bg);
      doc.rect(0, 0, 210, 20, "F");
    }

    // Add logo
    doc.addImage(logoImg, "PNG", marginLeft, 4, 20, 20);

    // Header text
    doc.setFontSize(headerStyle.fontSize);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...headerStyle.color);
    doc.text(headerText, marginLeft + 25, 14);
    doc.setDrawColor(0); // black line
doc.setLineWidth(0.8);
doc.line(marginLeft, 20, 190, 20);

    // Customer info
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0,0,0);
    doc.text(`Customer: ${customerName}`, marginLeft, 30);
    doc.text(`Mobile: ${customerNumber}`, marginLeft, 38);
    doc.text(`Date: ${date}`, marginLeft, 46);

    // Table
    doc.autoTable({
      startY: 55,
      head: [["S No", "Part Name", "Qty", "Rate/Part", "Price"]],
      body: rows,
      theme: "grid",
      margin: { left: marginLeft },

      headStyles: {
        fontStyle: 'bold',
        fillColor: false,
        textColor: 0,
        lineColor: [0,0,0],
        lineWidth: 0.8
      },

      bodyStyles: {
        textColor: 0,
        lineColor: [0,0,0],
        lineWidth: 0.2
      },

      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' } // Total column
      },

      didDrawPage: function(data) {
        const pageHeight = doc.internal.pageSize.height;
        const lines = footerText.split("\n");
        doc.setFontSize(footerStyle.fontSize);
        doc.setFont(undefined, "normal");
        doc.setTextColor(...footerStyle.color);
        lines.forEach((line,i) => {
          doc.text(line, marginLeft, pageHeight - 18 + 6 + i*5);
        });
      }
    });

    // Save PDF
    const safeName = customerName.replace(/\s+/g, "_");
    doc.save(`${safeName}_${date}.pdf`);
  }

  // Handle image load async-safe
  if (logoImg.complete) {
    renderPDF(logoImg);
  } else {
    logoImg.onload = () => renderPDF(logoImg);
  }
}
