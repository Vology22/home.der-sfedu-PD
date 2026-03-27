import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Включаем CORS для фронтенда
app.use(cors({
  origin: 'http://localhost:5173', // ваш Vite dev сервер
  credentials: true
}));

// Создаем папку для аватарок, если её нет
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для сохранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла: userId_ timestamp_ оригинальное имя
    const { userId } = req.body;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = `${userId}_${timestamp}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB лимит
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый формат изображения'));
    }
  }
});

// Endpoint для загрузки аватарки
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
  try {
    const file = req.file;
    const { userId } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    // Формируем URL для доступа к файлу
    const avatarUrl = `http://localhost:${PORT}/uploads/avatars/${file.filename}`;
    
    res.json({
      success: true,
      path: file.path,
      url: avatarUrl,
      filename: file.filename
    });
  } catch (error) {
    console.error('Ошибка при загрузке:', error);
    res.status(500).json({ error: 'Ошибка при сохранении файла' });
  }
});

app.delete('/api/delete-avatar/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Защита от path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadDir, safeFilename);
    
    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл не найден' });
    }
    
    // Удаляем файл
    fs.unlinkSync(filePath);
    
    console.log(`Avatar deleted: ${safeFilename}`);
    
    res.json({
      success: true,
      message: 'Аватарка успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка при удалении:', error);
    res.status(500).json({ error: 'Ошибка при удалении файла' });
  }
});

// Раздаем статические файлы (аватарки)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.listen(PORT, () => {
  console.log(`Avatar server running on http://localhost:${PORT}`);
});