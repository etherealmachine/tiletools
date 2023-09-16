export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      if (!reader.result) {
        reject(`error loading ${file}`);
      } else {
        resolve(reader.result as string);
      }
    });
    reader.readAsDataURL(file);
  });
}

export async function readFileAsBinaryString(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      if (!reader.result) {
        reject(`error loading ${file}`);
      } else {
        resolve(reader.result as string);
      }
    });
    reader.readAsBinaryString(file);
  });
}