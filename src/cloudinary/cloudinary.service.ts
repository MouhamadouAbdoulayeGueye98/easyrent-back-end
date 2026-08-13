import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import 'multer';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File) {
    return new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'easyrent/properties',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error('Upload Cloudinary échoué'));
            return;
          }

          resolve({
            secure_url: result.secure_url,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}