const fs = require("fs");
const axios = require("axios");
const login = require("ryuu-fca-api");

// ลิงก์ Firebase Database
const firebaseURL = "https://goak-71ac8-default-rtdb.firebaseio.com/";

// ฟังก์ชันตรวจสอบว่าผู้ใช้ลงทะเบียนแล้วหรือไม่ (สามารถลบออกได้ถ้าต้องการ)
async function isRegistered(userID) {
    try {
        const response = await axios.get(`${firebaseURL}sosy.json`);
        const users = response.data;
        return users && users[userID] ? users[userID] : null;
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Firebase:", error);
        return null;
    }
}

// ล็อกอินด้วย appState.json
login({ appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) }, (err, api) => {
    if (err) {
        console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", err);
        return;
    }

    console.log(`เข้าสู่ระบบสำเร็จ`);
    api.setOptions({ listenEvents: true });

    // ฟังเหตุการณ์จากกลุ่ม
    api.listenMqtt(async (err, event) => {
        if (err) {
            console.error("เกิดข้อผิดพลาดในการฟัง:", err);
            return;
        }

        if (event.type === "message") {
            const message = event.body;

            // ตรวจสอบว่ามีลิงก์อั่งเปาในข้อความหรือไม่
            const regex = /\?v=([a-zA-Z0-9]+)/;
            const matchResult = message.match(regex);

            if (matchResult && matchResult[1]) {
                const angpaoCode = matchResult[1];
                const phone = "0987654321"; // เบอร์โทรศัพท์ที่ใช้รับเงิน
                const apiUrl = `https://store.cyber-safe.pro/api/topup/truemoney/angpaofree/${angpaoCode}/${phone}`;

                try {
                    // เรียก API เติมเงิน
                    const response = await axios.get(apiUrl, { timeout: 10000 });

                    if (response.status === 200) {
                        // แสดงข้อมูลในคอนโซล
                        console.log(`✅ เติมเงินสำเร็จ! \n📌 จำนวนเงินจากอั่งเปา: ${angpaoCode}`);
                    } else {
                        // แสดงข้อมูลในคอนโซล
                        console.log(`❌ เติมเงินล้มเหลว: ${response.data}`);
                    }
                } catch (error) {
                    console.error("เกิดข้อผิดพลาดในการเติมเงิน:", error);
                    console.log("❌ เกิดข้อผิดพลาดในการเติมเงิน กรุณาลองใหม่อีกครั้ง");
                }
            }
        }
    });
});
