const fs = require("fs");
const login = require("ryuu-fca-api");
const axios = require("axios");

// กำหนดคำนำหน้าเริ่มต้น
const prefix = "/";

// ลิงก์ Firebase Database
const firebaseURL = "https://goak-71ac8-default-rtdb.firebaseio.com/";

// โหลดคำสั่งจากโฟลเดอร์ "commands"
const commands = {};
fs.readdirSync("./commands").forEach(file => {
    if (file.endsWith(".js")) {
        const command = require(`./commands/${file}`);
        commands[command.config.name] = command;
    }
});

// ฟังก์ชันตรวจสอบว่าผู้ใช้ลงทะเบียนแล้วหรือไม่
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

    console.log(`เข้าสู่ระบบสำเร็จ! คำนำหน้าคำสั่งคือ "${prefix}"`);
    api.setOptions({ listenEvents: true });

    api.listenMqtt(async (err, event) => {
        if (err) {
            console.error("เกิดข้อผิดพลาดในการฟัง:", err);
            return;
        }

        if (event.type === "message") {
            const userID = event.senderID;
            const message = event.body;

            if (!message.startsWith(prefix)) return;

            const args = message.slice(prefix.length).trim().split(" ");
            const commandName = args.shift().toLowerCase();

            const command = commands[commandName];
            if (command) {
                try {
                    const user = await isRegistered(userID);
                    if (!user && commandName !== "ลงทะเบียน") {
                        api.sendMessage("กรุณาลงทะเบียนก่อน เพื่อใช้งานบอท!", event.threadID, event.messageID);
                        return;
                    }

                    await command.run({ api, event, args, user });
                } catch (error) {
                    console.error("เกิดข้อผิดพลาดในคำสั่ง:", error);
                }
            } else {
                api.sendMessage(`ไม่มีคำสั่ง "${commandName}" ในระบบ`, event.threadID, event.messageID);
            }
        }
    });
});
