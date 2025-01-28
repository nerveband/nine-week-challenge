import PocketBase from 'pocketbase';

async function updateCollectionRules() {
    const pb = new PocketBase('http://127.0.0.1:8090');
    
    try {
        // Admin auth
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL || '',
            process.env.PB_ADMIN_PASSWORD || ''
        );

        // Update userProfiles collection
        await pb.collections.update('userProfiles', {
            listRule: "@request.auth.id != ''",
            viewRule: "@request.auth.id != '' && id = @request.auth.id",
            createRule: "@request.auth.id != '' && id = @request.auth.id",
            updateRule: "@request.auth.id != '' && id = @request.auth.id",
            deleteRule: "@request.auth.id != '' && id = @request.auth.id"
        });
        console.log('✅ Updated userProfiles collection rules');

        // Update other collections
        const collections = ['dailyTracking', 'measurements', 'weeklySummaries'];
        const commonRules = {
            listRule: "@request.auth.id != ''",
            viewRule: "@request.auth.id != '' && userId = @request.auth.id",
            createRule: "@request.auth.id != ''",
            updateRule: "@request.auth.id != '' && userId = @request.auth.id",
            deleteRule: "@request.auth.id != '' && userId = @request.auth.id"
        };

        for (const collection of collections) {
            await pb.collections.update(collection, commonRules);
            console.log(`✅ Updated ${collection} collection rules`);
        }

        console.log('\n🎉 Successfully updated all collection rules!');
        
    } catch (error) {
        console.error('❌ Error updating collection rules:', error);
        process.exit(1);
    }
}

updateCollectionRules();
