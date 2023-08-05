const axios = require('axios');
// Import module fs
const fs = require('fs');

// Tên tệp văn bản cần đọc
const fileName = 'data.txt';
var dataArray = null;
// Đọc tệp văn bản và xử lý nội dung thành mảng
fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
        console.error('Đã xảy ra lỗi khi đọc tệp:', err);
        return;
    }

    // Tách nội dung thành mảng dựa trên dòng (\n)
    dataArray = data.split('\n');
    console.log(dataArray);
});


async function getUserData() {
    try {
        const url = 'https://api.zalopay.vn/v2/account/phone/session';
        const headers = {
            'Host': 'api.zalopay.vn',
            'x-zalopay-id': '',
            'x-drsite': 'off',
            'x-user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ZaloPayClient/8.22.0 OS/15.7.1 Platform/ios Secured/true ZaloPayWebClient/8.22.0',
            'x-device-model': 'iPhone14,3',
            'x-access-token': '',
            'x-device-id': '5C7B9AEF-5C59-4923-BC0D-5E5F23F19DFA',
            'x-device-os': 'IOS',
            'x-os-version': '15.7.1',
            'x-density': 'iphone3x',
            'x-app-version': '8.22.0',
            'x-platform': 'NATIVE',
            'authorization': 'Bearer',
            'accept-language': 'vi-VN;q=1.0, en-VN;q=0.9',
            'x-user-id': '',
            'accept': '*/*',
            'content-type': 'application/json',
        };

        const requestBody = {
            encrypted_pin: '27e3a43703ce2b92f32e84a6a9adaf8b48c2c13e4d164fd88793b538221423fc',
            phone_number: '0386988020',
            phone_verified_token: '',
        };

        const response = await axios.post(url, requestBody, { headers });
        const userData = response.data;
        return userData;
    } catch (error) {
        if (error.response) {
            console.log(`Lỗi yêu cầu HTTP: ${error.response.data}`);
        } else if (error.request) {
            console.log(`Không có phản hồi từ server: ${error.request}`);
        } else {
            console.log(`Lỗi không xác định: ${error.message}`);
        }
        return null;
    }
}

async function check(access_token, MKH, user_id, index, zalo_id) {
    try {
        const url = 'https://zlp-bill-core-api.zalopay.vn/cpscore/app/getbillinfo';
        const headers = {
            'Cookie': `X-DRSITE=off; zalo_id=${zalo_id}; zlp_token=${access_token}; has_device_id=0`,
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/x-www-form-urlencoded',
            'origin': 'https://social.zalopay.vn',
            'accept-language': 'vi-VN,vi;q=0.9',
        };

        const requestBody = `reqdate=${Date.now()}&data=%7B%22zlpcustomercode%22%3A%22%22%2C%22zalopayid%22%3A%22${user_id}%22%2C%22customercode%22%3A%22${MKH}%22%2C%22appid%22%3A17%7D`;

        const response = await axios.post(url, requestBody, { headers });
        const userData = response.data;

        const dataPull = {};
        if (userData.subcode === 1 || userData.subcode === -700) {
            const sideBar = response.data.totalamount;
            const nameUser = response.data.customername;
            const noky = response.data['Nợ kỳ'];

            dataPull.sotien = sideBar;
            dataPull.thoigian = noky;
            dataPull.tenkhachhang = nameUser;
        }

        console.log(response.data);

        // Đoạn code bên dưới làm việc với dữ liệu lấy được từ API
        // Vì không có đủ thông tin về DataCheck và DataPull nên mình không thể chạy thử đoạn này
        // Hãy chắc chắn rằng dữ liệu trả về từ API đúng với định dạng của DataCheck và DataPull

        // listView1.Items[index].SubItems[2].Text = dataPull.sotien;
        // listView1.Items[index].SubItems[3].Text = dataPull.thoigian;
        // listView1.Items[index].SubItems[4].Text = userData.returnmessage;
        // listView1.Items[index].SubItems[5].Text = dataPull.tenkhachhang;

    } catch (error) {
        if (error.response) {
            console.log(`Lỗi yêu cầu HTTP: ${error.response.data}`);
        } else {
            console.log(`Lỗi không xác định: ${error.message}`);
        }
    }
}

// Gọi hàm check với tham số tương ứng
// Ví dụ: check('your_access_token', 'your_MKH', 'your_user_id', 0, 'your_zalo_id');

getUserData()
    .then((userData) => {
        dataArray.forEach((element) => {
            test = check(userData.data.access_token, element, userData.data.user_id, 0, userData.data.zalo_id);
            console.log(test);
        });

    })
    .catch((error) => {
        console.log(`Lỗi khi lấy dữ liệu: ${error.message}`);
    });
