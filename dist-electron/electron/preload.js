"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // Database operations
    getPatients: () => electron_1.ipcRenderer.invoke("db:getPatients"),
    getPatient: (id) => electron_1.ipcRenderer.invoke("db:getPatient", id),
    addPatient: (patient) => electron_1.ipcRenderer.invoke("db:addPatient", patient),
    updatePatient: (id, patient) => electron_1.ipcRenderer.invoke("db:updatePatient", id, patient),
    deletePatient: (id) => electron_1.ipcRenderer.invoke("db:deletePatient", id),
    getUnsyncedPatients: () => electron_1.ipcRenderer.invoke("db:getUnsyncedPatients"),
    markPatientAsSynced: (id) => electron_1.ipcRenderer.invoke("db:markPatientAsSynced", id),
    saveImage: (base64Data, patientId) => electron_1.ipcRenderer.invoke("db:saveImage", base64Data, patientId),
    deleteImage: (filePath) => electron_1.ipcRenderer.invoke("db:deleteImage", filePath),
    addToSyncQueue: (table, recordId, action, data) => electron_1.ipcRenderer.invoke("db:addToSyncQueue", table, recordId, action, data),
    // Window controls
    minimize: () => electron_1.ipcRenderer.send("window:minimize"),
    maximize: () => electron_1.ipcRenderer.send("window:maximize"),
    close: () => electron_1.ipcRenderer.send("window:close"),
});
console.log("Preload script loaded successfully!");
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element)
            element.innerText = text;
    };
    for (const dependency of ["chrome", "node", "electron"]) {
        replaceText(`${dependency}-version`, process.versions[dependency] || "");
    }
});
//# sourceMappingURL=preload.js.map