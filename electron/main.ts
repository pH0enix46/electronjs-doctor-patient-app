// Import Electron
import { app, BrowserWindow, shell, protocol } from "electron";
import * as path from "path";
import * as fs from "fs";
import { initializeDatabaseHandlers } from "./database";
import { URL } from "url";

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
}

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Log environment information
const logEnvironment = () => {
  console.log("Electron Environment:", {
    isDev,
    nodeEnv: process.env.NODE_ENV,
    isPackaged: app.isPackaged,
    appPath: app.getAppPath(),
    userData: app.getPath("userData"),
    version: app.getVersion(),
  });
};

// Register custom protocol for serving local files
const setupStaticFileProtocol = () => {
  // First, unregister any existing protocol
  protocol.unregisterProtocol("app");

  // Register the protocol
  protocol.registerFileProtocol("app", (request, callback) => {
    try {
      // Parse the URL to handle special characters in paths
      const url = new URL(request.url);

      // Handle local-resource requests
      if (url.hostname === "local-resource") {
        // Get the file path from the URL
        const filePath = decodeURIComponent(url.pathname.substring(1));

        // Check if file exists
        if (fs.existsSync(filePath)) {
          console.log("Serving file:", filePath);
          return callback(filePath);
        }

        // Try to find the file in the patient_images directory
        const fileName = path.basename(filePath);
        const userDataPath = app.getPath("userData");
        console.log("userDataPath:", userDataPath);
        const patientImagesPath = path.join(
          userDataPath,
          "patient_images",
          fileName
        );

        if (fs.existsSync(patientImagesPath)) {
          console.log("Serving file from patient_images:", patientImagesPath);
          return callback(patientImagesPath);
        }

        console.error("File not found:", filePath);
        return callback({ error: -6 }); // FILE_NOT_FOUND
      }

      // Handle other app:// URLs if needed
      console.error("Unhandled app:// URL:", request.url);
      callback({ error: -6 }); // FILE_NOT_FOUND
    } catch (error) {
      console.error("Error handling file request:", error);
      callback({ error: -6 }); // FILE_NOT_FOUND
    }
  });

  // Log protocol registration
  console.log("Custom protocol registered: app://");
};

const createWindow = () => {
  console.log("Creating new browser window...");

  // Always use preload.js in the current directory (dist-electron)
  const preloadPath = path.join(__dirname, "preload.js");
  console.log("Attempting to load preload script from:", preloadPath);

  // Verify preload script exists
  try {
    if (!require("fs").existsSync(preloadPath)) {
      console.error("Preload script not found at:", preloadPath);
      throw new Error("Preload script not found");
    }
    console.log("Preload script found at:", preloadPath);
  } catch (error) {
    console.error("Error checking preload script:", error);
    app.quit();
    return;
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true, // Required for security
      nodeIntegration: true, // Enable Node.js integration for file access
      sandbox: false, // Required for file access
      webSecurity: false, // Allow file:// URLs
      allowRunningInsecureContent: true, // Allow local resources
      webviewTag: true, // Enable webview tag if needed
      nodeIntegrationInWorker: true, // Enable Node.js in workers if needed
      nodeIntegrationInSubFrames: true, // Enable Node.js in iframes if needed
    },
    show: false, // Don't show until ready-to-show
    backgroundColor: "#ffffff",
  });

  // Log when preload script is loaded
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("Main window finished loading");
    // Execute script to check if electronAPI is available
    mainWindow.webContents
      .executeJavaScript(
        `
      console.log('Checking electronAPI availability:', {
        hasElectronAPI: typeof window.electronAPI !== 'undefined',
        electronAPIKeys: window.electronAPI ? Object.keys(window.electronAPI) : []
      });
    `
      )
      .catch(console.error);
  });

  // Load the app
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // Open the DevTools in development mode.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Show window when page is ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  return mainWindow;
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Set up static file protocol
  setupStaticFileProtocol();

  // Initialize database handlers
  initializeDatabaseHandlers();

  logEnvironment();

  // Initialize database handlers BEFORE creating window
  initializeDatabaseHandlers();

  // Create the main window
  createWindow();
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
