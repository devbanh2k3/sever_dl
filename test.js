const axios = require('axios');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Tạo tệp PDF
const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('output.pdf'));
doc.text('Hello, this is your PDF content.');
doc.end();

// Gửi tệp PDF tới Telegram
const botToken = '6423723783:AAG5_PUVkQPfacplV6stUXTt3qRUktDj7ws';
const chatId = '919990497';

const fileStream = fs.createReadStream('output.pdf');
axios.post(`https://api.telegram.org/bot${botToken}/sendDocument`, {
    chat_id: chatId,
    document: fileStream,
    caption: 'Here is your PDF file.'
})
    .then(response => {
        console.log('PDF sent to Telegram:', response.data);
    })
    .catch(error => {
        console.error('Error sending PDF to Telegram:', error);
    });
