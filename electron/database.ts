import { app, ipcMain } from "electron";
import path from "path";
import Database from "better-sqlite3";
import * as fs from "fs";

let dbInstance: Database.Database | null = null;

// Get database instance
const getDB = (): Database.Database => {
  if (!dbInstance) {
    const userDataPath = app.getPath("userData");
    const dbPath = path.join(userDataPath, "doctor-app.db");

    // Create database directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    dbInstance = new Database(dbPath);
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
const saveImage = (base64Data: string, patientId: number): string => {
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 image data");
    }

    const ext = matches[1].split("/")[1] || "png";
    const fileName = `patient_${patientId}_${Date.now()}.${ext}`;
    const userDataPath = app.getPath("userData");
    const imagesDir = path.join(userDataPath, "patient_images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const filePath = path.join(imagesDir, fileName);
    fs.writeFileSync(filePath, matches[2], "base64");

    return filePath;
  } catch (error) {
    console.error("Error saving image:", error);
    throw error;
  }
};

// Delete image file
function deleteImage(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting image ${filePath}:`, error);
    return false;
  }
}

// Initialize database handlers
export const initializeDatabaseHandlers = () => {
  console.log("Initializing database handlers...");

  // Patient handlers
  ipcMain.handle("db:getPatients", async () => {
    console.log("Getting all patients...");
    const db = getDB();
    return db.prepare("SELECT * FROM patients ORDER BY created_at DESC").all();
  });

  ipcMain.handle("db:addPatient", async (_, patient) => {
    console.log("Adding patient:", patient);
    const db = getDB();
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO patients (
          name, age, gender, phone, email, address, medical_history, image_path
        ) VALUES (
          @name, @age, @gender, @phone, @email, @address, @medical_history, @image_path
        )`
      )
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
    db.prepare(
      "INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)"
    ).run("patients", lastInsertRowid, "INSERT", JSON.stringify(patient));

    return lastInsertRowid;
  });

  ipcMain.handle("db:updatePatient", async (_, id, patient) => {
    console.log("Updating patient:", id, patient);
    const db = getDB();
    const result = db
      .prepare(
        `UPDATE patients SET 
          name = COALESCE(@name, name),
          age = COALESCE(@age, age),
          gender = COALESCE(@gender, gender),
          phone = COALESCE(@phone, phone),
          email = COALESCE(@email, email),
          address = COALESCE(@address, address),
          medical_history = COALESCE(@medical_history, medical_history),
          image_path = COALESCE(@image_path, image_path),
          is_synced = 0
        WHERE id = @id`
      )
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
    db.prepare(
      "INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)"
    ).run("patients", id, "UPDATE", JSON.stringify(patient));

    return result.changes > 0;
  });

  ipcMain.handle("db:deletePatient", async (_, id) => {
    console.log("Deleting patient:", id);
    const db = getDB();

    // Get patient to delete image if exists
    const patient = db
      .prepare("SELECT image_path FROM patients WHERE id = ?")
      .get(id) as { image_path?: string };
    if (patient?.image_path) {
      deleteImage(patient.image_path);
    }

    const result = db.prepare("DELETE FROM patients WHERE id = ?").run(id);

    // Add to sync queue
    db.prepare(
      "INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)"
    ).run("patients", id, "DELETE", JSON.stringify({ id }));

    return result.changes > 0;
  });

  // Patient specific handlers
  ipcMain.handle("db:getPatient", async (_, id: number) => {
    console.log("Getting patient:", id);
    const db = getDB();
    return db.prepare("SELECT * FROM patients WHERE id = ?").get(id) || null;
  });

  ipcMain.handle("db:getUnsyncedPatients", async () => {
    console.log("Getting unsynced patients...");
    const db = getDB();
    return db
      .prepare("SELECT * FROM patients WHERE is_synced = 0 ORDER BY created_at")
      .all();
  });

  ipcMain.handle("db:markPatientAsSynced", async (_, id: number) => {
    console.log("Marking patient as synced:", id);
    const db = getDB();
    const result = db
      .prepare("UPDATE patients SET is_synced = 1 WHERE id = ?")
      .run(id);
    return result.changes > 0;
  });

  // Image handling (removed duplicates)
  ipcMain.handle(
    "db:saveImage",
    async (_, base64Data: string, patientId: number) => {
      console.log("Saving image for patient:", patientId);
      try {
        return saveImage(base64Data, patientId);
      } catch (error) {
        console.error("Error in saveImage IPC handler:", error);
        throw error;
      }
    }
  );

  ipcMain.handle("db:deleteImage", async (_, filePath: string) => {
    console.log("Deleting image:", filePath);
    try {
      return deleteImage(filePath);
    } catch (error) {
      console.error("Error in deleteImage IPC handler:", error);
      return false;
    }
  });

  // Sync queue handler
  ipcMain.handle(
    "db:addToSyncQueue",
    async (_, table: string, recordId: number, action: string, data: any) => {
      console.log("Adding to sync queue:", { table, recordId, action });
      const db = getDB();
      db.prepare(
        "INSERT INTO sync_queue (table_name, record_id, action, data) VALUES (?, ?, ?, ?)"
      ).run(table, recordId, action, JSON.stringify(data));
    }
  );

  console.log("Database handlers initialized successfully");
};
