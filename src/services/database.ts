// Extend the Window interface to include our electronAPI
declare global {
  interface Window {
    electronAPI: {
      getPatients: () => Promise<Patient[]>;
      getPatient: (id: number) => Promise<Patient | null>;
      addPatient: (patient: Omit<Patient, 'id' | 'created_at' | 'is_synced'>) => Promise<number>;
      updatePatient: (id: number, updates: Partial<Patient>) => Promise<boolean>;
      deletePatient: (id: number) => Promise<boolean>;
      saveImage: (base64Data: string, patientId: number) => Promise<string>;
      deleteImage: (filePath: string) => Promise<boolean>;
      executeQuery: (query: string, params: any[]) => Promise<any[]>;
      getImage: (filePath: string) => Promise<string>;
      getUnsyncedPatients: () => Promise<Patient[]>;
      markPatientAsSynced: (id: number) => Promise<boolean>;
      addToSyncQueue: (table: string, recordId: number, action: 'INSERT' | 'UPDATE' | 'DELETE', data: any) => Promise<void>;
    };
  }
}

// Helper function to ensure electronAPI is available
const ensureElectronAPI = () => {
  if (!window.electronAPI) {
    throw new Error('Electron API is not available. Make sure preload script is loaded correctly.');
  }
  return window.electronAPI;
};

export interface Patient {
  id?: number;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  medical_history?: string;
  image_path?: string;
  created_at?: string;
  is_synced?: boolean;
}

// Database operations that use the exposed window.electronAPI
const dbOperations = {
  // Patient operations
  getPatients: async (): Promise<Patient[]> => {
    try {
      const electronAPI = ensureElectronAPI();
      return await electronAPI.getPatients();
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw error;
    }
  },

  getPatient: async (id: number): Promise<Patient | null> => {
    try {
      const electronAPI = ensureElectronAPI();
      return await electronAPI.getPatient(id);
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  getUnsyncedPatients: async (): Promise<Patient[]> => {
    try {
      const electronAPI = ensureElectronAPI();
      return await electronAPI.getUnsyncedPatients();
    } catch (error) {
      console.error("Error fetching unsynced patients:", error);
      throw error;
    }
  },

  markPatientAsSynced: async (id: number): Promise<boolean> => {
    try {
      const electronAPI = ensureElectronAPI();
      return await electronAPI.markPatientAsSynced(id);
    } catch (error) {
      console.error(`Error marking patient ${id} as synced:`, error);
      throw error;
    }
  },

  addToSyncQueue: async (
    table: string, 
    recordId: number, 
    action: 'INSERT' | 'UPDATE' | 'DELETE', 
    data: any
  ): Promise<void> => {
    try {
      const electronAPI = ensureElectronAPI();
      await electronAPI.addToSyncQueue(table, recordId, action, data);
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  },

  addPatient: async (
    patient: Omit<Patient, "id" | "created_at" | "is_synced">
  ): Promise<number> => {
    try {
      const electronAPI = ensureElectronAPI();
      return await electronAPI.addPatient(patient);
    } catch (error) {
      console.error("Error adding patient:", error);
      throw error;
    }
  },

  updatePatient: async (
    id: number,
    updates: Partial<Patient>
  ): Promise<boolean> => {
    try {
      const electronAPI = ensureElectronAPI();
      return await electronAPI.updatePatient(id, updates);
    } catch (error) {
      console.error("Error updating patient:", error);
      throw error;
    }
  },

  deletePatient: async (id: number): Promise<boolean> => {
    try {
      const electronAPI = ensureElectronAPI();
      return await electronAPI.deletePatient(id);
    } catch (error) {
      console.error("Error deleting patient:", error);
      throw error;
    }
  },

  // Image operations
  saveImage: async (base64Data: string, patientId: number): Promise<string> => {
    try {
      // Ensure we're passing both required arguments
      if (!base64Data || patientId == null) {
        throw new Error("Missing required parameters for saveImage");
      }
      const electronAPI = ensureElectronAPI();
      // Cast patientId to number to ensure type safety
      const result = await electronAPI.saveImage(
        base64Data,
        Number(patientId)
      );
      return result;
    } catch (error) {
      console.error("Error saving image:", error);
      throw error;
    }
  },

  getImage: async (filePath: string): Promise<string> => {
    try {
      if (!filePath) {
        throw new Error("File path is required");
      }
      const electronAPI = ensureElectronAPI();
      return await electronAPI.getImage(filePath);
    } catch (error) {
      console.error("Error getting image:", error);
      throw error;
    }
  },

  deleteImage: async (filePath: string): Promise<boolean> => {
    try {
      if (!filePath) return true; // No image to delete
      const electronAPI = ensureElectronAPI();
      await electronAPI.deleteImage(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false; // Don't fail the entire operation if image deletion fails
    }
  },

  // Helper to format patient data for display
  formatPatientForDisplay: (patient: Patient) => {
    if (!patient) return null;
    
    // Format date
    const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        console.error("Error formatting date:", e);
        return "N/A";
      }
    };
    
    // Format phone number if exists
    const formatPhone = (phone?: string) => {
      if (!phone) return "N/A";
      // Simple formatting - can be enhanced with a library like libphonenumber-js
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    };
    
    return {
      ...patient,
      // Format dates
      created_at: formatDate(patient.created_at),
      // Format phone number
      phone: formatPhone(patient.phone),
      // Add a placeholder image if none exists
      imageUrl: patient.image_path
        ? `file://${patient.image_path}`
        : "/placeholder-user.jpg",
      // Add a display name that handles missing name
      displayName: patient.name?.trim() || "Unnamed Patient"
    };
  },

  // Search patients by name, phone, or email
  searchPatients: async (query: string): Promise<Patient[]> => {
    try {
      if (!query.trim()) {
        return [];
      }
      
      const searchTerm = query.toLowerCase();
      const patients = await dbOperations.getPatients();
      
      return patients.filter(patient => 
        (patient.name?.toLowerCase().includes(searchTerm)) ||
        (patient.phone?.toLowerCase().includes(searchTerm)) ||
        (patient.email?.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error("Error searching patients:", error);
      throw error;
    }
  },
};

export type Database = typeof dbOperations;
export default dbOperations;
