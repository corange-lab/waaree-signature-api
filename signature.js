const fs = require('fs');
const path = require('path');

// Load and instantiate the WASM file
async function loadWasm() {
  const wasmPath = path.resolve(__dirname, 'signature.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);

  const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
    env: {
      abort: () => console.log("WASM aborted"),
    }
  });

  return wasmModule.instance;
}

// Convert string to WASM memory and return pointer
function writeStringToMemory(str, memory, allocFn) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str + '\0');
  const ptr = allocFn(bytes.length);
  const memoryView = new Uint8Array(memory.buffer, ptr, bytes.length);
  memoryView.set(bytes);
  return ptr;
}

// Main signature generation function
async function generateSignature(stationID, timestamp, timezone) {
  const instance = await loadWasm();
  const { memory, begin_signature, end_signature, stackAlloc } = instance.exports;

  // Convert inputs into WASM memory
  const stationPtr = writeStringToMemory(stationID, memory, stackAlloc);
  const timePtr = writeStringToMemory(timestamp, memory, stackAlloc);
  const tzPtr = writeStringToMemory(timezone, memory, stackAlloc);

  // Call WASM logic
  begin_signature(stationPtr, timePtr, tzPtr);
  const sigPtr = end_signature();

  // Read signature string from memory
  const signature = readWasmString(memory, sigPtr);
  return signature;
}

// Helper to decode null-terminated string
function readWasmString(memory, ptr) {
  const view = new Uint8Array(memory.buffer);
  let str = '';
  while (view[ptr] !== 0) {
    str += String.fromCharCode(view[ptr]);
    ptr++;
  }
  return str;
}

module.exports = {
  generateSignature
};
