const { app, Menu, BrowserWindow } = require('electron');
const path = require('path');
const { createWindow } = require('./function/wehua'); // 保持导入wehua的代码

// 根据平台获取Flash插件名称
function getPluginNameByPlatform(platform) {
    switch (platform) {
        case 'win32':
            return 'pepflashplayer.dll';
        case 'darwin': // macOS
            return 'PepperFlashPlayer.plugin';
        case 'linux':
            return 'libpepflashplayer.so';
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
}

// 设置Flash Player
function setupFlashPlayer() {
    let pluginName = getPluginNameByPlatform(process.platform);
    let plugins = path.join(__dirname, 'assert', pluginName);

    if (__dirname.includes('.asar')) {
        plugins = path.join(process.resourcesPath, pluginName);
    }

    return plugins;
}

// 设置Flash Player路径
const pluginsPath = setupFlashPlayer();
app.commandLine.appendSwitch('ppapi-flash-path', pluginsPath);

// 清除应用菜单
app.on('ready', () => {
    Menu.setApplicationMenu(null);
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
