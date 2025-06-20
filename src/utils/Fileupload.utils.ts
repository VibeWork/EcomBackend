
//Utils/FileUpload.util.ts
import cloudinary from 'cloudinary';
import { config } from 'dotenv';

// Load environment variables
config();

const Cloudinary = cloudinary.v2;

// Configure Cloudinary with environment variables
Cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// console.log('Cloudinary Config:', {
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET
// });

export const cloudinaryImageUploadMethod = async (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    Cloudinary.uploader.upload(
      file,
      { folder: '/body-clone' },
      (err: Error | undefined, res: { secure_url: string } | undefined) => {
        if (err) {
          console.error('Cloudinary Upload Error:', err);
          return reject(`Upload image error: ${err.message}`);
        }
        if (!res) {
          return reject('No response from Cloudinary');
        }
        resolve(res.secure_url);
      }
    );
  });
};
