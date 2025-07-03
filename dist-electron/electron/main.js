"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Import Electron
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const database_1 = require("./database");
const url_1 = require("url");
// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
    electron_1.app.quit();
}
// Determine if we're in development mode
const isDev = process.env.NODE_ENV === "development" || !electron_1.app.isPackaged;
// Log environment information
const logEnvironment = () => {
    console.log("Electron Environment:", {
        isDev,
        nodeEnv: process.env.NODE_ENV,
        isPackaged: electron_1.app.isPackaged,
        appPath: electron_1.app.getAppPath(),
        userData: electron_1.app.getPath("userData"),
        version: electron_1.app.getVersion(),
    });
};
// Register custom protocol for serving local files
const setupStaticFileProtocol = () => {
    // First, unregister any existing protocol
    electron_1.protocol.unregisterProtocol("app");
    // Register the protocol
    electron_1.protocol.registerFileProtocol("app", (request, callback) => {
        try {
            // Parse the URL to handle special characters in paths
            const url = new url_1.URL(request.url);
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
                const userDataPath = electron_1.app.getPath("userData");
                console.log("userDataPath:", userDataPath);
                const patientImagesPath = path.join(userDataPath, "patient_images", fileName);
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
        }
        catch (error) {
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
    }
    catch (error) {
        console.error("Error checking preload script:", error);
        electron_1.app.quit();
        return;
    }
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
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
            .executeJavaScript(`
      console.log('Checking electronAPI availability:', {
        hasElectronAPI: typeof window.electronAPI !== 'undefined',
        electronAPIKeys: window.electronAPI ? Object.keys(window.electronAPI) : []
      });
    `)
            .catch(console.error);
    });
    // Load the app
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        // Open the DevTools in development mode.
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
    }
    // Show window when page is ready
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
    // Open external links in the default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("http:") || url.startsWith("https:")) {
            electron_1.shell.openExternal(url);
        }
        return { action: "deny" };
    });
    return mainWindow;
};
// This method will be called when Electron has finished initialization
electron_1.app.whenReady().then(() => {
    // Set up static file protocol
    setupStaticFileProtocol();
    // Initialize database handlers
    (0, database_1.initializeDatabaseHandlers)();
    logEnvironment();
    // Initialize database handlers BEFORE creating window
    (0, database_1.initializeDatabaseHandlers)();
    // Create the main window
    createWindow();
});
// Quit when all windows are closed, except on macOS
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    // On macOS it's common to re-create a window when the dock icon is clicked
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map