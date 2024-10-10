const mongoose = require('mongoose');
const projectModel = require("./src/project/projectModel"); // Adjust path as needed

async function migrate() {
  try {
    await mongoose.connect("mongodb://localhost:27017/inflaplex", { useNewUrlParser: true, useUnifiedTopology: true });
    await projectModel.createIndex({ latitude: 1, longitude: 1 });
    console.log('Migration completed: Index created successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Migration error:', error);
  }
}

migrate();
