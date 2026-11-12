// Отправка писем. Без SMTP-настроек код выводится в консоль сервера.
let tx = null;
if (process.env.SMTP_HOST) {
  try {
    tx = require('nodemailer').createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } catch { console.warn('nodemailer не установлен — письма печатаются в консоль'); }
}
exports.sendMail = async (to, subject, text) => {
  if (tx) { await tx.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text }); return true; }
  console.log(`\n✉  Письмо для ${to}\n   ${subject}\n   ${text.replace(/\n/g, '\n   ')}\n`);
  return false;
};
