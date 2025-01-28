import PocketBase from 'pocketbase';

async function updateCollectionRules() {
    const pb = new PocketBase('http://127.0.0.1:8090');
    
    try {
        // Admin auth
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL || '',
            process.env.PB_ADMIN_PASSWORD || ''
        );

        // Define collections and their rules
        const collections = [
            {
                name: 'userProfiles',
                rules: {
                    listRule: "@request.auth.id != ''",
                    viewRule: "@request.auth.id != '' && id = @request.auth.id",
                    createRule: "@request.auth.id != '' && id = @request.auth.id",
                    updateRule: "@request.auth.id != '' && id = @request.auth.id",
                    deleteRule: "@request.auth.id != '' && id = @request.auth.id"
                }
            },
            {
                name: 'dailyTracking',
                rules: {
                    listRule: "@request.auth.id != '' && userId = @request.auth.id",
                    viewRule: "@request.auth.id != '' && userId = @request.auth.id",
                    createRule: "@request.auth.id != ''",
                    updateRule: "@request.auth.id != '' && userId = @request.auth.id",
                    deleteRule: "@request.auth.id != '' && userId = @request.auth.id"
                }
            },
            {
                name: 'measurements',
                rules: {
                    listRule: "@request.auth.id != '' && userId = @request.auth.id",
                    viewRule: "@request.auth.id != '' && userId = @request.auth.id",
                    createRule: "@request.auth.id != ''",
                    updateRule: "@request.auth.id != '' && userId = @request.auth.id",
                    deleteRule: "@request.auth.id != '' && userId = @request.auth.id"
                }
            },
            {
                name: 'weeklySummaries',
                rules: {
                    listRule: "@request.auth.id != '' && userId = @request.auth.id",
                    viewRule: "@request.auth.id != '' && userId = @request.auth.id",
                    createRule: "@request.auth.id != ''",
                    updateRule: "@request.auth.id != '' && userId = @request.auth.id",
                    deleteRule: "@request.auth.id != '' && userId = @request.auth.id"
                }
            }
        ];

        // Update each collection
        for (const collection of collections) {
            try {
                // Get existing collection
                const existingCollection = await pb.collections.getOne(collection.name);
                
                // Update only the rules while preserving other fields
                await pb.collections.update(collection.name, {
                    ...existingCollection,
                    ...collection.rules
                });
                
                console.log(`✅ Updated ${collection.name} collection rules`);
            } catch (error) {
                console.error(`❌ Error updating ${collection.name}:`, error.response?.data?.message || error.message);
                if (error.response?.data?.data) {
                    console.error('Validation errors:', JSON.stringify(error.response.data.data, null, 2));
                }
            }
        }

        console.log('\n🎉 Successfully finished updating collection rules!');
        
    } catch (error) {
        console.error('❌ Authentication error:', error);
        process.exit(1);
    }
}

updateCollectionRules();
