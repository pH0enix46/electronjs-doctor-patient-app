import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Database operations
  getPatients: () => ipcRenderer.invoke("db:getPatients"),
  getPatient: (id: number) => ipcRenderer.invoke("db:getPatient", id),
  addPatient: (patient: any) => ipcRenderer.invoke("db:addPatient", patient),
  updatePatient: (id: number, patient: any) =>
    ipcRenderer.invoke("db:updatePatient", id, patient),
  deletePatient: (id: number) => ipcRenderer.invoke("db:deletePatient", id),
  getUnsyncedPatients: () => ipcRenderer.invoke("db:getUnsyncedPatients"),
  markPatientAsSynced: (id: number) =>
    ipcRenderer.invoke("db:markPatientAsSynced", id),
  saveImage: (base64Data: string, patientId: number) =>
    ipcRenderer.invoke("db:saveImage", base64Data, patientId),
  deleteImage: (filePath: string) =>
    ipcRenderer.invoke("db:deleteImage", filePath),
  addToSyncQueue: (
    table: string,
    recordId: number,
    action: string,
    data: any
  ) => ipcRenderer.invoke("db:addToSyncQueue", table, recordId, action, data),

  // Window controls
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
});

console.log("Preload script loaded successfully!");
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(
      `${dependency}-version`,
      process.versions[dependency as keyof NodeJS.ProcessVersions] || ""
    );
  }
});
