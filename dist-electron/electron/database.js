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
// Get database instance
const getDB = () => {
    if (!dbInstance) {
        const userDataPath = electron_1.app.getPath("userData");
        const dbPath = path_1.default.join(userDataPath, "doctor-app.db");
        // Create database directory if it doesn't exist
        const dbDir = path_1.default.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        dbInstance = new better_sqlite3_1.default(dbPath);
        initializeDB();
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
        const fileName = `patient_${patientId}_${Date.now()}.${ext}`;
        const userDataPath = electron_1.app.getPath("userData");
        const imagesDir = path_1.default.join(userDataPath, "patient_images");
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        const filePath = path_1.default.join(imagesDir, fileName);
        fs.writeFileSync(filePath, matches[2], "base64");
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
    // Patient handlers
    electron_1.ipcMain.handle("db:getPatients", async () => {
        console.log("Getting all patients...");
        const db = getDB();
        return db.prepare("SELECT * FROM patients ORDER BY created_at DESC").all();
    });
    electron_1.ipcMain.handle("db:addPatient", async (_, patient) => {
        console.log("Adding patient:", patient);
        const db = getDB();
        const { lastInsertRowid } = db
            .prepare(`INSERT INTO patients (
          name, age, gender, phone, email, address, medical_history, image_path
        ) VALUES (
          @name, @age, @gender, @phone, @email, @address, @medical_history, @image_path
        )`)
            .run({
            name: patient.name,
            age: patient.age || null,
            gender: patient.gender || null,
            phone: patient.phone || null,
            email: patient.email || null,
            address: patient.address || null,
            medical_history: patient.medical_history || null,
            image_path: patient.image_path || null,
        });
        // Add to sync queue
        db.prepare("INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)").run("patients", lastInsertRowid, "INSERT", JSON.stringify(patient));
        return lastInsertRowid;
    });
    electron_1.ipcMain.handle("db:updatePatient", async (_, id, patient) => {
        console.log("Updating patient:", id, patient);
        const db = getDB();
        const result = db
            .prepare(`UPDATE patients SET 
          name = COALESCE(@name, name),
          age = COALESCE(@age, age),
          gender = COALESCE(@gender, gender),
          phone = COALESCE(@phone, phone),
          email = COALESCE(@email, email),
          address = COALESCE(@address, address),
          medical_history = COALESCE(@medical_history, medical_history),
          image_path = COALESCE(@image_path, image_path),
          is_synced = 0
        WHERE id = @id`)
            .run({
            id,
            name: patient.name || null,
            age: patient.age || null,
            gender: patient.gender || null,
            phone: patient.phone || null,
            email: patient.email || null,
            address: patient.address || null,
            medical_history: patient.medical_history || null,
            image_path: patient.image_path || null,
        });
        // Add to sync queue
        db.prepare("INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)").run("patients", id, "UPDATE", JSON.stringify(patient));
        return result.changes > 0;
    });
    electron_1.ipcMain.handle("db:deletePatient", async (_, id) => {
        console.log("Deleting patient:", id);
        const db = getDB();
        // Get patient to delete image if exists
        const patient = db
            .prepare("SELECT image_path FROM patients WHERE id = ?")
            .get(id);
        if (patient?.image_path) {
            deleteImage(patient.image_path);
        }
        const result = db.prepare("DELETE FROM patients WHERE id = ?").run(id);
        // Add to sync queue
        db.prepare("INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)").run("patients", id, "DELETE", JSON.stringify({ id }));
        return result.changes > 0;
    });
    // Patient specific handlers
    electron_1.ipcMain.handle("db:getPatient", async (_, id) => {
        console.log("Getting patient:", id);
        const db = getDB();
        return db.prepare("SELECT * FROM patients WHERE id = ?").get(id) || null;
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