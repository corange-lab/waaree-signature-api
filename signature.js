const fs = require('fs');
const path = require('path');

let wasmInstance = null;

async function loadWasm() {
  if (wasmInstance) return wasmInstance;

  const wasmPath = path.resolve(__dirname, 'signature.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);

  const instance = await WebAssembly.instantiate(wasmBuffer, {
    env: {
      abort: () => console.error("WASM aborted")
    }
  });

  wasmInstance = instance.instance;
  return wasmInstance;
}

function writeStringToMemory(str, memory, allocFn) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str + '\0');
  const ptr = allocFn(bytes.length);
  const view = new Uint8Array(memory.buffer, ptr, bytes.length);
  view.set(bytes);
  return ptr;
}

function readWasmString(memory, ptr) {
  const view = new Uint8Array(memory.buffer);
  let str = '';
  while (view[ptr] !== 0) {
    str += String.fromCharCode(view[ptr]);
    ptr++;
  }
  return str;
}

async function generateSignature(stationID, timestamp, timezone) {
  const { exports } = await loadWasm();

  const memory = exports.memory;
  const stackAlloc = exports.stackAlloc;
  const begin = exports.begin_signature;
  const end = exports.end_signature;

  // Write strings to WASM memory
  const stationPtr = writeStringToMemory(stationID, memory, stackAlloc);
  const timestampPtr = writeStringToMemory(timestamp, memory, stackAlloc);
  const timezonePtr = writeStringToMemory(timezone, memory, stackAlloc);

  // Call WASM functions
  begin(stationPtr, timestampPtr, timezonePtr);
  const resultPtr = end();

  // Read back result string
  const signature = readWasmString(memory, resultPtr);
  return signature;
}

module.exports = { generateSignature };
