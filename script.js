document.addEventListener("DOMContentLoaded", function() {

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
    window.addPart = function() {
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
    };

    /* =======================
       REMOVE ROW
    ======================= */
    window.removeRow = function(btn) {
        btn.closest("tr").remove();
        updateSerialNumbers();
    };

    function updateSerialNumbers() {
        const rows = document.querySelectorAll("#partsTable tbody tr");
        serialNumber = 1;
        rows.forEach(row => {
            row.cells[0].innerText = serialNumber++;
        });
    }

    /* =======================
       LOAD HEADER IMAGES
    ======================= */
    function getHeaderImages(callback) {
        const logoEl = document.getElementById("companyLogo");
        const nameEl = document.getElementById("companyName");

        const logoImg = new Image();
        const nameImg = new Image();
        let loaded = 0;

        function checkLoad() {
            loaded++;
            if (loaded === 2) {
                callback({ logoImg, nameImg });
            }
        }

        logoImg.crossOrigin = "Anonymous";
        nameImg.crossOrigin = "Anonymous";

        logoImg.src = logoEl.src;
        nameImg.src = nameEl.src;

        logoImg.onload = checkLoad;
        nameImg.onload = checkLoad;
    }

    /* =======================
       DOWNLOAD PDF
    ======================= */
    window.downloadPDF = function() {
        const { jsPDF } = window.jspdf;

        const customerName = document.getElementById("customerName").value || "Customer";
        const customerNumber = document.getElementById("customerNumber").value || "";
        const service = document.getElementById("service").value || "";
        const date = document.getElementById("currentDate").innerText;

        const marginLeft = 20;

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

        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        getHeaderImages(function(images) {
            renderPDF(images.logoImg, images.nameImg, doc);
        });

        function renderPDF(logoImg, nameImg, doc) {
            const pageWidth = doc.internal.pageSize.getWidth();

            // HEADER IMAGES
            doc.addImage(logoImg, "PNG", marginLeft, 4, 20, 20);
            doc.addImage(nameImg, "PNG", marginLeft + 25, 4, 60, 20);

// RIGHT SIDE ICON + VALUE ONLY (FINAL UPDATED)
const rightX = pageWidth - 100;
const iconSize = 4;

const phoneImg = new Image();
const whatsappImg = new Image();
const mailImg = new Image();
const webImg = new Image();

phoneImg.src = "https://cdn-icons-png.flaticon.com/512/724/724664.png";
whatsappImg.src = "https://cdn-icons-png.flaticon.com/512/733/733585.png";
mailImg.src = "https://cdn-icons-png.flaticon.com/512/732/732200.png";
webImg.src = "https://cdn-icons-png.flaticon.com/512/841/841364.png";

doc.setFontSize(10);
doc.setFont("helvetica","normal");
doc.setTextColor(0,0,0);

// PHONE
doc.addImage(phoneImg,"PNG",rightX,6,iconSize,iconSize);
doc.text("9949979972",rightX+6,9);

// WHATSAPP
doc.addImage(whatsappImg,"PNG",rightX,12,iconSize,iconSize);
doc.text("9951775590",rightX+6,15);

// EMAIL CLICKABLE (BLUE + UNDERLINE)
doc.addImage(mailImg,"PNG",rightX,18,iconSize,iconSize);

doc.setTextColor(0,0,255);
doc.setFont("helvetica","italic");

const emailText = "basavarajuganesh192@gmail.com";
doc.textWithLink(
    emailText,
    rightX+6,
    21,
    { url:"mailto:basavarajuganesh192@gmail.com" }
);

const emailWidth = doc.getTextWidth(emailText);
doc.line(rightX+6,22,rightX+6+emailWidth,22);

doc.setTextColor(0,0,0);
doc.setFont("helvetica","normal");

// WEBSITE CLICKABLE (BLUE + UNDERLINE)
doc.addImage(webImg,"PNG",rightX,24,iconSize,iconSize);

doc.setTextColor(0,0,255);
doc.setFont("helvetica","italic");

const webText = "www.ganeshpowerandflow.com";
doc.textWithLink(
    webText,
    rightX+6,
    27,
    { url:"https://sureshgunduboina.github.io/Ganesh/" }
);

const webWidth = doc.getTextWidth(webText);
doc.line(rightX+6,28,rightX+6+webWidth,28);

doc.setTextColor(0,0,0);
doc.setFont("helvetica","normal");


            // LINE UNDER HEADER
            doc.setDrawColor(0);
            doc.setLineWidth(0.8);
            doc.line(marginLeft, 30, pageWidth - marginLeft, 30);

            // CUSTOMER INFO
            doc.setFontSize(11);
            doc.text(`Customer: ${customerName}`, marginLeft, 36);
            doc.text(`Mobile: ${customerNumber}`, marginLeft, 44);
            doc.text(`Date: ${date}`, marginLeft, 52);

            // SERVICE TITLE CENTER
            if(service) {
                doc.setFont(undefined, "bold");
                const textWidth = doc.getTextWidth(service);
                doc.text(service, (pageWidth - textWidth)/2, 60);
                doc.setFont(undefined, "normal");
            }

            // TABLE
            doc.autoTable({
                startY: 65,
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
                    2: { halign: 'center' },
                    3: { halign: 'right' },
                    4: { halign: 'right' }
                }
            });

            const safeName = customerName.replace(/\s+/g, "_");
            doc.save(`${safeName}_${date}.pdf`);
        }
    };

});
