const getMime = (signature)=>{
  switch (signature) {
      case '89504E47':
          return 'image/png'
      case '47494638':
          return 'image/gif'
      case '25504446':
          return 'application/pdf'
      case '2320636F':
        return 'text/markdown'
      case 'D0CF11E0':
        return 'application/msword'
      case 'D0CF11E0A1B11AE1':
        return 'application/vnd/ms-excel'
      case '504B030414000600':
        return 'application/vnd/openxmlformats-officedocument.spreadsheetml.sheet' 
      case 'FFD8FFDB':
      case 'FFD8FFE0':
      case 'FFD8FFE1':
          return 'image/jpeg'
      case '504B0304':
          return 'application/zip'
      case '504B34':
          return 'application/zip'
      default:
          return 'Unknown filetype'
  } 
}

export async function getFileMetadata(entry): Promise<string> {
  return new Promise((resolve, reject) => {
    entry.file((file) => {
      let reader = new FileReader();

      reader.onload = () => {
        const uint = new Uint8Array(reader.result);
        let bytes = [];
        uint.forEach((byte) => {
          bytes.push(byte.toString(16));
        });
        const hex = bytes.join('').toUpperCase();
        const mimeType = getMime(hex);
        resolve(mimeType); // Resolve with the MIME type
      };

      reader.onerror = () => {
        reject(new Error(reader.error)); // Reject with an error
      };

      reader.readAsArrayBuffer(file.slice(0, 4));
    }, () => {
      reject(new Error("Unable to read file")); // Reject with an error
    });
  });
}


export async function getFile(entry): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('calling promise')
    entry.file((file) => {
      resolve(file)
    }, () => {
      reject(new Error("Unable to read file"));
    });
  });
}
