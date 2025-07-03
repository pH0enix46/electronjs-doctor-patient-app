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

export const addPatient = async (patient: Patient): Promise<number> => {
  try {
    let imagePath = patient.image_path;
    
    // Create patient data object first (without image)
    const patientData = {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      medical_history: patient.medical_history,
      is_synced: false
    };
    
    // Add patient to database first to get the patient ID
    const patientId = await db.addPatient(patientData);
    
    // Save image with the actual patient ID if image data is provided
    if (patient.image_data) {
      imagePath = await db.saveImage(patient.image_data, patientId);
      // Update the patient record with the image path
      await db.updatePatient(patientId, { image_path: imagePath });
    }
    
    // Add to sync queue
    const insertedPatient = await getPatient(patientId);
    if (insertedPatient) {
      await db.addToSyncQueue('patients', patientId, 'INSERT', insertedPatient);
    }
    
    return patientId;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

export const updatePatient = async (id: number, patient: Patient): Promise<boolean> => {
  try {
    // Get existing patient to handle image updates
    const existingPatient = await getPatient(id);
    if (!existingPatient) return false;
    
    // Handle image update
    let imagePath = patient.image_path || existingPatient.image_path || '';
    
    // If we have new image data
    if (patient.image_data) {
      // Delete old image if exists
      if (existingPatient.image_path) {
        await db.deleteImage(existingPatient.image_path);
      }
      // Save new image
      imagePath = await db.saveImage(patient.image_data, id);
    }
    
    // Create update data with explicit undefined for missing fields
    const updateData: Partial<Patient> = {
      name: patient.name,
      ...(patient.age !== undefined && { age: patient.age }),
      ...(patient.gender !== undefined && { gender: patient.gender }),
      ...(patient.phone !== undefined && { phone: patient.phone }),
      ...(patient.email !== undefined && { email: patient.email }),
      ...(patient.address !== undefined && { address: patient.address }),
      ...(patient.medical_history !== undefined && { medical_history: patient.medical_history }),
      image_path: imagePath || undefined,
      is_synced: false
    };
    
    // Update patient
    const success = await db.updatePatient(id, updateData);
    
    if (success) {
      // Add to sync queue
      const updatedPatient = await getPatient(id);
      if (updatedPatient) {
        await db.addToSyncQueue('patients', id, 'UPDATE', updatedPatient);
      }
    }
    
    return success;
  } catch (error) {
    console.error('Error updating patient:', error);
    return false;
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