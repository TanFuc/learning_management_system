const multipleToObject = (mongooses) => {
  return mongooses.map((mongoose) => mongoose.toObject());
};

const toObject = (mongoose) => {
  return mongoose ? mongoose.toObject() : mongoose;
};
export { multipleToObject, toObject };
