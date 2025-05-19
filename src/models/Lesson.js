import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  videoId: { type: String, required: true },
  lessonGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonGroup', required: true },
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
