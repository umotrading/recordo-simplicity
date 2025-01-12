import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileUrl } = await req.json()
    
    if (!fileUrl) {
      throw new Error('No file URL provided')
    }

    // Download the file from Supabase Storage
    const response = await fetch(fileUrl)
    if (!response.ok) {
      throw new Error('Failed to download file from storage')
    }
    const fileBlob = await response.blob()

    // Get the filename from the URL
    const fileName = fileUrl.split('/').pop()

    // Parse Google Drive credentials
    const credentials = JSON.parse(Deno.env.get('GOOGLE_DRIVE_CREDENTIALS') || '{}')
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')

    if (!credentials.private_key || !credentials.client_email || !folderId) {
      throw new Error('Missing required Google Drive credentials or folder ID')
    }

    // Get Google OAuth2 token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: await createJWT(credentials),
      }),
    })

    const { access_token } = await tokenResponse.json()

    if (!access_token) {
      throw new Error('Failed to get access token')
    }

    // Upload file to Google Drive
    const formData = new FormData()
    formData.append('metadata', new Blob([JSON.stringify({
      name: fileName,
      parents: [folderId],
    })], { type: 'application/json' }))
    formData.append('file', fileBlob)

    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
      body: formData,
    })

    const uploadResult = await uploadResponse.json()

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to Google Drive: ${JSON.stringify(uploadResult)}`)
    }

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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Helper function to create JWT
async function createJWT(credentials: any) {
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