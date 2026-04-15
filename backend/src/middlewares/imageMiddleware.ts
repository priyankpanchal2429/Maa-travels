import multer from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';

// Use memory storage to process image in buffer
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed') as any, false);
    }
  },
});

/**
 * Middleware to compress and resize image, then convert to Base64.
 * Attaches the base64 string to req.body.photo.
 */
export const compressImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  try {
    const compressedBuffer = await sharp(req.file.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 }) // High quality JPEG
      .toBuffer();

    const base64Image = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    
    // Attach to body for controller to save
    req.body.photo = base64Image;
    
    next();
  } catch (error) {
    next(new Error('Failed to process image'));
  }
};
