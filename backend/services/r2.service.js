// backend/services/r2.service.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class R2Service {
  constructor() {
    console.log("\n" + "=".repeat(30));
    console.log("🔧 INITIALIZING R2 SERVICE");
    console.log("=".repeat(30));
    
    // Debugging Env Variables
    console.log("📁 R2_ENDPOINT:", process.env.R2_ENDPOINT ? "✅ SET" : "❌ MISSING");
    console.log("🪣 R2_BUCKET:", process.env.R2_BUCKET || "❌ MISSING");
    console.log("🌐 R2_PUBLIC_URL:", process.env.R2_PUBLIC_URL || "❌ MISSING");

    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
      },
      forcePathStyle: true,
      maxAttempts: 3,
    });
    
    this.bucket = process.env.R2_BUCKET;
    this.publicUrl = process.env.R2_PUBLIC_URL;
  }

  /**
   * ✅ Generates a clean filename with folder structure
   */
  generateFileName(originalName, folder = 'misc') {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    const ext = originalName.split('.').pop();
    // Example: garments/1708892312-abcd.jpg
    return `${folder}/${timestamp}-${random}.${ext}`;
  }

  /**
   * ✅ Upload a single file (used for Fabrics/User Profile)
   */
  async uploadFile(file, folder = 'fabrics') {
    try {
      if (!file || !file.buffer) {
        throw new Error("File buffer is missing. Check Multer configuration.");
      }

      const key = this.generateFileName(file.originalname, folder);
      
      console.log(`\n📤 [SINGLE UPLOAD] Target: ${folder}`);
      console.log(`📝 Filename: ${file.originalname}`);
      console.log(`🔑 R2 Key: ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.client.send(command);
      
      console.log("✅ Upload Successful");
      return {
        success: true,
        key: key,
        url: `${this.publicUrl}/${key}`,
      };
    } catch (error) {
      console.error('❌ R2 single upload error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ New: Upload multiple files (Used for Garments & Work)
   * Essential for Cutting Master workflow
   */
  async uploadMultiple(files, folder = 'garments') {
    if (!files || files.length === 0) {
      console.log(`⚠️ No files provided for folder: ${folder}`);
      return [];
    }

    console.log(`\n📦 [MULTIPLE UPLOAD] Processing ${files.length} files in /${folder}...`);

    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      const results = await Promise.all(uploadPromises);
      
      // Filter only successful ones and return their data
      const successfulUploads = results
        .filter(r => r.success)
        .map(r => ({ key: r.key, url: r.url }));

      console.log(`✅ Successfully uploaded ${successfulUploads.length}/${files.length} files`);
      return successfulUploads;
    } catch (error) {
      console.error('❌ R2 multiple upload error:', error);
      return [];
    }
  }

  /**
   * ✅ Delete file from R2
   */
  async deleteFile(key) {
    if (!key) return { success: false, error: "No key provided" };

    try {
      console.log(`\n🗑️ [DELETE] Removing key: ${key}`);
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.client.send(command);
      console.log("✅ File deleted successfully from R2");
      
      return { success: true };
    } catch (error) {
      console.error('❌ R2 delete error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new R2Service();