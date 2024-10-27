const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const pepFlashPlayerPath = path.join(__dirname, 'assert', 'pepflashplayer.dll');
app.commandLine.appendSwitch('ppapi-flash-path', pepFlashPlayerPath);

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
            allowRunningInsecureContent: true // 允许加载不安全的内容
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
