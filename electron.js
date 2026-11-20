const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

let mainWindow;
let serverProcess;

function waitForServer(url, retries = 30, intervalMs = 300) {
  return new Promise((resolve) => {
    let attempts = 0;
    const probe = () => {
      attempts += 1;
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (attempts >= retries) {
          resolve();
        } else {
          setTimeout(probe, intervalMs);
        }
      });
      req.setTimeout(1000, () => {
        req.destroy();
      });
    };
    probe();
  });
}

function startServer(callback) {
  const port = process.env.PORT || "3000";
  // Start Express server internally
  serverProcess = spawn("node", [path.join(__dirname, "dist/server.cjs")], {
    env: { ...process.env, NODE_ENV: "production", PORT: port },
    stdio: "inherit",
  });

  waitForServer(`http://localhost:${port}/api/health`).then(callback);
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

  const port = process.env.PORT || "3000";
  const appUrl = process.env.ELECTRON_START_URL || `http://localhost:${port}`;
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
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
