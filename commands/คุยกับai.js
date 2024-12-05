const axios = require("axios");

module.exports.config = {
    name: "คุยกับai",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "YourName",
    description: "คุยกับ AI ผ่าน API",
    commandCategory: "AI",
    usages: "<คำถาม>",
    cooldowns: 0
};

module.exports.run = async function({ api, event, args }) {
    if (args.length === 0) {
        api.sendMessage("กรุณาระบุคำถาม เช่น /คุยกับai สวัสดี", event.threadID, event.messageID);
        return;
    }

    const question = args.join(" "); // รวมคำถามจากผู้ใช้

    try {
        const response = await axios.get(`https://api.kenliejugarap.com/freegpt-openai/?question=${encodeURIComponent(question)}`);
        const data = response.data;

        if (data.status) {
            api.sendMessage(`AI ตอบว่า:\n${data.response}`, event.threadID, event.messageID);
        } else {
            api.sendMessage("เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง", event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        api.sendMessage("ไม่สามารถเชื่อมต่อกับ AI ได้ กรุณาลองใหม่อีกครั้ง", event.threadID, event.messageID);
    }
};
