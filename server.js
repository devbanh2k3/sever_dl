const express = require('express');
const axios = require('axios');
const fs = require('fs');
var cors = require('cors');
const { da } = require('date-fns/locale');

const app = express();
app.use(express.json());

app.use(cors());
// Your check function here (as shown in the previous response)
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
const fileName = 'data.txt';
var dataArray = null;
// Đọc tệp văn bản và xử lý nội dung thành mảng
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
        const userData = response.data.data;
        const dataPull = {};
        //console.log(response)
        try {
            var jsondata = JSON.parse(userData)
            if (response.data.subcode === 1 || response.data.subcode === -700) {
                const sideBar = jsondata.totalamount;
                const nameUser = jsondata.customername;
                const noky = response.data['Nợ kỳ'] || null;

                dataPull.makhachhang = MKH;
                dataPull.sotien = sideBar;
                dataPull.thoigian = noky;
                dataPull.tenkhachhang = nameUser;
                dataPull.status = response.data.returnmessage;
                // console.log("helo", sideBar)
            }
            else {
                const sideBar = null;
                const nameUser = null;
                const noky = null;

                dataPull.makhachhang = MKH;
                dataPull.sotien = sideBar;
                dataPull.thoigian = noky;
                dataPull.tenkhachhang = nameUser;
                dataPull.status = response.data.returnmessage;
                // console.log("helo", sideBar)
            }

        } catch {
            if (response.data.subcode === 1 || response.data.subcode === -700) {
                const sideBar = null;
                const nameUser = null;
                const noky = null;

                dataPull.makhachhang = MKH;
                dataPull.sotien = sideBar;
                dataPull.thoigian = noky;
                dataPull.tenkhachhang = nameUser;
                dataPull.status = response.data.returnmessage;
                // console.log("helo", sideBar)
            }
        }

        return dataPull;
    } catch (error) {
        if (error.response) {
            console.log(`Lỗi yêu cầu HTTP: ${error.response.data}`);
        } else {
            console.log(`Lỗi không xác định: ${error.message}`);
        }
        return null; // Return null in case of an error
    }
}


async function DataMomo(token, username, password) {
    const { format, startOfMonth, addDays, parseISO } = require('date-fns');

    const currentDate1 = new Date();
    const firstDayOfMonth = startOfMonth(currentDate1);

    const fromDate = format(firstDayOfMonth, "yyyy-MM-dd'T'HH:mm:ss.SS");

    const toDate = new Date();
    const dataPush = [];
    const dateList = [];
    let currentDate = parseISO(fromDate);
    console.log(currentDate)
    while (currentDate <= toDate) {
        const formattedDate = format(currentDate, "yyyy-MM-dd'T'HH:mm:ss.SS");
        dateList.push({ fromDate: formattedDate, toDate: formattedDate.replace('00:00:00.00', '23:59:59.00') });
        currentDate = addDays(currentDate, 1);
    }
    for (const dateRange of dateList) {
        const { fromDate, toDate } = dateRange;
        var data = await requestDataMomo(fromDate, toDate, token)
        data.time = fromDate
        data.username = username
        data.password = password
        dataPush.push(data)
    }
    return dataPush;

}
async function requestDataMomo(fromDate, toDate, token) {
    const url = 'https://business.momo.vn/api/transaction/v2/transactions/statistics';
    const params = {
        fromDate: fromDate,
        toDate: toDate,
        status: 'ALL',
        paymentMethod: 'ALL',
        merchantId: '1230738',
        language: 'vi'
    };

    const headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        'Authorization': 'Bearer ' + token, // Thay YOUR_ACCESS_TOKEN bằng access token thực tế
        'MerchantId': '1230738',
        'Connection': 'keep-alive'
        // Thêm các header khác từ curl của bạn (nếu cần)
    };

    try {
        const response = await axios.get(url, {
            params,
            headers
        });
        console.log(response.data)
        return response.data;
    } catch (error) {
        return error
    }
}

async function login(username, password) {
    const url = 'https://business.momo.vn/api/authentication/login?language=vi';
    const headers = {
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        // Thêm các header khác từ curl của bạn (nếu cần)
    };
    const data = {
        username: username,
        password: password
    };

    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
}
app.post('/get-data', async (req, res) => {
    const { username, password } = req.body;
    console.log('testx', username)
    try {
        // Thực hiện các bước xác thực, ví dụ: login để lấy token
        const result = await login(username, password);
        console.log('Login result:', result);

        // Sử dụng token để lấy dữ liệu từ DataMomo
        const data = await DataMomo(result.data.token, username, password);

        res.json(data);
    } catch (error) {
        console.error('Error getting data:', error);
        res.status(500).json({ error: 'Error getting data' });
    }
});


app.post('/api/getUserData', async (req, res) => {
    try {

        const userData = await getUserData();

        const dataArray = req.body.Arraydata;
        console.log(dataArray)
        // // Read data from the file synchronously
        // const fileName = 'data.txt';
        // const data = fs.readFileSync(fileName, 'utf8');

        // // Tách nội dung thành mảng dựa trên dòng (\n)
        // const dataArray = data.split('\n');

        const results = [];

        for (const element of dataArray) {
            //console.log("element:", element);
            const dataPull = await check(userData.data.access_token, element, userData.data.user_id, 0, userData.data.zalo_id);

            results.push(dataPull);
        }

        res.json(results);
    } catch (error) {
        console.log(`Lỗi khi lấy dữ liệu: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const port = 5000; // Choose a port number
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
