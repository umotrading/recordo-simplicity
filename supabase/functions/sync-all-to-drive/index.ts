import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];
const BATCH_SIZE = 5; // Process 5 files at a time

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      if (response.status >= 500 || response.status === 429) {
        lastError = new Error(`HTTP ${response.status}`);
        if (attempt < retries - 1) {
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries - 1) {
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now();
  console.log('=== Sync All to Drive Started ===');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all user folders (each user has their own folder)
    console.log('Listing user folders...');
    const { data: folders, error: foldersError } = await supabase.storage
      .from('receipts')
      .list('', { limit: 100 });

    if (foldersError) {
      console.error('Error listing folders:', foldersError);
      throw new Error(`Failed to list folders: ${foldersError.message}`);
    }

    console.log('Found', folders?.length || 0, 'items in root');

    // Collect all files from all user folders
    const allFiles: { path: string; name: string }[] = [];
    
    for (const item of folders || []) {
      // Check if this is a folder (user_id folder) - folders have no metadata.size
      if (item.id && !item.metadata?.size) {
        console.log('Processing user folder:', item.name);
        
        // List files inside user folder
        const { data: userFiles, error: userFilesError } = await supabase.storage
          .from('receipts')
          .list(item.name, { limit: 100 });
        
        if (userFilesError) {
          console.error(`Error listing files in ${item.name}:`, userFilesError);
          continue;
        }
        
        console.log(`Found ${userFiles?.length || 0} files in folder ${item.name}`);
        
        for (const file of userFiles || []) {
          // Only process actual files (with size)
          if (file.metadata?.size) {
            allFiles.push({
              path: `${item.name}/${file.name}`,
              name: file.name
            });
          }
        }
      } else if (item.metadata?.size) {
        // This is a file in root (shouldn't happen but handle it)
        allFiles.push({
          path: item.name,
          name: item.name
        });
      }
    }

    console.log('Total files to process:', allFiles.length);

    if (allFiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No files found to sync',
          results: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Google Drive credentials
    const credentialsStr = Deno.env.get('GOOGLE_DRIVE_CREDENTIALS');
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');

    if (!credentialsStr || !folderId) {
      throw new Error('Missing Google Drive configuration');
    }

    const credentials = JSON.parse(credentialsStr);

    // Get OAuth token
    console.log('Getting OAuth token...');
    const tokenResponse = await fetchWithRetry('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await createJWT(credentials),
      }),
    });

    const { access_token } = await tokenResponse.json();
    if (!access_token) {
      throw new Error('Failed to get access token');
    }

    // Check existing files in Google Drive to avoid duplicates
    console.log('Checking existing files in Google Drive...');
    const existingFiles = new Set<string>();
    
    const driveListResponse = await fetchWithRetry(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(name)&pageSize=1000`,
      {
        headers: { 'Authorization': `Bearer ${access_token}` },
      }
    );
    
    if (driveListResponse.ok) {
      const driveData = await driveListResponse.json();
      for (const file of driveData.files || []) {
        existingFiles.add(file.name);
      }
      console.log('Existing files in Drive:', existingFiles.size);
    }

    // Process files in batches
    const results: { file: string; status: string; error?: string }[] = [];
    
    for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
      const batch = allFiles.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allFiles.length / BATCH_SIZE)}`);
      
      const batchPromises = batch.map(async (file) => {
        try {
          // Skip if already exists in Drive
          if (existingFiles.has(file.name)) {
            console.log(`Skipping ${file.name} - already in Drive`);
            return { file: file.path, status: 'skipped', error: 'Already exists in Drive' };
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('receipts')
            .getPublicUrl(file.path);

          console.log(`Downloading ${file.path}...`);
          
          // Download file with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);
          
          const fileResponse = await fetch(urlData.publicUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (!fileResponse.ok) {
            throw new Error(`Failed to download: ${fileResponse.status}`);
          }
          
          const fileBlob = await fileResponse.blob();
          console.log(`Downloaded ${file.name}: ${fileBlob.size} bytes`);

          // Upload to Google Drive
          const formData = new FormData();
          formData.append('metadata', new Blob([JSON.stringify({
            name: file.name,
            parents: [folderId],
          })], { type: 'application/json' }));
          formData.append('file', fileBlob);

          const uploadResponse = await fetchWithRetry(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${access_token}` },
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorData}`);
          }

          const uploadResult = await uploadResponse.json();
          console.log(`Uploaded ${file.name} successfully. ID: ${uploadResult.id}`);
          
          return { file: file.path, status: 'success' };
        } catch (error) {
          console.error(`Error processing ${file.path}:`, error);
          return { file: file.path, status: 'error', error: (error as Error).message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < allFiles.length) {
        await sleep(500);
      }
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`=== Sync Complete in ${duration}ms ===`);
    console.log(`Success: ${successCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        message: `Sync complete. ${successCount} uploaded, ${skippedCount} skipped, ${errorCount} errors.`,
        results,
        stats: { success: successCount, skipped: skippedCount, errors: errorCount }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`=== Sync Failed after ${duration}ms ===`);
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        details: 'Sync to Google Drive failed. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to create JWT
async function createJWT(credentials: { private_key: string; client_email: string }) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  const message = `${headerB64}.${payloadB64}`;

  const privateKey = credentials.private_key.replace(/\\n/g, '\n');
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    str2ab(atob(privateKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, ''))),
    { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    keyData,
    encoder.encode(message)
  );

  return `${message}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
}

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
