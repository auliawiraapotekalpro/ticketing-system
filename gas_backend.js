
/**
 * GOOGLE APPS SCRIPT BACKEND FOR CEILING LEAK TICKETING
 */

const SS_ID = '1TaE7nZ7WOyC8nIDpyx9CXO1LsdC26Wlzqr84XhMdNJ8'; 
const MAIN_DRIVE_FOLDER_ID = '1VILFbKdKh46tJIZQ5JNqO3Oi16cKIe0E';

function doGet(e) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const action = e.parameter.action;
  
  if (action === 'getUsers') {
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const users = data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    return ContentService.createTextOutput(JSON.stringify(users)).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = ss.getSheetByName('Tickets');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  const headers = data.shift();
  const result = data.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      let val = row[i];
      if (h === 'photos') { try { val = JSON.parse(val); } catch(e) { val = []; } }
      obj[h] = val;
    });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Tickets');
  const postData = JSON.parse(e.postData.contents);
  const action = postData.action;

  if (action === 'create') {
    const d = postData.data;
    const photoUrls = [];
    if (d.photos && d.photos.length > 0) {
      try {
        const mainFolder = DriveApp.getFolderById(MAIN_DRIVE_FOLDER_ID);
        let storeFolder;
        const folders = mainFolder.getFoldersByName(d.storeName);
        if (folders.hasNext()) { storeFolder = folders.next(); } 
        else { storeFolder = mainFolder.createFolder(d.storeName); }
        
        d.photos.forEach((base64Data, index) => {
          const parts = base64Data.split(',');
          const contentType = parts[0].split(':')[1].split(';')[0];
          const bytes = Utilities.base64Decode(parts[1]);
          const blob = Utilities.newBlob(bytes, contentType, d.id + "_" + (index + 1) + ".jpg");
          const file = storeFolder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          photoUrls.push(file.getUrl());
        });
      } catch (err) {
        Logger.log("Drive Error: " + err.message);
      }
    }
    
    const ticketRow = [d.id, 'PENDING', d.storeName, d.reportDate, d.problemIndicator, d.riskLevel || 'LOW', d.businessImpact || '', d.recommendation || '', JSON.stringify(photoUrls), d.createdAt, '', '', '', '', ''];
    sheet.appendRow(ticketRow);
    
    const fullData = {
      id: d.id,
      storeName: d.storeName,
      reportDate: d.reportDate,
      indicator: d.problemIndicator,
      riskLevel: d.riskLevel || 'LOW',
      businessImpact: d.businessImpact || 'Belum dianalisa',
      recommendation: d.recommendation || 'Belum ditentukan',
      photos: photoUrls
    };
    sendDetailedEmail("LAPORAN_BARU", fullData);
  } 
  else if (action === 'update') {
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === postData.id) {
        const u = postData.updates;
        const row = i + 1;
        
        if (postData.isFinished) {
          sheet.getRange(row, 2).setValue('FINISHED');
          sheet.getRange(row, 15).setValue(new Date().toLocaleDateString('id-ID'));
        } else {
          sheet.getRange(row, 2).setValue('PLANNED');
          sheet.getRange(row, 6).setValue(u.riskLevel || 'MEDIUM');
          sheet.getRange(row, 7).setValue(u.businessImpact || '');
          sheet.getRange(row, 8).setValue(u.recommendation || '');
          sheet.getRange(row, 11).setValue(u.department || '');
          sheet.getRange(row, 12).setValue(u.picName || '');
          sheet.getRange(row, 13).setValue(u.plannedDate || '');
          sheet.getRange(row, 14).setValue(u.targetEndDate || '');
        }

        const updatedRow = sheet.getRange(row, 1, 1, 15).getValues()[0];
        let photos = [];
        try { photos = JSON.parse(updatedRow[8]); } catch(e) {}
        
        const fullData = {
          id: updatedRow[0],
          storeName: updatedRow[2],
          reportDate: updatedRow[3],
          indicator: updatedRow[4],
          riskLevel: updatedRow[5],
          businessImpact: updatedRow[6],
          recommendation: updatedRow[7],
          photos: photos
        };

        sendDetailedEmail(postData.isFinished ? "SELESAI" : "RENCANA", fullData);
        break;
      }
    }
  }
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.JSON);
}

function checkOverdueTickets() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName('Tickets');
  const data = sheet.getDataRange().getValues();
  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === 'PENDING' && (now - data[i][9] > threeDays)) {
      let photos = [];
      try { photos = JSON.parse(data[i][8]); } catch(e) {}
      
      const fullData = {
        id: data[i][0],
        storeName: data[i][2],
        reportDate: data[i][3],
        indicator: data[i][4],
        riskLevel: data[i][5],
        businessImpact: data[i][6] || 'Belum dianalisa',
        recommendation: data[i][7] || 'Belum ditentukan',
        photos: photos
      };
      sendDetailedEmail("REMINDER", fullData);
    }
  }
}

function sendDetailedEmail(type, t) {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const userSheet = ss.getSheetByName('Users');
    const userData = userSheet.getDataRange().getValues();
    
    let outletEmail = "";
    let adminEmails = [];
    const targetStore = String(t.storeName).trim().toUpperCase();
    
    for (let i = 1; i < userData.length; i++) {
      const rowId = String(userData[i][0]).trim().toUpperCase();
      const rowRole = String(userData[i][2]).trim().toUpperCase();
      const rowEmail = String(userData[i][3]).trim();
      if (!rowEmail || !rowEmail.includes("@")) continue;
      if (rowId === targetStore) outletEmail = rowEmail;
      if (rowRole === "ADMIN") {
        if (!adminEmails.includes(rowEmail)) adminEmails.push(rowEmail);
      }
    }

    let recipients = [];
    if (outletEmail) recipients.push(outletEmail);
    adminEmails.forEach(email => { if (!recipients.includes(email)) recipients.push(email); });

    if (recipients.length === 0) return;

    let titlePrefix = "";
    let messageHeader = "";
    
    if (type === "LAPORAN_BARU") {
      titlePrefix = "[TIKET BARU]";
      messageHeader = "Halo Tim Maintenance, terdapat laporan perbaikan plafon baru yang perlu segera ditinjau.";
    } else if (type === "RENCANA") {
      titlePrefix = "[RENCANA UPDATE]";
      messageHeader = "Halo Tim Outlet, jadwal dan rencana pengerjaan untuk tiket Anda telah diperbarui oleh Admin.";
    } else if (type === "SELESAI") {
      titlePrefix = "[PEKERJAAN SELESAI]";
      messageHeader = "Kabar baik! Pekerjaan perbaikan plafon telah selesai dilaksanakan dan tiket kini ditutup.";
    } else if (type === "REMINDER") {
      titlePrefix = "[REMINDER 3 HARI]";
      messageHeader = "Peringatan: Tiket berikut sudah melampaui 3 hari tanpa ada rencana pengerjaan.";
    }

    // Menggunakan pemisah standar agar tidak pecah
    const subject = `${titlePrefix} | ID: ${t.id} | TOKO: ${t.storeName}`;
    
    let photosList = t.photos && t.photos.length > 0 
      ? t.photos.map((url, i) => `   [>] Foto ${i+1}: ${url}`).join("\n")
      : "   [x] (Tidak ada foto yang diunggah)";

    const body = `Yth. Rekan Tim,

${messageHeader}

==================================================
DETAIL LAPORAN PELAPORAN
==================================================

* Nama Toko      : ${t.storeName}
* ID Tiket       : ${t.id}
* Tanggal Lapor  : ${t.reportDate}
* Indikator      : 
  > ${t.indicator}
* Level Resiko   : ${t.riskLevel}
* Dampak Bisnis  : 
  > ${t.businessImpact}
* Rekomendasi    : 
  > ${t.recommendation}

==================================================
BUKTI FOTO DOKUMENTASI
==================================================
${photosList}

Mohon dapat segera dikoordinasikan lebih lanjut. Terima kasih atas kerja samanya.

--------------------------------------------------
DASHBOARD PELAPORAN KEBOCORAN PLAFON
Sistem Notifikasi Otomatis
--------------------------------------------------`;

    GmailApp.sendEmail(recipients.join(","), subject, body);
    
  } catch (err) {
    Logger.log("Email Error: " + err.message);
  }
}
