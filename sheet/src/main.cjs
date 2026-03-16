const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let hasUnsavedChanges = false;

ipcMain.on('set-unsaved-changes', (_event, value) => {
  hasUnsavedChanges = Boolean(value);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Scheda D&D",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  Menu.setApplicationMenu(null);

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); 
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.maximize();

  mainWindow.on('close', (event) => {
    if (!hasUnsavedChanges) return;
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      buttons: ['Annulla', 'Chiudi senza salvare'],
      defaultId: 0,
      cancelId: 0,
      title: 'Modifiche non salvate',
      message: 'Hai modifiche non salvate. Vuoi chiudere senza salvare?'
    });
    if (choice === 0) {
      event.preventDefault();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
