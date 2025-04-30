import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Uploads an image file to Firebase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., 'salons', 'services')
 * @param customFileName Optional custom file name
 */
export const uploadImage = async (
  file: File,
  path: string,
  customFileName?: string
): Promise<string> => {
  try {
    // Generate file name
    const fileName = customFileName || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const fullPath = `${path}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Uploads multiple images to Firebase Storage
 * @param files Array of files to upload
 * @param path The storage path
 */
export const uploadMultipleImages = async (
  files: File[],
  path: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, path));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Deletes an image from Firebase Storage
 * @param url The full URL of the image to delete
 */
export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Extract the path from the URL
    // Firebase Storage URLs have this format: 
    // https://firebasestorage.googleapis.com/v0/b/[project-id].appspot.com/o/[path]?alt=media&token=[token]
    const decodedUrl = decodeURIComponent(url);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?alt=media');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Invalid Firebase Storage URL format');
    }
    
    const path = decodedUrl.substring(startIndex, endIndex);
    const storageRef = ref(storage, path);
    
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Replaces an image in Firebase Storage
 * @param oldUrl URL of the image to replace
 * @param newFile New file to upload
 * @param path Storage path
 */
export const replaceImage = async (
  oldUrl: string,
  newFile: File,
  path: string
): Promise<string> => {
  try {
    // Delete the old image if it exists
    if (oldUrl) {
      await deleteImage(oldUrl).catch(err => {
        console.warn('Failed to delete old image, continuing with upload:', err);
      });
    }
    
    // Upload the new image
    return await uploadImage(newFile, path);
  } catch (error) {
    console.error('Error replacing image:', error);
    throw error;
  }
};
