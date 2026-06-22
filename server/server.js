require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo-app';

app.use(cors());
app.use(express.json());

app.use('/api/todos', todoRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB 连接成功');
    app.listen(PORT, () => console.log(`服务器已启动: http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB 连接失败:', err.message);
    process.exit(1);
  });
