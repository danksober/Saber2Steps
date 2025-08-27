import type JSZip from 'jszip';

export function readFileSync<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // This function will be called once the file has been read
    reader.onload = () => {
      resolve(JSON.parse(reader.result as string) as T); // Return the file content
    };

    // In case of error, reject the promise
    reader.onerror = (error) => {
      reject(error);
    };

    // Start reading the file as text (can also be read as Data URL, Binary String, etc.)
    reader.readAsText(file);
  });
}

export async function convertToFile(
  zipEntry: JSZip.JSZipObject,
): Promise<File | undefined> {
  if (!zipEntry) {
    return;
  }
  // Extract the file data as a Blob (use "blob" format)
  const blob = await zipEntry.async('blob');

  // Create a File object from the Blob
  const file = new File([blob], zipEntry.name, { type: blob.type });

  return file;
}
