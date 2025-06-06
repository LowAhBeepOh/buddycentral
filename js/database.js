// Initialize the IndexedDB
const dbName = 'buddyUserProfile';
const dbVersion = 1;

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
            reject('Database error: ' + event.target.error);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('userProfile')) {
                const store = db.createObjectStore('userProfile', { keyPath: 'publicID' });
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('nickname', 'nickname', { unique: false });
                store.createIndex('userpfp', 'userpfp', { unique: false });
            }
        };
    });
};

// Generate a random public ID
const generatePublicID = () => {
    return 'uid_' + Math.random().toString(36).substr(2, 9);
};

// Save user profile
const saveUserProfile = async (userProfile) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['userProfile'], 'readwrite');
        const store = transaction.objectStore('userProfile');

        if (!userProfile.publicID) {
            userProfile.publicID = generatePublicID();
        }

        const request = store.put(userProfile);

        request.onsuccess = () => resolve(userProfile);
        request.onerror = () => reject(request.error);
    });
};

// Get user profile
const getUserProfile = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['userProfile'], 'readonly');
        const store = transaction.objectStore('userProfile');
        const request = store.getAll();

        request.onsuccess = () => {
            const profiles = request.result;
            resolve(profiles[0] || null); // Return the first profile or null
        };
        request.onerror = () => reject(request.error);
    });
};
