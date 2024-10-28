const { app, Menu } = require('electron');
const { setupFlashPlayer, createWindow } = require('./function/wehua'); // 更新导入路径

// 设置 Flash Player
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
