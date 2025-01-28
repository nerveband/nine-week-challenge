import PocketBase from 'pocketbase';

async function clearAuthAndLocalStorage() {
    const pb = new PocketBase('http://127.0.0.1:8090');
    
    try {
        // Clear PocketBase auth store
        pb.authStore.clear();
        console.log('✅ Cleared PocketBase auth store');
        
        // Clear localStorage if running in browser
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
            console.log('✅ Cleared localStorage');
        }
        
        console.log('\n🎉 Successfully cleared all storage!');
        
    } catch (error) {
        console.error('❌ Error clearing storage:', error);
        process.exit(1);
    }
}

clearAuthAndLocalStorage();
