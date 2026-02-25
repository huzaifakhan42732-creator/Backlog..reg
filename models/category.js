const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });

// Virtual populate to get subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Instance method: get all subcategories (including nested)
categorySchema.methods.getAllSubcategories = async function() {
  const subcategories = await this.model('Category').find({ parentCategory: this._id });
  let all = [...subcategories];
  for (let sub of subcategories) {
    const deeper = await sub.getAllSubcategories();
    all = all.concat(deeper);
  }
  return all;
};

// Ensure virtuals are included in JSON/output
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);