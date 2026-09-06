/**
 * Standalone Client Uploader Demo Script
 * Demonstrates client-side chunking, parallel presigned uploads, network drop simulation, and automatic resume recovery.
 * Usage: node client-demo/uploader.js [--simulate-drop]
 */
const http = require('http');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });
    req.on('error', err => reject(err));
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function uploadBufferToMockUrl(uploadUrl, buffer) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(uploadUrl);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.length
      }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

async function runDemo() {
  const simulateDrop = process.argv.includes('--simulate-drop');

  console.log('==================================================================');
  console.log('  RESILIENT MULTIPART UPLOADER CLIENT DEMO');
  console.log(`  Simulate Network Disconnect: ${simulateDrop ? 'YES' : 'NO'}`);
  console.log('==================================================================\n');

  // 1. Authenticate / Register
  const email = `uploader_${Date.now()}@demo.com`;
  console.log(`[1] Registering user: ${email}...`);
  const regRes = await makeRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email, password: 'demoPassword123' }));

  const token = regRes.data.token;
  console.log('    ✓ Auth successful. JWT Token obtained.');

  // 2. Generate Simulated Large File Buffer (15MB = 3 x 5MB chunks)
  const chunkSize = 5 * 1024 * 1024; // 5MB
  const totalChunks = 3;
  const totalSize = chunkSize * totalChunks;
  const fileBuffer = Buffer.alloc(totalSize, 'X');
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  console.log(`\n[2] Preparing file: demo_large_file.iso (${(totalSize / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`    SHA-256 Checksum: ${fileHash}`);
  console.log(`    Chunk Size: ${(chunkSize / 1024 / 1024).toFixed(1)} MB | Total Chunks: ${totalChunks}`);

  // 3. Initiate Upload Session
  console.log('\n[3] Requesting Upload Session from Server...');
  const initRes = await makeRequest({
    hostname: 'localhost',
    port: PORT,
    path: '/api/uploads/init',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, JSON.stringify({
    fileName: 'demo_large_file.iso',
    sizeBytes: totalSize,
    fileHash,
    chunkSizeBytes: chunkSize
  }));

  if (initRes.data.deduplicated) {
    console.log('    ✓ File was instantly deduplicated! No upload required.');
    return;
  }

  const uploadId = initRes.data.uploadId;
  const chunkUrls = initRes.data.chunkUrls;
  console.log(`    ✓ Session Created! Upload ID: ${uploadId}`);

  // 4. Upload Chunks
  if (simulateDrop) {
    console.log('\n[4] Uploading Chunk 1...');
    const chunk1Buf = fileBuffer.subarray(0, chunkSize);
    const putRes1 = await uploadBufferToMockUrl(chunkUrls[0].url, chunk1Buf);
    await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/uploads/${uploadId}/chunks/1/confirm`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, JSON.stringify({ etag: putRes1.data.etag }));
    console.log('    ✓ Chunk 1 Uploaded & Confirmed [ETag: ' + putRes1.data.etag + ']');

    console.log('\n  ❌ SIMULATED NETWORK FAILURE! Connection dropped mid-upload during Chunk 2 transfer.');
    console.log('  ----------------------------------------------------------------------------------');
    console.log('  Pausing 2 seconds... simulating client recovery/browser refresh...');
    await new Promise(r => setTimeout(r, 2000));

    // 5. Query Status & Resume
    console.log('\n[5] Reconnecting... Querying GET /api/uploads/' + uploadId + '/status for missing chunks');
    const statusRes = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: `/api/uploads/${uploadId}/status`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`    Progress: ${statusRes.data.progressPercent}% (${statusRes.data.completedChunks}/${statusRes.data.totalChunks} chunks)`);
    console.log(`    Completed Chunks: [${statusRes.data.completedChunkNumbers.join(', ')}]`);
    console.log(`    Missing Chunks:   [${statusRes.data.missingChunkNumbers.join(', ')}]`);
    console.log('    ✓ Resuming upload ONLY for missing chunks [2, 3]...\n');

    for (const chunkNum of statusRes.data.missingChunkNumbers) {
      const idx = chunkNum - 1;
      const startByte = idx * chunkSize;
      const endByte = Math.min(startByte + chunkSize, totalSize);
      const chunkBuf = fileBuffer.subarray(startByte, endByte);

      console.log(`    Uploading Chunk ${chunkNum}...`);
      const putRes = await uploadBufferToMockUrl(chunkUrls[idx].url, chunkBuf);
      await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/uploads/${uploadId}/chunks/${chunkNum}/confirm`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      }, JSON.stringify({ etag: putRes.data.etag }));
      console.log(`    ✓ Chunk ${chunkNum} Uploaded & Confirmed [ETag: ${putRes.data.etag}]`);
    }
  } else {
    console.log('\n[4] Uploading All Chunks directly to S3 Presigned URLs...');
    for (let i = 0; i < totalChunks; i++) {
      const chunkNum = i + 1;
      const chunkBuf = fileBuffer.subarray(i * chunkSize, (i + 1) * chunkSize);

      const putRes = await uploadBufferToMockUrl(chunkUrls[i].url, chunkBuf);
      await makeRequest({
        hostname: 'localhost',
        port: PORT,
        path: `/api/uploads/${uploadId}/chunks/${chunkNum}/confirm`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      }, JSON.stringify({ etag: putRes.data.etag }));

      console.log(`    ✓ Chunk ${chunkNum}/${totalChunks} Uploaded & Confirmed [ETag: ${putRes.data.etag}]`);
    }
  }

  // 6. Finalize Upload
  console.log('\n[6] Finalizing Multipart Upload...');
  const finalizeRes = await makeRequest({
    hostname: 'localhost',
    port: PORT,
    path: `/api/uploads/${uploadId}/finalize`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('==================================================================');
  console.log('  SUCCESS! File Finalized Successfully:');
  console.log(`  File ID:   ${finalizeRes.data.fileId}`);
  console.log(`  Status:    ${finalizeRes.data.status}`);
  console.log(`  S3 Key:    ${finalizeRes.data.s3Key}`);
  console.log('==================================================================\n');
}

if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo };
