import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase';
import { IStorageService } from '../interfaces';

export class FirebaseStorageAdapter implements IStorageService {
  async uploadFile(path: string, file: Blob, mimeType?: string): Promise<string> {
    const fileRef = ref(storage, path);
    const metadata = mimeType ? { contentType: mimeType } : undefined;
    const snapshot = await uploadBytes(fileRef, file, metadata);
    return getDownloadURL(snapshot.ref);
  }

  async getDownloadUrl(path: string): Promise<string> {
    const fileRef = ref(storage, path);
    return getDownloadURL(fileRef);
  }
}
