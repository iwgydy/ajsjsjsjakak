const fs = require("fs");

module.exports.config = {
    name: "ดูคำสั่ง",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "YourName",
    description: "แสดงรายการคำสั่งทั้งหมด",
    commandCategory: "ทั่วไป",
    usages: "",
    cooldowns: 0
};

module.exports.run = async function({ api, event }) {
    try {
        // ดึงรายการไฟล์คำสั่งในโฟลเดอร์
        const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

        // เก็บข้อมูลคำสั่ง
        const commands = commandFiles.map(file => {
            const command = require(`./${file}`);
            return {
                name: command.config.name,
                description: command.config.description,
                category: command.config.commandCategory || "อื่นๆ",
                cost: command.config.cost || 0
            };
        });

        // จัดกลุ่มคำสั่งตามหมวดหมู่
        const groupedCommands = commands.reduce((groups, command) => {
            const category = command.category || "อื่นๆ";
            if (!groups[category]) groups[category] = [];
            groups[category].push(command);
            return groups;
        }, {});

        // สร้างข้อความแสดงผล
        let message = "✨ รายการคำสั่งทั้งหมด ✨\n";
        for (const [category, cmds] of Object.entries(groupedCommands)) {
            message += `\n📂 หมวดหมู่: ${category}\n`;
            cmds.forEach(cmd => {
                message += `  🔹 /${cmd.name} - ${cmd.description} (ใช้ ${cmd.cost} เครดิต)\n`;
            });
        }

        message += `\nℹ️ พิมพ์ "/<ชื่อคำสั่ง>" เพื่อใช้งานคำสั่งที่ต้องการ`;

        // ส่งข้อความกลับไป
        api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่ง:", error);
        api.sendMessage("ไม่สามารถแสดงรายการคำสั่งได้ กรุณาลองใหม่อีกครั้ง", event.threadID, event.messageID);
    }
};
