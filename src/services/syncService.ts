import { getDB } from './database';

interface SyncQueueItem {
  id: number;
  table_name: string;
  record_id: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: string;
  created_at: string;
  is_processed: number;
}

export const checkConnectivity = async (): Promise<boolean> => {
  try {
    // Try to make a simple request to a reliable server
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
};

export const processSyncQueue = async () => {
  const isOnline = await checkConnectivity();
  if (!isOnline) return;
  
  const db = getDB();
  
  try {
    // Get all unprocessed sync queue items
    const queueItems: SyncQueueItem[] = db.prepare(`
      SELECT * FROM sync_queue 
      WHERE is_processed = 0 
      ORDER BY created_at ASC
    `).all() as SyncQueueItem[];
    
    for (const item of queueItems) {
      try {
        // Parse the data but don't assign it since it's not used
        JSON.parse(item.data);
        
        // Here you would typically make an API call to your backend
        // For example:
        // const response = await fetch('your-api-endpoint', {
        //   method: item.action === 'DELETE' ? 'DELETE' : 
        //          item.action === 'UPDATE' ? 'PUT' : 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(item.data)
        // });
        
        // For now, we'll simulate a successful API call
        const response = { ok: true };
      
      if (response.ok) {
          // Mark the queue item as processed
          db.prepare('UPDATE sync_queue SET is_processed = 1 WHERE id = ?')
            .run(item.id);
          
          // If this was a patient action, mark the patient as synced
          if (item.table_name === 'patients') {
            db.prepare('UPDATE patients SET is_synced = 1 WHERE id = ?')
              .run(item.record_id);
          }
        }
      } catch (error) {
        console.error(`Error processing sync queue item ${item.id}:`, error);
        // Optionally, you could implement retry logic here
      }
    }
  } catch (error) {
    console.error('Error processing sync queue:', error);
  }
};

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', processSyncQueue);
  window.addEventListener('offline', () => {
    console.log('App is offline. Changes will be synced when back online.');
  });
}

// Periodically check for pending syncs
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
setInterval(processSyncQueue, SYNC_INTERVAL);

// Initial sync check when the app loads
processSyncQueue();
