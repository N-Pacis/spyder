// db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

const connectToDB = async () => {
  try {
    await client.connect();
    db = client.db(); // Default DB
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error(err);
  }
};

const searchInDB = async (collection, query) => {
  const result = await db.collection(collection).find(query).toArray();
  return result;
};

const getDB = () => db;

module.exports = { connectToDB, searchInDB, getDB };
