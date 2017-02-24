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

export default {bufferFromBlob};
