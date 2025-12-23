
import axios from 'axios';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_API_URL = 'https://www.googleapis.com/upload/drive/v3/files';

class GoogleDriveService {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private getAuthHeaders() {
    if (!this.accessToken) {
      throw new Error('Google Drive access token not set.');
    }
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  async listFiles() {
    try {
      const response = await axios.get(DRIVE_API_URL, {
        headers: this.getAuthHeaders(),
        params: {
          spaces: 'appDataFolder',
          fields: 'files(id, name)',
        },
      });
      return response.data.files;
    } catch (error) {
      console.error('Error listing Google Drive files:', error);
      return [];
    }
  }

  async createFile(fileName: string, content: object) {
    const metadata = {
      name: fileName,
      parents: ['appDataFolder'],
    };

    const formData = new FormData();
    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    formData.append(
      'file',
      new Blob([JSON.stringify(content)], { type: 'application/json' })
    );

    try {
      const response = await axios.post(
        `${DRIVE_UPLOAD_API_URL}?uploadType=multipart`,
        formData,
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating Google Drive file:', error);
      return null;
    }
  }

  async readFile(fileId: string) {
    try {
      const response = await axios.get(`${DRIVE_API_URL}/${fileId}`, {
        headers: this.getAuthHeaders(),
        params: {
          alt: 'media',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error reading Google Drive file:', error);
      return null;
    }
  }

  async updateFile(fileId: string, content: object) {
    try {
      const response = await axios.patch(
        `${DRIVE_UPLOAD_API_URL}/${fileId}?uploadType=media`,
        JSON.stringify(content),
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating Google Drive file:', error);
      return null;
    }
  }
}

export default new GoogleDriveService();
