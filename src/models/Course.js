import mongoose from 'mongoose';
import slugify from 'slugify';

const LessonSchema = new mongoose.Schema({
  order: Number,
  title: String,
  videoId: String,
});

const LessonGroupSchema = new mongoose.Schema({
  title: String,
  subLessons: [LessonSchema],
});

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
    lessons: [LessonGroupSchema],
  },
  { timestamp: true },
);

courseSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await mongoose.models.Course.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
