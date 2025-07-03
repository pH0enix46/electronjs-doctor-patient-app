// Type definitions for the Electron API exposed via the preload script
declare global {
  interface Window {
    electronAPI: {
      // Database operations
      getPatients: () => Promise<any[]>;
      getPatient: (id: number) => Promise<any>;
      addPatient: (patient: any) => Promise<number>;
      updatePatient: (id: number, patient: any) => Promise<void>;
      deletePatient: (id: number) => Promise<void>;
      getUnsyncedPatients: () => Promise<any[]>;
      markPatientAsSynced: (id: number) => Promise<void>;
      saveImage: (base64Data: string, patientId: number) => Promise<string>;
      deleteImage: (filePath: string) => Promise<void>;
      addToSyncQueue: (table: string, recordId: number, action: string, data: any) => Promise<void>;
      
      // Window controls
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}

export {}; // This file needs to be a module
