import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const { Schema } = mongoose;
const InvoiceSchema = new Schema({
  cat_name: {
    type: String,
    required: true,
    unique:true
  }, 
  avatar: {
    type: String,
    required: true,
  }, 
});

export default mongoose.model('shoplisting-cat', InvoiceSchema);
