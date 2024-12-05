const fs = require("fs");

module.exports.config = {
    name: "ต้อนรับ",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "YourName",
    description: "ระบบต้อนรับสมาชิกใหม่พร้อมแสดงจำนวนสมาชิก",
    commandCategory: "กลุ่ม",
    usages: "อัตโนมัติ",
    cooldowns: 0
};

module.exports.run = async function({ api, event }) {
    if (event.logMessageType === "log:subscribe") {
        const addedUser = event.logMessageData.addedParticipants[0];
        const userName = addedUser.fullName || "สมาชิกใหม่";

        api.getThreadInfo(event.threadID, (err, info) => {
            if (err) return console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกลุ่ม:", err);

            const memberCount = info.participantIDs.length;

            const welcomeMessage = `
✨ สวัสดีครับ/ค่ะ คุณ *${userName}* ✨
🎉 ยินดีต้อนรับสู่กลุ่ม! 🎉

📌 ตอนนี้ในกลุ่มมีสมาชิกทั้งหมด: ${memberCount} คน
ขอให้สนุกและร่วมแชร์สิ่งดีๆ กันนะครับ/ค่ะ! 😊
            `;

            // แนบไฟล์ GIF
            const attachment = fs.createReadStream("./welcome.gif");
            api.sendMessage({ body: welcomeMessage, attachment }, event.threadID);
        });
    }
};
