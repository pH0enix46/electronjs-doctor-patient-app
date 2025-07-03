import { DatabaseAPI } from '../electron/database';

declare global {
  interface Window {
    electronAPI: {
      // Database methods
      executeQuery: (sql: string, params?: any[]) => Promise<any>;
      saveImage: (base64Data: string, fileName: string) => Promise<string>;
      getImage: (filePath: string) => Promise<string>;
      deleteImage: (filePath: string) => Promise<boolean>;
      
      // Window controls
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      
      // App events
      onUpdatePatientList: (callback: () => void) => void;
      removeUpdatePatientListListener: () => void;
    };
  }
}
