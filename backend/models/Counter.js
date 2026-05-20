import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  sequence: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;
