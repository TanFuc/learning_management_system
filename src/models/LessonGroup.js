import mongoose from 'mongoose';

const lessonGroupSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true });

const LessonGroup = mongoose.model('LessonGroup', lessonGroupSchema);

export default LessonGroup;
