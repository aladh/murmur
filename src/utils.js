import base32 from 'hi-base32';
import dropbox from './storage/Dropbox';

const bufferFromBlob = async function(blob) {
  let reader = new FileReader();
  reader.readAsArrayBuffer(blob);

  await new Promise((resolve) => {
    let interval =
      setInterval(() => {
        if(reader.readyState === 2) {
          clearInterval(interval);
          resolve()
        }
      }, 100)
  });

  return reader.result
};

const encrypt = async function(buffer) {
  let iv = window.crypto.getRandomValues(new Uint8Array(12));
  let key = await window.crypto.subtle.generateKey({name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]);
  let encrypted = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, buffer);
  let jwk = await window.crypto.subtle.exportKey("jwk", key);

  return {iv, jwk: jwk.k, encrypted, key}
};

const decrypt = async function(buffer, key, iv) {
  return await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, buffer);
};

function removePadding(s) {
  return s.endsWith('=') ? removePadding(s.slice(0, s.length - 1)) : s
}

const encryptedFilename = async function(filename, iv, key) {
  let encryptedBuffer = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, new TextEncoder().encode(filename));
  let encryptedBufferArray = Array.from(new Uint8Array(encryptedBuffer));
  let encryptedString = encryptedBufferArray.map(byte => String.fromCharCode(byte)).join('');
  let base32String = base32.encode(encryptedString);

  return removePadding(base32String.toLowerCase())
};

const importKey = async function(jwk) {
  return await window.crypto.subtle.importKey("jwk", {kty: "oct", k: jwk, alg: "A256GCM", ext: true}, {name: "AES-GCM"}, false, ["encrypt", "decrypt"]);
};

function addPadding(s) {
  let paddingLength = 8 - (s.length % 8);
  let padding = '========';
  return `${s}${padding.slice(0, paddingLength)}`
}

const decryptedFilename = async function(encryptedFilename, iv, key) {
  let encryptedText = base32.decode(addPadding(encryptedFilename.toUpperCase()));
  let encryptedBuffer = new Uint8Array(encryptedText.split('').map(ch => ch.charCodeAt(0)));
  let decryptedBuffer = await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, encryptedBuffer);

  return new TextDecoder().decode(decryptedBuffer)
};

const saveToDisk = function(blob, filename) {
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const baseURL = function() {
  return process.env.NODE_ENV === 'production' ? 'https://biimer.com/' : 'http://localhost:8081/'
};

export default {bufferFromBlob, encrypt, encryptedFilename, importKey,
                decrypt, decryptedFilename, saveToDisk, dropbox, baseURL};
