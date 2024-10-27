const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function getPluginNameByPlatform(platform) {
    // 根据平台返回相应的插件名
    switch (platform) {
        case 'win32':
            return 'pepflashplayer.dll';
        // 根据需要可以添加更多平台的支持
        default:
            throw new Error(`Unsupported platform: ${platform}`);
    }
}

// 获取插件名
let pluginName = getPluginNameByPlatform(process.platform);
let plugins = path.join(__dirname, 'assert', pluginName);

// 检查是否在 ASAR 包中运行
if (__dirname.includes('.asar')) {
    plugins = path.join(process.resourcesPath, pluginName);
}

// 设置 Flash Player 路径
app.commandLine.appendSwitch('ppapi-flash-path', plugins);

function createWindow() {
    const win = new BrowserWindow({
        width: 1214, // 指定宽度
        height: 698, // 指定高度
        resizable: false, // 禁止调整窗口大小
        frame: true, // 显示工具栏
        webPreferences: {
            plugins: true,
            contextIsolation: false,
            nodeIntegration: true,
            allowRunningInsecureContent: true, // 允许加载不安全的内容
            webSecurity: false
        }
    });

    // 加载游戏页面
    win.loadURL('http://hua.61.com/play.shtml');
}

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
