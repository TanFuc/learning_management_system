import mongoose from 'mongoose';
import slugify from 'slugify';

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    image: { type: String },
    videoId: { type: String },
    level: { type: String },
    duration: { type: String },
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    tags: [String],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentsCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamp: true },
);

courseSchema.pre('save', function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
