import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const garmentSchema = new mongoose.Schema({
  name: String,
  referenceImages: Array,
  customerImages: Array,
  customerClothImages: Array
}, { strict: false, collection: 'garments' });

const Garment = mongoose.model('Garment', garmentSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    const garments = await Garment.find({
        $or: [
            { "referenceImages.0": { $exists: true } },
            { "customerImages.0": { $exists: true } }
        ]
    }).sort({ updatedAt: -1 }).limit(3);
    
    console.log("Recently updated garments with images:");
    garments.forEach(g => {
      console.log(`\nGarment ID: ${g._id} (${g.name})`);
      console.log("Reference Images:", JSON.stringify(g.referenceImages, null, 2));
      console.log("Customer Images:", JSON.stringify(g.customerImages, null, 2));
    });
    
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}

check();
