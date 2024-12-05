const axios = require("axios");

module.exports.config = {
    name: "ลงทะเบียน",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "YourName",
    description: "คำสั่งสำหรับลงทะเบียนผู้ใช้",
    commandCategory: "ทั่วไป",
    usages: "",
    cooldowns: 0
};

module.exports.run = async function({ api, event }) {
    const userID = event.senderID;
    const userName = event.senderName;

    try {
        const response = await axios.get(`https://goak-71ac8-default-rtdb.firebaseio.com/sosy/${userID}.json`);
        if (response.data) {
            api.sendMessage("⚠️ คุณได้ลงทะเบียนแล้ว! 🎉\nไม่ต้องลงทะเบียนซ้ำอีก", event.threadID, event.messageID);
            return;
        }

        await axios.put(`https://goak-71ac8-default-rtdb.firebaseio.com/sosy/${userID}.json`, {
            name: userName,
            timestamp: new Date().toISOString(),
        });

        api.sendMessage(`
        🎉 **ยินดีต้อนรับ** คุณ ${userName}! 🎉
        📜 คุณได้ลงทะเบียนสำเร็จแล้ว! 📜

        ✅ ตอนนี้คุณสามารถใช้งานบอทได้แล้ว! 
        พิมพ์คำสั่ง **/ดูคำสั่ง** เพื่อดูคำสั่งทั้งหมด! 
        `, event.threadID, event.messageID);
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการลงทะเบียน:", error);
        api.sendMessage("❌ ไม่สามารถลงทะเบียนได้ โปรดลองอีกครั้ง", event.threadID, event.messageID);
    }
};
