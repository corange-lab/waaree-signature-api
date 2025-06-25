const fs = require('fs');
const path = require('path');

let wasmInstance = null;

async function loadWasm() {
  if (wasmInstance) return wasmInstance;

  const wasmPath = path.resolve(__dirname, 'signature.wasm');
  const wasmBuffer = fs.readFileSync(wasmPath);

  const instance = await WebAssembly.instantiate(wasmBuffer, {
    env: {
      abort: () => console.error("WASM aborted"),
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

  if (!exports.begin_signature || !exports.end_signature || !exports.stackAlloc || !exports.memory) {
    throw new Error("Required exports not found in WASM");
  }

  const memory = exports.memory;
  const alloc = exports.stackAlloc;

  const stationPtr = writeStringToMemory(stationID, memory, alloc);
  const timestampPtr = writeStringToMemory(timestamp, memory, alloc);
  const timezonePtr = writeStringToMemory(timezone, memory, alloc);

  exports.begin_signature(stationPtr, timestampPtr, timezonePtr);
  const sigPtr = exports.end_signature();

  return readWasmString(memory, sigPtr);
}

async function listExportedFunctions() {
  const { exports } = await loadWasm();
  return Object.keys(exports);
}

module.exports = {
  generateSignature,
  listExportedFunctions
};
