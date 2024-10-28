const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');
const originalSize = { width: 1214, height: 698 }; // 原始大小

function loadWindowSize() {
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath);
        return JSON.parse(data);
    }
    return originalSize; // 默认大小
}

function saveWindowSize(width, height) {
    const data = JSON.stringify({ width, height });
    fs.writeFileSync(configPath, data);
}

function setupResolution(mainWindow) {
    const { width, height } = loadWindowSize();
    mainWindow.setSize(width, height);

    ipcMain.on('set-window-size', (event, newWidth, newHeight) => {
        // 检查新大小是否大于等于原始大小
        if (newWidth >= originalSize.width && newHeight >= originalSize.height) {
            mainWindow.setSize(newWidth, newHeight);
            saveWindowSize(newWidth, newHeight);
        } else {
            event.sender.send('size-error', `宽度和高度必须大于或等于 ${originalSize.width} 和 ${originalSize.height}`);
        }
    });
}

module.exports = { setupResolution };
