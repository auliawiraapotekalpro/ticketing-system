
/**
 * Mock email service to simulate sending notifications.
 * In a real-world scenario, this would call a backend API or a service like SendGrid/AWS SES.
 */
export const sendEmailNotification = (to: string, subject: string, body: string) => {
  console.log(`%c [EMAIL SENT] To: ${to}`, 'color: #3b82f6; font-weight: bold;');
  console.log(`%c Subject: ${subject}`, 'color: #1d4ed8;');
  console.log(`%c Body: ${body}`, 'color: #475569;');
};

export const notifyNewTicket = (storeName: string, reporterEmail: string) => {
  sendEmailNotification(reporterEmail, "Konfirmasi Laporan Kebocoran", `Laporan untuk ${storeName} telah kami terima.`);
  sendEmailNotification("admin@maintenance.com", "Tiket Baru: Kebocoran Plafon", `Ada laporan baru dari ${storeName}. Segera cek dashboard.`);
};

export const notifyTicketPlanned = (storeName: string, reporterEmail: string, pic: string) => {
  sendEmailNotification(reporterEmail, "Rencana Pengerjaan Update", `Laporan ${storeName} telah dijadwalkan dengan PIC ${pic}.`);
  sendEmailNotification("admin@maintenance.com", "Rencana Pengerjaan Berhasil Disimpan", `Jadwal pengerjaan untuk ${storeName} telah dikirim ke outlet.`);
};

export const notifyTicketFinished = (storeName: string, reporterEmail: string) => {
  sendEmailNotification(reporterEmail, "Pengerjaan Selesai", `Laporan kebocoran di ${storeName} telah dinyatakan selesai.`);
  sendEmailNotification("admin@maintenance.com", "Laporan Ditutup", `Pengerjaan ${storeName} telah selesai.`);
};

export const notifyReminder = (storeName: string) => {
  sendEmailNotification("admin@maintenance.com", "REMINDER: Tiket Belum Direspon", `Tiket ${storeName} sudah lebih dari 3 hari belum memiliki rencana pengerjaan.`);
};
