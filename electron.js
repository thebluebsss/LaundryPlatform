const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let serverProcess;

function startServer(callback) {
  // Start Express server internally
  serverProcess = spawn("node", [path.join(__dirname, "dist/server.cjs")], {
    env: { ...process.env, NODE_ENV: "production", PORT: "3000" },
    stdio: "inherit"
  });

  setTimeout(callback, 2000);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: "Giặt Là Sạch Sẽ - Tiệm Giặt Đồ Cao Cấp",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const appUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";
  mainWindow.loadURL(appUrl);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  if (process.env.ELECTRON_START_URL) {
    createWindow();
  } else {
    startServer(() => {
      createWindow();
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
