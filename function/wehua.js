const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, 'config.json');
const originalSize = { width: 1214, height: 698 }; // 原始大小

function getPluginNameByPlatform(platform) {
    switch (platform) {
        case 'win32':
            return 'pepflashplayer.dll';
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
}

function setupFlashPlayer() {
    let pluginName = getPluginNameByPlatform(process.platform);
    let plugins = path.join(__dirname, '..', 'assert', pluginName);

    if (__dirname.includes('.asar')) {
        plugins = path.join(process.resourcesPath, pluginName);
    }

    return plugins;
}

// 加载窗口大小
function loadWindowSize() {
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath);
        return JSON.parse(data);
    }
    return originalSize; // 默认大小
}

// 保存窗口大小
function saveWindowSize(width, height) {
    const data = JSON.stringify({ width, height });
    fs.writeFileSync(configPath, data);
}

let sizeWindow; // 将次级窗口声明为全局变量

function createSizeInputWindow(mainWindow) {
    if (sizeWindow && !sizeWindow.isDestroyed()) {
        sizeWindow.focus(); // 如果窗口已经存在，则聚焦
        return;
    }

    sizeWindow = new BrowserWindow({
        width: 330, // 设置次级窗口宽度
        height: 220, // 设置次级窗口高度
        modal: true,
        parent: mainWindow,
        resizable: false, // 禁止改变窗口大小
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    sizeWindow.loadFile(path.join(__dirname, 'resolution.html'));

    ipcMain.on('set-window-size', (event, newWidth, newHeight) => {
        // 检查新大小是否大于等于原始大小
        if (newWidth >= originalSize.width && newHeight >= originalSize.height) {
            mainWindow.setSize(newWidth, newHeight);
            saveWindowSize(newWidth, newHeight);

            // 计算缩放比例
            const widthRatio = newWidth / originalSize.width;
            const heightRatio = newHeight / originalSize.height;
            const zoomFactor = Math.max(widthRatio, heightRatio);
            mainWindow.webContents.setZoomFactor(zoomFactor); // 设置网页缩放

            sizeWindow.close();
        } else {
            event.sender.send('size-error', `宽度和高度必须大于或等于 ${originalSize.width} 和 ${originalSize.height}`);
        }
    });

    // 处理重置窗口大小事件
    ipcMain.on('reset-window-size', () => {
        mainWindow.setSize(originalSize.width, originalSize.height);
        saveWindowSize(originalSize.width, originalSize.height);
        mainWindow.webContents.setZoomFactor(1); // 重置缩放

        if (sizeWindow && !sizeWindow.isDestroyed()) {
            sizeWindow.close();
        }
    });
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: originalSize.width,
        height: originalSize.height,
        resizable: false,
        frame: true,
        webPreferences: {
            plugins: true,
            contextIsolation: false,
            nodeIntegration: true,
            allowRunningInsecureContent: true,
            webSecurity: false,
        },
    });

    // 设置窗口大小
    const { width, height } = loadWindowSize();
    mainWindow.setSize(width, height);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.insertCSS('body { user-select: none; }');
    });

    // 使用 before-input-event 捕获 F1 键
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F1') {
            event.preventDefault(); // 阻止默认行为
            createSizeInputWindow(mainWindow);
        }
    });

    // 加载游戏页面
    mainWindow.loadURL('http://hua.61.com/play.shtml');
}

module.exports = { setupFlashPlayer, createWindow };
