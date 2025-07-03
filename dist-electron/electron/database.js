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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabaseHandlers = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs = __importStar(require("fs"));
let dbInstance = null;
// Get the application data directory
const getAppDataPath = () => {
    try {
        // Use app.getPath('userData') which points to the correct app data directory
        // On macOS: ~/Library/Application Support/YourAppName
        // On Windows: %APPDATA%\YourAppName
        // On Linux: ~/.config/YourAppName
        const userDataPath = electron_1.app.getPath('userData');
        // Create the directory if it doesn't exist
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true, mode: 0o755 });
        }
        return userDataPath;
    }
    catch (error) {
        console.error('Error getting app data path:', error);
        return process.cwd(); // Fallback to current directory
    }
};
// Get database instance
const getDB = () => {
    if (!dbInstance) {
        try {
            // Get app data path
            const appDataPath = getAppDataPath();
            console.log('Using app data path:', appDataPath);
            // Database will be stored directly in the app data directory
            const dbPath = path_1.default.join(appDataPath, 'doctor-app.db');
            console.log('Database will be created at:', dbPath);
            // Force create new database at the specified path
            dbInstance = new better_sqlite3_1.default(dbPath);
            console.log('Database initialized successfully at:', dbPath);
            // Initialize database tables
            initializeDB();
            // Verify the database file was created
            if (!fs.existsSync(dbPath)) {
                throw new Error(`Failed to create database at: ${dbPath}`);
            }
            console.log('Verified database file exists at:', dbPath);
        }
        catch (error) {
            console.error('Error initializing database:', error);
            throw error;
        }
    }
    return dbInstance;
};
// Initialize database
const initializeDB = () => {
    const db = getDB();
    // Create patients table
    db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      medical_history TEXT,
      image_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_synced BOOLEAN DEFAULT 0
    )
  `);
    // Create sync_queue table for offline changes
    db.exec(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id INTEGER,
      action TEXT NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
      data TEXT NOT NULL,    -- JSON string of the record
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_processed BOOLEAN DEFAULT 0
    )
  `);
    // Create doctors table
    db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialization TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      image_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_synced BOOLEAN DEFAULT 0
    )
  `);
    return db;
};
// Save base64 image to disk and return the path
const saveImage = (base64Data, patientId) => {
    try {
        const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error("Invalid base64 image data");
        }
        const ext = matches[1].split("/")[1] || "png";
        // Create a non-hidden filename with a clean format
        const fileName = `patient_${patientId}_${Date.now()}.${ext}`.replace(/[^\w.-]/g, '_');
        // Use the app data path for storing images
        const appDataPath = getAppDataPath();
        const imagesDir = path_1.default.join(appDataPath, 'patient_images');
        console.log('Saving image to:', imagesDir);
        // Create images directory if it doesn't exist
        if (!fs.existsSync(imagesDir)) {
            console.log('Creating patient images directory...');
            fs.mkdirSync(imagesDir, { recursive: true, mode: 0o755 });
        }
        const filePath = path_1.default.join(imagesDir, fileName);
        console.log('Saving image to path:', filePath);
        // Ensure the directory exists again (in case of race conditions)
        if (!fs.existsSync(path_1.default.dirname(filePath))) {
            fs.mkdirSync(path_1.default.dirname(filePath), { recursive: true, mode: 0o755 });
        }
        // Write the file
        fs.writeFileSync(filePath, matches[2], "base64");
        // Verify the file was written
        if (!fs.existsSync(filePath)) {
            throw new Error(`Failed to save image: ${filePath}`);
        }
        console.log('Image saved successfully:', filePath);
        return filePath;
    }
    catch (error) {
        console.error("Error saving image:", error);
        throw error;
    }
};
// Delete image file
function deleteImage(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error(`Error deleting image ${filePath}:`, error);
        return false;
    }
}
// Initialize database handlers
const initializeDatabaseHandlers = () => {
    console.log("Initializing database handlers...");
    // Helper function to find a file in a directory, including hidden files
    const findFileInDirectory = (dir, fileName) => {
        try {
            // First try the exact filename
            const exactPath = path_1.default.join(dir, fileName);
            if (fs.existsSync(exactPath)) {
                return exactPath;
            }
            // Then try with dot prefix (for hidden files)
            const dotFileName = fileName.startsWith('.') ? fileName : `.${fileName}`;
            const dotPath = path_1.default.join(dir, dotFileName);
            if (fs.existsSync(dotPath)) {
                return dotPath;
            }
            // Try case-insensitive match
            const files = fs.readdirSync(dir);
            const foundFile = files.find(f => f.toLowerCase() === fileName.toLowerCase() ||
                f.toLowerCase() === dotFileName.toLowerCase());
            return foundFile ? path_1.default.join(dir, foundFile) : null;
        }
        catch (error) {
            console.error(`Error searching for file ${fileName} in ${dir}:`, error);
            return null;
        }
    };
    // Helper function to convert file paths to file URLs
    const toStaticUrl = (filePath) => {
        try {
            if (!filePath) {
                console.log('No file path provided');
                return null;
            }
            console.log('Processing file path:', filePath);
            // Clean up the path and normalize it
            const cleanPath = filePath.trim();
            // Check if it's already a file URL
            if (cleanPath.startsWith('file://')) {
                const fsPath = cleanPath.replace('file://', '');
                if (fs.existsSync(fsPath)) {
                    console.log('Using existing file URL:', cleanPath);
                    return cleanPath;
                }
            }
            // Check if it's an absolute path
            if (path_1.default.isAbsolute(cleanPath)) {
                if (fs.existsSync(cleanPath)) {
                    console.log('Using absolute path:', cleanPath);
                    return `file://${cleanPath}`;
                }
                // Try with dot prefix if it's a hidden file
                const dir = path_1.default.dirname(cleanPath);
                const baseName = path_1.default.basename(cleanPath);
                const foundPath = findFileInDirectory(dir, baseName);
                if (foundPath) {
                    console.log('Found file with case-insensitive/hidden match:', foundPath);
                    return `file://${foundPath}`;
                }
            }
            // Try relative to patient_images directory
            const userDataPath = electron_1.app.getPath('userData');
            const patientImagesPath = path_1.default.join(userDataPath, 'patient_images');
            // First try exact path
            const fullPath = path_1.default.join(patientImagesPath, path_1.default.basename(cleanPath));
            if (fs.existsSync(fullPath)) {
                console.log('Found image in patient_images:', fullPath);
                const fileUrl = `file://${process.platform === 'win32' ? '/' : ''}${fullPath.replace(/\\/g, '/')}`;
                console.log('Generated file URL:', fileUrl);
                return fileUrl;
            }
            // Try to find the file with case-insensitive/hidden file matching
            const foundPath = findFileInDirectory(patientImagesPath, path_1.default.basename(cleanPath));
            if (foundPath) {
                console.log('Found image with case-insensitive/hidden match:', foundPath);
                const fileUrl = `file://${process.platform === 'win32' ? '/' : ''}${foundPath.replace(/\\/g, '/')}`;
                console.log('Generated file URL:', fileUrl);
                return fileUrl;
            }
            // If we get here, the file doesn't exist
            console.error('Image file not found:', {
                originalPath: filePath,
                cleanedPath: cleanPath,
                searchedIn: patientImagesPath,
                fullPath: fullPath,
                exists: fs.existsSync(fullPath)
            });
            return null;
        }
        catch (error) {
            console.error('Error in toStaticUrl:', error);
            return null;
        }
    };
    // Helper function to process a patient row from the database
    const processPatient = (row) => {
        if (!row)
            return null;
        console.log('Processing patient row:', {
            id: row.id,
            name: row.name,
            image_path: row.image_path,
            has_image_data: !!row.image_data
        });
        const image_url = toStaticUrl(row.image_path);
        console.log('Generated image URL:', image_url);
        return {
            ...row,
            image_url: image_url
        };
    };
    // Patient handlers
    electron_1.ipcMain.handle("db:getPatients", async () => {
        console.log("Getting all patients...");
        const db = getDB();
        const patients = db.prepare("SELECT * FROM patients ORDER BY created_at DESC").all();
        return patients.map(processPatient);
    });
    electron_1.ipcMain.handle("db:getPatient", async (_, id) => {
        console.log("Getting patient with ID:", id);
        const db = getDB();
        const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
        if (!patient) {
            throw new Error(`Patient with ID ${id} not found`);
        }
        return processPatient(patient);
    });
    // Doctor handlers
    electron_1.ipcMain.handle("db:deleteDoctor", async (_, id) => {
        console.log("Deleting doctor:", id);
        const db = getDB();
        // Get doctor to delete image if exists
        const doctor = db
            .prepare("SELECT image_path FROM doctors WHERE id = ?")
            .get(id);
        if (doctor?.image_path) {
            try {
                fs.unlinkSync(doctor.image_path);
            }
            catch (error) {
                console.error("Error deleting doctor's image:", error);
            }
        }
        // Delete the doctor record
        const result = db.prepare("DELETE FROM doctors WHERE id = ?").run(id);
        // Add to sync queue
        db.prepare("INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)").run("doctors", id, "DELETE", JSON.stringify({ id }));
        return result.changes > 0;
    });
    // Add new patient with image handling
    electron_1.ipcMain.handle("db:addPatient", async (_, patientData) => {
        console.log("Adding new patient:", patientData);
        const db = getDB();
        const { image_data, ...patient } = patientData;
        let imagePath = null;
        // Start transaction
        db.exec('BEGIN TRANSACTION');
        try {
            // First, insert the patient record without the image path
            const result = db.prepare(`
        INSERT INTO patients (
          name, age, gender, phone, email, address, medical_history, is_synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(patient.name, patient.age || null, patient.gender || null, patient.phone || null, patient.email || null, patient.address || null, patient.medical_history || null, 0 // is_synced
            );
            const patientId = Number(result.lastInsertRowid); // Convert to number to avoid type issues
            // Save image if provided
            if (image_data) {
                try {
                    imagePath = saveImage(image_data, patientId);
                    // Update patient with the image path
                    db.prepare('UPDATE patients SET image_path = ? WHERE id = ?').run(imagePath, patientId);
                }
                catch (error) {
                    console.error('Error saving image:', error);
                    throw error; // This will trigger the catch block and rollback
                }
            }
            // Add to sync queue
            db.prepare("INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)").run("patients", patientId, "INSERT", JSON.stringify({ ...patient, image_path: imagePath }));
            // If we got here, commit the transaction
            db.exec('COMMIT');
            return { id: patientId, ...patient, image_path: imagePath };
        }
        catch (error) {
            // If any error occurs, rollback the transaction
            db.exec('ROLLBACK');
            console.error('Error in addPatient:', error);
            // Clean up any partially saved image
            if (imagePath && fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                }
                catch (unlinkError) {
                    console.error('Error cleaning up image file:', unlinkError);
                }
            }
            throw error; // Re-throw to send error to the renderer
        }
    });
    electron_1.ipcMain.handle("db:updatePatient", async (_, id, patientData) => {
        console.log("Updating patient:", id, patientData);
        const db = getDB();
        // Start transaction
        db.exec('BEGIN TRANSACTION');
        try {
            // Get current patient data
            const currentPatient = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
            if (!currentPatient) {
                throw new Error(`Patient with ID ${id} not found`);
            }
            // Handle image update if new image data is provided
            let imagePath = currentPatient.image_path || null;
            if (patientData.image_data) {
                // Delete old image if it exists
                if (currentPatient.image_path) {
                    try {
                        if (fs.existsSync(currentPatient.image_path)) {
                            fs.unlinkSync(currentPatient.image_path);
                            console.log('Deleted old image:', currentPatient.image_path);
                        }
                    }
                    catch (error) {
                        console.error('Error deleting old image:', error);
                        // Continue with update even if deletion fails
                    }
                }
                // Save new image
                imagePath = saveImage(patientData.image_data, id);
                console.log('Saved new image:', imagePath);
            }
            // Prepare update data
            const updateData = {
                id,
                name: patientData.name || currentPatient.name,
                age: patientData.age !== undefined ? patientData.age : currentPatient.age,
                gender: patientData.gender || currentPatient.gender,
                phone: patientData.phone || currentPatient.phone,
                email: patientData.email || currentPatient.email,
                address: patientData.address || currentPatient.address,
                medical_history: patientData.medical_history || currentPatient.medical_history,
                image_path: imagePath,
                is_synced: 0
            };
            // Update patient record
            db.prepare(`UPDATE patients SET 
          name = ?,
          age = ?,
          gender = ?,
          phone = ?,
          email = ?,
          address = ?,
          medical_history = ?,
          image_path = ?,
          is_synced = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`).run(updateData.name, updateData.age, updateData.gender, updateData.phone, updateData.email, updateData.address, updateData.medical_history, updateData.image_path, updateData.is_synced, updateData.id);
            // Add to sync queue
            db.prepare("INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)").run("patients", id, "UPDATE", JSON.stringify(updateData));
            // Commit transaction
            db.exec('COMMIT');
            // Get updated patient data with processed image URL
            const updatedPatient = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
            return processPatient(updatedPatient);
        }
        catch (error) {
            // Rollback on error
            db.exec('ROLLBACK');
            console.error('Error updating patient:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle("db:deletePatient", async (_, id) => {
        console.log("Deleting patient:", id);
        const db = getDB();
        // Start transaction
        db.exec('BEGIN TRANSACTION');
        try {
            // First, check if patient exists
            const patientExists = db.prepare("SELECT id FROM patients WHERE id = ?").get(id);
            if (!patientExists) {
                throw new Error(`Patient with ID ${id} not found`);
            }
            // Get patient data to delete associated image
            const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
            // Delete associated image if it exists
            if (patient.image_path) {
                try {
                    if (fs.existsSync(patient.image_path)) {
                        fs.unlinkSync(patient.image_path);
                        console.log('Deleted patient image:', patient.image_path);
                    }
                }
                catch (error) {
                    console.error('Error deleting patient image:', error);
                    // Continue with deletion even if image deletion fails
                }
            }
            // Delete the patient record
            const result = db.prepare("DELETE FROM patients WHERE id = ?").run(id);
            if (result.changes === 0) {
                throw new Error(`Failed to delete patient with ID ${id}`);
            }
            // Add to sync queue
            db.prepare("INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)").run("patients", id, "DELETE", JSON.stringify({ id }));
            // Commit transaction
            db.exec('COMMIT');
            return { success: true, message: `Patient with ID ${id} deleted successfully` };
        }
        catch (error) {
            // Rollback on error
            db.exec('ROLLBACK');
            console.error('Error deleting patient:', error);
            throw new Error(`Failed to delete patient: ${error?.message || 'Unknown error'}`);
        }
    });
    electron_1.ipcMain.handle("db:getUnsyncedPatients", async () => {
        console.log("Getting unsynced patients...");
        const db = getDB();
        return db
            .prepare("SELECT * FROM patients WHERE is_synced = 0 ORDER BY created_at")
            .all();
    });
    electron_1.ipcMain.handle("db:markPatientAsSynced", async (_, id) => {
        console.log("Marking patient as synced:", id);
        const db = getDB();
        const result = db
            .prepare("UPDATE patients SET is_synced = 1 WHERE id = ?")
            .run(id);
        return result.changes > 0;
    });
    // Image handling (removed duplicates)
    electron_1.ipcMain.handle("db:saveImage", async (_, base64Data, patientId) => {
        console.log("Saving image for patient:", patientId);
        try {
            return saveImage(base64Data, patientId);
        }
        catch (error) {
            console.error("Error in saveImage IPC handler:", error);
            throw error;
        }
    });
    electron_1.ipcMain.handle("db:deleteImage", async (_, filePath) => {
        console.log("Deleting image:", filePath);
        try {
            return deleteImage(filePath);
        }
        catch (error) {
            console.error("Error in deleteImage IPC handler:", error);
            return false;
        }
    });
    // Sync queue handler
    electron_1.ipcMain.handle("db:addToSyncQueue", async (_, table, recordId, action, data) => {
        console.log("Adding to sync queue:", { table, recordId, action });
        const db = getDB();
        db.prepare("INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)").run(table, recordId, action, JSON.stringify(data));
    });
    console.log("Database handlers initialized successfully");
};
exports.initializeDatabaseHandlers = initializeDatabaseHandlers;
//# sourceMappingURL=database.js.map