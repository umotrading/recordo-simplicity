import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

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
      console.log(`Attempt ${attempt + 1}/${retries} for ${url}`);
      const response = await fetch(url, options);
      
      if (response.ok) {
        console.log(`Request successful on attempt ${attempt + 1}`);
        return response;
      }
      
      // If not ok, check if it's a retryable error
      if (response.status >= 500 || response.status === 429) {
        const errorText = await response.text();
        console.log(`Retryable error (${response.status}): ${errorText}`);
        lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        
        if (attempt < retries - 1) {
          console.log(`Waiting ${RETRY_DELAYS[attempt]}ms before retry...`);
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
      }
      
      return response; // Return non-retryable responses as-is
    } catch (error) {
      console.error(`Network error on attempt ${attempt + 1}:`, error);
      lastError = error as Error;
      
      if (attempt < retries - 1) {
        console.log(`Waiting ${RETRY_DELAYS[attempt]}ms before retry...`);
        await sleep(RETRY_DELAYS[attempt]);
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now();
  console.log('=== Upload to Drive Started ===');

  try {
    const { fileUrl } = await req.json()
    
    if (!fileUrl) {
      console.error('Error: No file URL provided');
      throw new Error('No file URL provided')
    }

    console.log('Processing file URL:', fileUrl);

    // Download the file from Supabase Storage with timeout
    console.log('Downloading file from storage...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let response: Response;
    try {
      response = await fetch(fileUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new Error('File download timed out after 30 seconds');
      }
      throw error;
    }
    
    if (!response.ok) {
      console.error('Failed to download file:', response.status, response.statusText);
      throw new Error(`Failed to download file from storage: ${response.status}`)
    }
    
    const fileBlob = await response.blob()
    console.log('File downloaded. Size:', fileBlob.size, 'bytes');

    // Check file size limit (10MB max for safety)
    if (fileBlob.size > 10 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 10MB');
    }

    // Get the filename from the URL
    const fileName = decodeURIComponent(fileUrl.split('/').pop() || 'receipt')
    console.log('File name:', fileName);

    // Parse Google Drive credentials
    const credentialsStr = Deno.env.get('GOOGLE_DRIVE_CREDENTIALS');
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');

    if (!credentialsStr) {
      console.error('Missing GOOGLE_DRIVE_CREDENTIALS');
      throw new Error('Missing Google Drive credentials');
    }
    
    if (!folderId) {
      console.error('Missing GOOGLE_DRIVE_FOLDER_ID');
      throw new Error('Missing Google Drive folder ID');
    }

    const credentials = JSON.parse(credentialsStr);

    if (!credentials.private_key || !credentials.client_email) {
      console.error('Invalid credentials structure');
      throw new Error('Invalid Google Drive credentials structure');
    }

    console.log('Getting OAuth token...');
    
    // Get Google OAuth2 token with retry
    const tokenResponse = await fetchWithRetry('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await createJWT(credentials),
      }),
    });

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      console.error('Failed to get access token:', tokenData);
      throw new Error('Failed to get access token from Google')
    }

    console.log('OAuth token obtained successfully');

    // Upload file to Google Drive with retry
    console.log('Uploading to Google Drive...');
    const formData = new FormData()
    formData.append('metadata', new Blob([JSON.stringify({
      name: fileName,
      parents: [folderId],
    })], { type: 'application/json' }))
    formData.append('file', fileBlob)

    const uploadResponse = await fetchWithRetry(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        body: formData,
      }
    );

    const uploadResult = await uploadResponse.json()

    if (!uploadResponse.ok) {
      console.error('Google Drive upload failed:', uploadResult);
      throw new Error(`Failed to upload to Google Drive: ${JSON.stringify(uploadResult)}`)
    }

    const duration = Date.now() - startTime;
    console.log(`=== Upload Complete in ${duration}ms ===`);
    console.log('File ID:', uploadResult.id);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        fileId: uploadResult.id,
        webViewLink: `https://drive.google.com/file/d/${uploadResult.id}/view`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`=== Upload Failed after ${duration}ms ===`);
    console.error('Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        details: 'Upload to Google Drive failed. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Helper function to create JWT
async function createJWT(credentials: { private_key: string; client_email: string }) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/drive.file',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encoder = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header))
  const payloadB64 = btoa(JSON.stringify(payload))
  const message = `${headerB64}.${payloadB64}`

  // Convert private key to proper format
  const privateKey = credentials.private_key.replace(/\\n/g, '\n')

  // Create signature
  const keyData = await crypto.subtle.importKey(
    'pkcs8',
    str2ab(atob(privateKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, ''))),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    keyData,
    encoder.encode(message)
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
  return `${message}.${signatureB64}`
}

// Helper function to convert string to ArrayBuffer
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length)
  const bufView = new Uint8Array(buf)
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}
