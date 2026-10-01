/**
 * OZ Pilates - Compact Single-Screen Proposal System
 * Ultra-fast quotation & instant PDF generation
 */

const formatCurrency = (val) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val || 0);
};

const formatNumber = (val) => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val || 0);
};

// Turkish Number to Words
function numberToTurkishWords(amount) {
  if (isNaN(amount) || amount === 0) return 'Sıfır Türk Lirası';
  
  const ones = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
  const tens = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];
  const groups = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon'];
  
  const [liraStr, kurusStr] = amount.toFixed(2).split('.');
  let lira = parseInt(liraStr, 10);
  let kurus = parseInt(kurusStr, 10);
  
  function convertGroup(n) {
    let s = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    
    if (h > 0) {
      if (h === 1) s += 'Yüz ';
      else s += ones[h] + ' Yüz ';
    }
    if (t > 0) s += tens[t] + ' ';
    if (o > 0) s += ones[o] + ' ';
    return s.trim();
  }
  
  let result = '';
  let groupIndex = 0;
  
  while (lira > 0) {
    const chunk = lira % 1000;
    if (chunk > 0) {
      let chunkText = convertGroup(chunk);
      if (groupIndex === 1 && chunk === 1) {
        chunkText = 'Bin';
      } else if (groups[groupIndex]) {
        chunkText += ' ' + groups[groupIndex];
      }
      result = chunkText + ' ' + result;
    }
    lira = Math.floor(lira / 1000);
    groupIndex++;
  }
  
  result = result.trim() + ' Türk Lirası';
  if (kurus > 0) {
    result += ' ' + convertGroup(kurus) + ' Kuruş';
  }
  return result;
}

// 5 Standard Products
const defaultProducts = [
  {
    id: 'p1',
    code: 'OZ1001',
    name: 'Cadillac Combo Reformer',
    image: window.DEFAULT_ASSETS ? window.DEFAULT_ASSETS.OZ1001 : 'assets/products/OZ1001.png',
    qty: 1,
    unit: 'AD',
    price: 65500,
    enabled: true
  },
  {
    id: 'p2',
    code: 'OZ1002',
    name: 'Tower Reformer',
    image: window.DEFAULT_ASSETS ? window.DEFAULT_ASSETS.OZ1002 : 'assets/products/OZ1002.png',
    qty: 1,
    unit: 'AD',
    price: 53500,
    enabled: true
  },
  {
    id: 'p3',
    code: 'OZ1003',
    name: 'Reformer',
    image: window.DEFAULT_ASSETS ? window.DEFAULT_ASSETS.OZ1003 : 'assets/products/OZ1003.png',
    qty: 1,
    unit: 'AD',
    price: 42300,
    enabled: true
  },
  {
    id: 'p4',
    code: 'OZ1004',
    name: 'Ladder Barrel',
    image: window.DEFAULT_ASSETS ? window.DEFAULT_ASSETS.OZ1004 : 'assets/products/OZ1004.png',
    qty: 1,
    unit: 'AD',
    price: 28000,
    enabled: true
  },
  {
    id: 'p5',
    code: 'OZ1005',
    name: 'Combo Chair',
    image: window.DEFAULT_ASSETS ? window.DEFAULT_ASSETS.OZ1005 : 'assets/products/OZ1005.png',
    qty: 1,
    unit: 'AD',
    price: 29500,
    enabled: true
  }
];

const defaultState = {
  client: {
    name: '',
    contact: '',
    phone: '',
    address: ''
  },
  quote: {
    no: 'OZ-2026-001',
    date: new Date().toISOString().split('T')[0],
    salesRep: 'Satış Temsilcisi',
    subject: 'Pilates Ekipmanları Teklifi'
  },
  products: JSON.parse(JSON.stringify(defaultProducts)),
  discountPercent: 0,
  vatStatus: 'exclusive', // exclusive, inclusive, exempt
  vatRate: 20,
  terms: [
    'Fiyatlara nakliye dahildir.',
    'KDV HARİÇ fiyatlardır.',
    'Ödeme ; Sipariş ile birlikte %50 , Teslimat öncesi %50',
    'Teslimat süresi: Sipariş onayından itibaren 15-20 iş günüdür.',
    'Teklifin geçerlilik süresi 15 gündür.'
  ],
  options: {
    showImages: true,
    showSignature: true,
    zoom: 'auto'
  }
};

let appState = JSON.parse(JSON.stringify(defaultState));

// DOM Elements
const elements = {
  clientName: document.getElementById('client-name'),
  clientContact: document.getElementById('client-contact'),
  clientPhone: document.getElementById('client-phone'),
  clientAddress: document.getElementById('client-address'),
  quoteNo: document.getElementById('quote-no'),
  quoteDate: document.getElementById('quote-date'),
  
  toggleShowImages: document.getElementById('toggle-show-images'),
  productTableRows: document.getElementById('product-table-rows'),
  
  discountPercentInput: document.getElementById('discount-percent-input'),
  presetChips: document.querySelectorAll('.preset-chip'),
  vatStatus: document.getElementById('vat-status'),
  
  sumSubtotal: document.getElementById('sum-subtotal'),
  sumDiscountPct: document.getElementById('sum-discount-pct'),
  sumDiscountVal: document.getElementById('sum-discount-val'),
  sumVatVal: document.getElementById('sum-vat-val'),
  sumGrandTotal: document.getElementById('sum-grand-total'),
  sumInWords: document.getElementById('sum-in-words'),
  
  toggleShowSignature: document.getElementById('toggle-show-signature'),
  btnEditTerms: document.getElementById('btn-edit-terms'),
  btnQuickPdf: document.getElementById('btn-quick-pdf'),
  
  // Right Preview
  a4Viewport: document.getElementById('a4-viewport'),
  previewWrapper: document.getElementById('preview-wrapper'),
  a4Document: document.getElementById('a4-document-print'),
  headerLogo: document.getElementById('header-logo'),
  docLogoImg: document.getElementById('doc-logo-img'),
  
  docClientName: document.getElementById('doc-client-name'),
  docClientPhone: document.getElementById('doc-client-phone'),
  docClientEmail: document.getElementById('doc-client-email'),
  docClientAddress: document.getElementById('doc-client-address'),
  docSalesRep: document.getElementById('doc-sales-rep'),
  docQuoteNo: document.getElementById('doc-quote-no'),
  docQuoteDate: document.getElementById('doc-quote-date'),
  docQuoteSubject: document.getElementById('doc-quote-subject'),
  docClientGreeting: document.getElementById('doc-client-greeting'),
  docTableBody: document.getElementById('doc-table-body'),
  docTermsList: document.getElementById('doc-terms-list'),
  
  docTotalGross: document.getElementById('doc-total-gross'),
  docDiscountRow: document.getElementById('doc-discount-row'),
  docDiscountRate: document.getElementById('doc-discount-rate'),
  docDiscountVal: document.getElementById('doc-discount-val'),
  docNetTotal: document.getElementById('doc-net-total'),
  docVatRate: document.getElementById('doc-vat-rate'),
  docVatVal: document.getElementById('doc-vat-val'),
  docGrandTotal: document.getElementById('doc-grand-total'),
  docFooterSection: document.getElementById('doc-footer-section'),
  
  // Zoom
  zoomIn: document.getElementById('zoom-in'),
  zoomOut: document.getElementById('zoom-out'),
  zoomFit: document.getElementById('zoom-fit'),
  zoomLevelText: document.getElementById('zoom-level-text'),
  
  // Modals
  termsModal: document.getElementById('terms-modal'),
  termsModalClose: document.getElementById('terms-modal-close'),
  termsListContainer: document.getElementById('terms-list-container'),
  btnAddTerm: document.getElementById('btn-add-term'),
  
  historyModal: document.getElementById('history-modal'),
  historyModalClose: document.getElementById('history-modal-close'),
  historyListContainer: document.getElementById('history-list-container'),
  historySearch: document.getElementById('history-search'),
  
  // Top Buttons
  btnNewQuote: document.getElementById('btn-new-quote'),
  btnSaveQuote: document.getElementById('btn-save-quote'),
  btnOpenHistory: document.getElementById('btn-open-history'),
  btnExportExcel: document.getElementById('btn-export-excel'),
  btnPrint: document.getElementById('btn-print'),
  btnDownloadPdf: document.getElementById('btn-download-pdf'),
  
  toastContainer: document.getElementById('toast-container')
};

// Set logo
if (window.DEFAULT_ASSETS && window.DEFAULT_ASSETS.logo) {
  elements.docLogoImg.src = window.DEFAULT_ASSETS.logo;
  elements.headerLogo.src = window.DEFAULT_ASSETS.logo;
}

// Toast
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}

// Format Date Tr
function formatDateTr(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : dateStr;
}

// Financials
function calculateFinancials() {
  const activeProducts = appState.products.filter(p => p.enabled && p.qty > 0);
  const grossTotal = activeProducts.reduce((acc, p) => acc + (Number(p.qty) || 0) * (Number(p.price) || 0), 0);
  const discountPercent = Number(appState.discountPercent) || 0;
  const discountAmount = grossTotal * (discountPercent / 100);
  const netSubtotal = Math.max(0, grossTotal - discountAmount);
  
  const vatRate = appState.vatStatus === 'exempt' ? 0 : 20;
  let vatAmount = 0;
  let grandTotal = 0;
  
  if (appState.vatStatus === 'exclusive') {
    vatAmount = netSubtotal * (vatRate / 100);
    grandTotal = netSubtotal + vatAmount;
  } else if (appState.vatStatus === 'inclusive') {
    grandTotal = netSubtotal;
    vatAmount = grandTotal - (grandTotal / (1 + vatRate / 100));
  } else {
    vatAmount = 0;
    grandTotal = netSubtotal;
  }
  
  return {
    grossTotal,
    discountPercent,
    discountAmount,
    netSubtotal,
    vatRate,
    vatAmount,
    grandTotal
  };
}

// Render Products in Left Table
function renderProductTable() {
  elements.productTableRows.innerHTML = '';
  
  appState.products.forEach(p => {
    const tr = document.createElement('tr');
    if (!p.enabled) tr.classList.add('row-disabled');
    
    const lineTotal = (Number(p.qty) || 0) * (Number(p.price) || 0);
    
    tr.innerHTML = `
      <td style="text-align: center;">
        <input type="checkbox" class="prod-toggle" data-id="${p.id}" ${p.enabled ? 'checked' : ''} style="cursor: pointer;">
      </td>
      <td style="text-align: center;">
        <img class="p-thumb" src="${p.image}" alt="${p.name}">
      </td>
      <td>
        <div style="font-weight: 700; color: var(--text-main);">${p.name}</div>
        <div style="font-size: 10px; color: var(--text-muted);">${p.code} (${p.unit})</div>
      </td>
      <td style="text-align: center;">
        <div class="qty-stepper">
          <button type="button" class="qty-btn" data-action="dec" data-id="${p.id}">-</button>
          <input type="text" class="qty-val" data-id="${p.id}" value="${p.qty}">
          <button type="button" class="qty-btn" data-action="inc" data-id="${p.id}">+</button>
        </div>
      </td>
      <td style="text-align: right;">
        <input type="number" class="form-input prod-price-input" data-id="${p.id}" value="${p.price}" style="width: 85px; text-align: right; padding: 2px 4px; font-weight: 500;" step="500">
      </td>
      <td style="text-align: right; font-weight: 700; color: var(--primary-dark);">
        ${formatCurrency(lineTotal)}
      </td>
    `;
    elements.productTableRows.appendChild(tr);
  });
}

// Update Live Preview (Right Panel)
function updatePreview() {
  const fin = calculateFinancials();
  
  // Client Info
  elements.docClientName.textContent = `: ${appState.client.name || '-'}`;
  elements.docClientPhone.textContent = `: ${appState.client.phone || '-'}`;
  elements.docClientEmail.textContent = `: -`;
  elements.docClientAddress.textContent = `: ${appState.client.address || '-'}`;
  
  // Greeting
  if (appState.client.contact && appState.client.contact.trim() !== '') {
    elements.docClientGreeting.textContent = `${appState.client.contact.trim()} ;`;
  } else if (appState.client.name && appState.client.name.trim() !== '') {
    elements.docClientGreeting.textContent = `Sayın ${appState.client.name.trim()} Yetkilisi ;`;
  } else {
    elements.docClientGreeting.textContent = 'Sayın Yetkili ;';
  }
  
  // Meta Bar
  elements.docQuoteNo.textContent = appState.quote.no || '-';
  elements.docQuoteDate.textContent = formatDateTr(appState.quote.date);
  elements.docSalesRep.textContent = appState.quote.salesRep || 'Satış Temsilcisi';
  elements.docQuoteSubject.textContent = appState.quote.subject || '-';
  
  // Table
  elements.docTableBody.innerHTML = '';
  const imgHeader = document.querySelector('.col-image-header');
  if (imgHeader) imgHeader.style.display = appState.options.showImages ? '' : 'none';
  
  const activeProds = appState.products.filter(p => p.enabled && p.qty > 0);
  activeProds.forEach(p => {
    const tr = document.createElement('tr');
    const lineTotal = (Number(p.qty) || 0) * (Number(p.price) || 0);
    
    let imgCol = '';
    if (appState.options.showImages) {
      imgCol = `<td class="col-img"><img src="${p.image}" alt="${p.name}"></td>`;
    }
    
    tr.innerHTML = `
      <td class="col-code">${p.code}</td>
      <td class="col-desc">${p.name}</td>
      ${imgCol}
      <td class="col-qty">${p.qty}</td>
      <td class="col-unit">${p.unit}</td>
      <td class="col-price">${formatNumber(p.price)} ₺</td>
      <td class="col-total">${formatNumber(lineTotal)} ₺</td>
    `;
    elements.docTableBody.appendChild(tr);
  });
  
  // Terms
  elements.docTermsList.innerHTML = '';
  appState.terms.forEach(term => {
    if (term.trim()) {
      const li = document.createElement('li');
      li.textContent = term;
      elements.docTermsList.appendChild(li);
    }
  });
  
  // Financials in Doc
  elements.docTotalGross.textContent = `${formatNumber(fin.grossTotal)} ₺`;
  elements.docDiscountRate.textContent = fin.discountPercent;
  elements.docDiscountVal.textContent = fin.discountPercent > 0 ? `-${formatNumber(fin.discountAmount)} ₺` : '0,00 ₺';
  elements.docNetTotal.textContent = `${formatNumber(fin.netSubtotal)} ₺`;
  elements.docVatRate.textContent = fin.vatRate;
  elements.docVatVal.textContent = `${formatNumber(fin.vatAmount)} ₺`;
  elements.docGrandTotal.textContent = `${formatNumber(fin.grandTotal)} ₺`;
  
  // Left Panel Financials
  elements.sumSubtotal.textContent = formatCurrency(fin.grossTotal);
  elements.sumDiscountPct.textContent = fin.discountPercent;
  elements.sumDiscountVal.textContent = `- ${formatCurrency(fin.discountAmount)}`;
  elements.sumVatVal.textContent = formatCurrency(fin.vatAmount);
  elements.sumGrandTotal.textContent = formatCurrency(fin.grandTotal);
  elements.sumInWords.textContent = `Yazıyla: ${numberToTurkishWords(fin.grandTotal)}`;
  
  // Signature Toggle
  elements.docFooterSection.style.display = appState.options.showSignature ? 'flex' : 'none';
}

// Auto-Fit Zoom: Fits entire A4 sheet inside right container with ZERO scrolling!
let manualZoom = null;
function autoFitA4() {
  const container = elements.a4Viewport;
  if (!container) return;
  
  if (manualZoom !== null) {
    elements.previewWrapper.style.transform = `scale(${manualZoom / 100})`;
    elements.zoomLevelText.textContent = `${manualZoom}%`;
    return;
  }
  
  const containerW = container.clientWidth - 24;
  const containerH = container.clientHeight - 55;
  
  // A4 dimensions in px approx (210mm x 297mm at standard ratio 1 : 1.414)
  const a4W = 794;
  const a4H = 1123;
  
  const scaleW = containerW / a4W;
  const scaleH = containerH / a4H;
  const scale = Math.min(scaleW, scaleH);
  
  const zoomPct = Math.floor(scale * 100);
  elements.previewWrapper.style.transform = `scale(${scale})`;
  elements.zoomLevelText.textContent = `${zoomPct}%`;
}

// Window resize auto adjusts fit
window.addEventListener('resize', autoFitA4);

// Input Handlers
elements.clientName.addEventListener('input', (e) => { appState.client.name = e.target.value; updatePreview(); });
elements.clientContact.addEventListener('input', (e) => { appState.client.contact = e.target.value; updatePreview(); });
elements.clientPhone.addEventListener('input', (e) => { appState.client.phone = e.target.value; updatePreview(); });
elements.clientAddress.addEventListener('input', (e) => { appState.client.address = e.target.value; updatePreview(); });
elements.quoteNo.addEventListener('input', (e) => { appState.quote.no = e.target.value; updatePreview(); });
elements.quoteDate.addEventListener('input', (e) => { appState.quote.date = e.target.value; updatePreview(); });

// Discount Handling
function setDiscount(pct) {
  const val = Math.max(0, Math.min(100, parseFloat(pct) || 0));
  appState.discountPercent = val;
  elements.discountPercentInput.value = val;
  
  elements.presetChips.forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.percent) === val);
  });
  
  updatePreview();
}

elements.discountPercentInput.addEventListener('input', (e) => {
  setDiscount(e.target.value);
});

elements.presetChips.forEach(chip => {
  chip.addEventListener('click', () => {
    setDiscount(chip.dataset.percent);
  });
});

// VAT Status
elements.vatStatus.addEventListener('change', (e) => {
  appState.vatStatus = e.target.value;
  if (appState.vatStatus === 'inclusive') {
    appState.terms[1] = 'Fiyatlara KDV DAHİLDİR.';
  } else if (appState.vatStatus === 'exclusive') {
    appState.terms[1] = 'KDV HARİÇ fiyatlardır.';
  } else {
    appState.terms[1] = 'KDV’den muaftır.';
  }
  updatePreview();
});

// Table Delegated Events
elements.productTableRows.addEventListener('change', (e) => {
  const target = e.target;
  if (target.classList.contains('prod-toggle')) {
    const id = target.dataset.id;
    const prod = appState.products.find(p => p.id === id);
    if (prod) {
      prod.enabled = target.checked;
      renderProductTable();
      updatePreview();
    }
  }
});

elements.productTableRows.addEventListener('input', (e) => {
  const target = e.target;
  const id = target.dataset.id;
  const prod = appState.products.find(p => p.id === id);
  if (!prod) return;
  
  if (target.classList.contains('qty-val')) {
    prod.qty = Math.max(0, parseInt(target.value, 10) || 0);
    renderProductTable();
    updatePreview();
  } else if (target.classList.contains('prod-price-input')) {
    prod.price = Math.max(0, parseFloat(target.value) || 0);
    renderProductTable();
    updatePreview();
  }
});

elements.productTableRows.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  const prod = appState.products.find(p => p.id === id);
  if (!prod) return;
  
  if (action === 'inc') {
    prod.qty += 1;
    prod.enabled = true;
  } else if (action === 'dec') {
    if (prod.qty > 1) {
      prod.qty -= 1;
    } else {
      prod.qty = 0;
      prod.enabled = false;
    }
  }
  renderProductTable();
  updatePreview();
});

// Toggles
elements.toggleShowImages.addEventListener('change', (e) => {
  appState.options.showImages = e.target.checked;
  updatePreview();
});

elements.toggleShowSignature.addEventListener('change', (e) => {
  appState.options.showSignature = e.target.checked;
  updatePreview();
});

// Zoom Controls
elements.zoomIn.addEventListener('click', () => {
  manualZoom = (manualZoom || 60) + 5;
  autoFitA4();
});

elements.zoomOut.addEventListener('click', () => {
  manualZoom = Math.max(30, (manualZoom || 60) - 5);
  autoFitA4();
});

elements.zoomFit.addEventListener('click', () => {
  manualZoom = null;
  autoFitA4();
});

// Terms Modal
function renderTermsList() {
  elements.termsListContainer.innerHTML = '';
  appState.terms.forEach((t, i) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '6px';
    row.style.alignItems = 'center';
    row.innerHTML = `
      <span style="font-size: 11px; color: var(--text-muted); min-width: 16px;">${i + 1}.</span>
      <input type="text" class="form-input term-input" data-index="${i}" value="${t}">
      <button class="btn btn-secondary btn-icon btn-sm" data-action="del-term" data-index="${i}">✕</button>
    `;
    elements.termsListContainer.appendChild(row);
  });
}

elements.btnEditTerms.addEventListener('click', () => {
  renderTermsList();
  elements.termsModal.classList.add('active');
});

elements.termsModalClose.addEventListener('click', () => {
  elements.termsModal.classList.remove('active');
});

elements.termsListContainer.addEventListener('input', (e) => {
  if (e.target.classList.contains('term-input')) {
    const idx = Number(e.target.dataset.index);
    appState.terms[idx] = e.target.value;
    updatePreview();
  }
});

elements.termsListContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="del-term"]');
  if (!btn) return;
  const idx = Number(btn.dataset.index);
  appState.terms.splice(idx, 1);
  renderTermsList();
  updatePreview();
});

elements.btnAddTerm.addEventListener('click', () => {
  appState.terms.push('Yeni teklif şartı');
  renderTermsList();
  updatePreview();
});

// PDF Generation
function downloadPdf() {
  showToast('PDF hazırlanıyor, lütfen bekleyin...', 'info');
  
  const originalTransform = elements.previewWrapper.style.transform;
  elements.previewWrapper.style.transform = 'none';
  
  const quoteNoClean = (appState.quote.no || 'OZ-Teklif').replace(/[/\\?%*:|"<>]/g, '-');
  const clientNameClean = (appState.client.name || '').replace(/[/\\?%*:|"<>]/g, '-');
  const filename = `${quoteNoClean}_${clientNameClean || 'Musteri'}.pdf`;
  
  const opt = {
    margin: [6, 10, 6, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };
  
  html2pdf().set(opt).from(elements.a4Document).save().then(() => {
    elements.previewWrapper.style.transform = originalTransform;
    showToast(`PDF İndirildi: ${filename}`, 'success');
  }).catch(err => {
    elements.previewWrapper.style.transform = originalTransform;
    console.error('PDF error:', err);
    showToast('Hata oluştu, Yazdır butonunu deneyin.', 'error');
  });
}

elements.btnDownloadPdf.addEventListener('click', downloadPdf);
elements.btnQuickPdf.addEventListener('click', downloadPdf);
elements.btnPrint.addEventListener('click', () => window.print());

// Excel Export
elements.btnExportExcel.addEventListener('click', () => {
  if (typeof XLSX === 'undefined') return;
  const fin = calculateFinancials();
  
  const wsData = [
    ['', '', 'Kişi Kurum adı      :', appState.client.name],
    ['', '', 'Tel & Fax                  :', appState.client.phone],
    ['', '', 'Adres                         :', appState.client.address],
    ['', '', 'Teklif No', appState.quote.no, 'Teklif Tarihi', formatDateTr(appState.quote.date)],
    ['', '', 'Konu                 :', appState.quote.subject],
    ['', '', 'Sayın Yetkili ;'],
    ['', '', 'Firmanız / Sizin için hazırlamış olduğumuz teklif aşağıda bilgilerinize sunulmuştur.'],
    ['', '', 'Ürün Kodu', 'Ürün Açıklaması', 'Miktar', 'Birim', 'Birim Fiyat', 'Tutar']
  ];
  
  const activeProds = appState.products.filter(p => p.enabled && p.qty > 0);
  activeProds.forEach(p => {
    wsData.push(['', '', p.code, p.name, p.qty, p.unit, p.price, p.qty * p.price]);
  });
  
  wsData.push(['', '', '', '', '', '', 'Toplam', fin.grossTotal]);
  wsData.push(['', '', '', '', '', '', `İskonto % ${fin.discountPercent}`, fin.discountAmount]);
  wsData.push(['', '', '', '', '', '', 'Tutar', fin.netSubtotal]);
  wsData.push(['', '', '', '', '', '', `Kdv (%${fin.vatRate})`, fin.vatAmount]);
  wsData.push(['', '', '', '', '', '', 'Toplam Tutar', fin.grandTotal]);
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Teklif');
  XLSX.writeFile(wb, `${appState.quote.no || 'OZ-Teklif'}.xlsx`);
  showToast('Excel dosyası indirildi.', 'success');
});

// Storage Save & History
elements.btnSaveQuote.addEventListener('click', () => {
  const quotes = JSON.parse(localStorage.getItem('oz_saved_quotes') || '[]');
  const existingIdx = quotes.findIndex(q => q.quote.no === appState.quote.no);
  const item = { ...appState, savedAt: new Date().toISOString() };
  
  if (existingIdx >= 0) {
    quotes[existingIdx] = item;
    showToast(`Teklif "${appState.quote.no}" güncellendi.`, 'success');
  } else {
    quotes.unshift(item);
    showToast(`Teklif "${appState.quote.no}" kaydedildi.`, 'success');
  }
  localStorage.setItem('oz_saved_quotes', JSON.stringify(quotes));
});

function renderHistory(filter = '') {
  elements.historyListContainer.innerHTML = '';
  const quotes = JSON.parse(localStorage.getItem('oz_saved_quotes') || '[]');
  const filtered = quotes.filter(q => `${q.quote.no} ${q.client.name}`.toLowerCase().includes(filter.toLowerCase()));
  
  if (filtered.length === 0) {
    elements.historyListContainer.innerHTML = '<div style="text-align:center; padding:15px; color:#999;">Kayıt bulunamadı.</div>';
    return;
  }
  
  filtered.forEach(q => {
    const fin = q.products ? q.products.filter(p=>p.enabled).reduce((acc,p)=>acc+(p.qty*p.price),0) : 0;
    const card = document.createElement('div');
    card.style.background = '#f9fafb';
    card.style.border = '1px solid #e5e7eb';
    card.style.borderRadius = '6px';
    card.style.padding = '8px 12px';
    card.style.display = 'flex';
    card.style.justifyContent = 'space-between';
    card.style.alignItems = 'center';
    
    card.innerHTML = `
      <div>
        <strong style="color: var(--primary-dark); font-size: 13px;">${q.quote.no} - ${q.client.name || 'İsimsiz'}</strong>
        <div style="font-size: 11px; color: #666;">${formatDateTr(q.quote.date)} | ${formatCurrency(fin)}</div>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-secondary btn-sm" data-action="load-quote" data-no="${q.quote.no}">Yükle</button>
        <button class="btn btn-secondary btn-sm" data-action="del-quote" data-no="${q.quote.no}">Sil</button>
      </div>
    `;
    elements.historyListContainer.appendChild(card);
  });
}

elements.btnOpenHistory.addEventListener('click', () => {
  renderHistory();
  elements.historyModal.classList.add('active');
});

elements.historyModalClose.addEventListener('click', () => {
  elements.historyModal.classList.remove('active');
});

elements.historySearch.addEventListener('input', (e) => {
  renderHistory(e.target.value);
});

elements.historyListContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const no = btn.dataset.no;
  if (btn.dataset.action === 'load-quote') {
    const quotes = JSON.parse(localStorage.getItem('oz_saved_quotes') || '[]');
    const q = quotes.find(i => i.quote.no === no);
    if (q) {
      appState = JSON.parse(JSON.stringify(q));
      initState();
      elements.historyModal.classList.remove('active');
      showToast(`Teklif "${no}" yüklendi.`, 'success');
    }
  } else if (btn.dataset.action === 'del-quote') {
    let quotes = JSON.parse(localStorage.getItem('oz_saved_quotes') || '[]');
    quotes = quotes.filter(i => i.quote.no !== no);
    localStorage.setItem('oz_saved_quotes', JSON.stringify(quotes));
    renderHistory(elements.historySearch.value);
    showToast('Silindi.');
  }
});

// New Quote
elements.btnNewQuote.addEventListener('click', () => {
  const cur = appState.quote.no;
  let next = 1;
  const match = cur.match(/OZ-(\d{4})-(\d+)/);
  if (match) next = parseInt(match[2], 10) + 1;
  
  appState = JSON.parse(JSON.stringify(defaultState));
  appState.quote.no = `OZ-2026-${String(next).padStart(3, '0')}`;
  initState();
  showToast(`Yeni Teklif: ${appState.quote.no}`, 'success');
});

// Modal close on outside click
window.addEventListener('click', (e) => {
  if (e.target === elements.termsModal) elements.termsModal.classList.remove('active');
  if (e.target === elements.historyModal) elements.historyModal.classList.remove('active');
});

// Parse URL Query Parameters (Integration with website form)
function parseQueryParams() {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;
  
  if (params.get('name')) appState.client.name = params.get('name');
  if (params.get('contact')) appState.client.contact = params.get('contact');
  if (params.get('phone')) appState.client.phone = params.get('phone');
  if (params.get('address')) appState.client.address = params.get('address');
  if (params.get('quoteNo')) appState.quote.no = params.get('quoteNo');
  
  if (params.get('discount')) {
    const d = parseFloat(params.get('discount'));
    if (!isNaN(d)) appState.discountPercent = d;
  }
  
  if (params.get('vatStatus')) {
    appState.vatStatus = params.get('vatStatus');
  }
  
  // Format: products=OZ1001:2,OZ1003:1 or products=OZ1001,OZ1003
  const prodsParam = params.get('products');
  if (prodsParam) {
    const requested = {};
    prodsParam.split(',').forEach(item => {
      const parts = item.split(':');
      const code = parts[0].trim().toUpperCase();
      const qty = parts.length > 1 ? parseInt(parts[1], 10) || 1 : 1;
      requested[code] = qty;
    });
    
    appState.products.forEach(p => {
      if (requested[p.code.toUpperCase()] !== undefined) {
        p.enabled = true;
        p.qty = requested[p.code.toUpperCase()];
      } else {
        p.enabled = false;
      }
    });
  }
}

// Initialize
function initState() {
  parseQueryParams();
  
  elements.clientName.value = appState.client.name;
  elements.clientContact.value = appState.client.contact;
  elements.clientPhone.value = appState.client.phone;
  elements.clientAddress.value = appState.client.address;
  elements.quoteNo.value = appState.quote.no;
  elements.quoteDate.value = appState.quote.date;
  
  elements.discountPercentInput.value = appState.discountPercent;
  elements.presetChips.forEach(chip => {
    chip.classList.toggle('active', Number(chip.dataset.percent) === Number(appState.discountPercent));
  });
  
  elements.vatStatus.value = appState.vatStatus;
  elements.toggleShowImages.checked = appState.options.showImages;
  elements.toggleShowSignature.checked = appState.options.showSignature;
  
  renderProductTable();
  updatePreview();
  setTimeout(autoFitA4, 100);
}

initState();
