import { put } from '@vercel/blob';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Only POST requests are allowed' }), { status: 405 });
  }

  const { searchParams } = new URL(req.url);
  console.log("ha req.url", req.url)
  console.log("ha search params",searchParams);
  const filename = searchParams.get('filename');
  const contentType = searchParams.get('contentType') || 'application/octet-stream';

  if (!filename) {
    return new Response(JSON.stringify({ message: 'Filename is required' }), { status: 400 });
  }

  try {
    // Read the binary data as an ArrayBuffer
    const arrayBuffer = await req.arrayBuffer();

    // Upload the file using Vercel Blob's 'put' method
    const blob = await put(filename, arrayBuffer, {
      access: 'public',
      contentType,  // Set contentType if provided
    });

    // Return the URL of the uploaded file
    console.log(JSON.stringify(blob))
    return new Response(JSON.stringify(blob), { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response(JSON.stringify({ message: 'Error uploading file' }), { status: 500 });
  }
}
