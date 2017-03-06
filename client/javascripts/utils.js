import base32 from 'hi-base32';
import dropbox from '../../shared/dropbox';

const bufferFromBlob = async function(blob) {
  let reader = new FileReader();
  reader.readAsArrayBuffer(blob);

  await new Promise((resolve) => {
    let interval =
      setInterval(() => {
        if(reader.readyState == 2) {
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

const encryptedFileName = async function(fileName, iv, key) {
  let encryptedBuffer = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, new TextEncoder().encode(fileName));
  let encryptedBufferArray = Array.from(new Uint8Array(encryptedBuffer));
  let encryptedString = encryptedBufferArray.map(byte => String.fromCharCode(byte)).join('');

  return base32.encode(encryptedString)
};

const sha256 = async function(message) {
  const msgBuffer = new TextEncoder('utf-8').encode(message);                     // encode as UTF-8
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);            // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                       // convert ArrayBuffer to Array
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join(''); // convert bytes to hex string
  return hashHex;
};

const importKey = async function(jwk) {
  return await window.crypto.subtle.importKey("jwk", {kty: "oct", k: jwk, alg: "A256GCM", ext: true}, {name: "AES-GCM"}, false, ["encrypt", "decrypt"]);
};

const decryptedFileName = async function(encryptedFileName, iv, key) {
  let encryptedText = base32.decode(encryptedFileName);
  let encryptedBuffer = new Uint8Array(encryptedText.split('').map(ch => ch.charCodeAt(0)));
  let decryptedBuffer = await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, encryptedBuffer);

  return new TextDecoder().decode(decryptedBuffer)
};

const saveToDisk = function(blob, fileName) {
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

const baseURL = function() {
  return process.env.NODE_ENV == 'production' ? 'https://biimer.com/' : 'http://localhost:8081/'
};

export default {bufferFromBlob, encrypt, encryptedFileName, sha256, importKey,
                decrypt, decryptedFileName, saveToDisk, dropbox, baseURL};
