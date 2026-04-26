const electron = require('electron');
console.log('Electron type:', typeof electron);
console.log('Electron value:', electron);
console.log('Has app:', typeof electron.app);
console.log('Has ipcMain:', typeof electron.ipcMain);
if (electron.app) {
  console.log('App ready, quitting...');
  electron.app.quit();
} else {
  console.log('ERROR: electron module did not load properly');
  process.exit(1);
}
