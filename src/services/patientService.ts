import db from './database';

export interface Patient {
  id?: number;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  medical_history?: string;
  image_path?: string;        // Filesystem path to the image
  image_url?: string;          // URL to access the image in the renderer
  image_data?: string;         // Base64 image data
  created_at?: string;
  is_synced?: boolean;
}

export const addPatient = async (patient: Patient): Promise<Patient> => {
  try {
    // The backend returns a Patient object, but the frontend db wrapper might be mistyped.
    // We cast to 'unknown' first to bypass the incorrect type from the db wrapper.
    const newPatient = (await db.addPatient(patient)) as unknown as Patient;
    if (!newPatient || !newPatient.id) {
      throw new Error(
        'Failed to add patient or receive a valid new patient object.'
      );
    }
    return newPatient;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

export const updatePatient = async (
  id: number,
  patient: Partial<Patient>
): Promise<Patient | null> => {
  try {
    // The backend returns a Patient object, but the frontend db wrapper might be mistyped.
    const updatedPatient = (await db.updatePatient(
      id,
      patient
    )) as unknown as Patient | null;
    return updatedPatient;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

export const deletePatient = async (id: number): Promise<boolean> => {
  try {
    // Get patient before deletion for sync queue
    const patient = await getPatient(id);
    if (!patient) return false;
    
    // Delete image if exists
    if (patient.image_path) {
      await db.deleteImage(patient.image_path);
    }
    
    // Add to sync queue before deletion
    await db.addToSyncQueue('patients', id, 'DELETE', patient);
    
    // Delete patient
    const success = await db.deletePatient(id);
    
    return success;
  } catch (error) {
    console.error('Error deleting patient:', error);
    return false;
  }
};

export const getPatient = async (id: number): Promise<Patient | null> => {
  try {
    return await db.getPatient(id);
  } catch (error) {
    console.error('Error getting patient:', error);
    return null;
  }
};

export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    return await db.getPatients();
  } catch (error) {
    console.error('Error getting all patients:', error);
    return [];
  }
};

export const getUnsyncedPatients = async (): Promise<Patient[]> => {
  try {
    return await db.getUnsyncedPatients();
  } catch (error) {
    console.error('Error getting unsynced patients:', error);
    return [];
  }
};

export const markAsSynced = async (id: number): Promise<boolean> => {
  try {
    return await db.markPatientAsSynced(id);
  } catch (error) {
    console.error('Error marking patient as synced:', error);
    return false;
  }
};