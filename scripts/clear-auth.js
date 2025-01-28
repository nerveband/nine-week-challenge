import PocketBase from 'pocketbase';

async function clearAuth() {
    const pb = new PocketBase('http://127.0.0.1:8090');
    pb.authStore.clear();
    console.log('✅ Cleared auth store');
}

clearAuth();
