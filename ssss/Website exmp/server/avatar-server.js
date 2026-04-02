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

// Включаем CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Создаем папку для аватарок, если её нет
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

console.log('Upload directory:', uploadDir);

// Настройка multer для временного хранения
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const tempName = `temp_${timestamp}${ext}`;
    console.log('[filename] Temporary name:', tempName);
    cb(null, tempName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
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
    console.log('=== UPLOAD AVATAR ENDPOINT ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const file = req.file;
    const { userId } = req.body;

    console.log('Extracted userId from body:', userId);

    if (!file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const oldPath = file.path;
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    
    // Используем userId для имени файла
    let safeUserId = userId;
    if (!safeUserId || safeUserId === 'undefined' || safeUserId === 'null' || safeUserId === '') {
      safeUserId = 'user';
    }
    
    const newFilename = `${safeUserId}_${timestamp}${ext}`;
    const newPath = path.join(uploadDir, newFilename);
    
    console.log('Renaming file:', { oldPath, newPath, newFilename });
    
    fs.renameSync(oldPath, newPath);
    
    console.log('File saved as:', newFilename);
    
    // Формируем URL для доступа к файлу
    const avatarUrl = `http://localhost:${PORT}/uploads/avatars/${newFilename}`;
    
    res.json({
      success: true,
      path: newPath,
      url: avatarUrl,
      filename: newFilename
    });
  } catch (error) {
    console.error('Ошибка при загрузке:', error);
    res.status(500).json({ error: 'Ошибка при сохранении файла' });
  }
});

// Endpoint для удаления аватарки
app.delete('/api/delete-avatar/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    console.log('=== DELETE AVATAR ENDPOINT ===');
    console.log('Filename to delete:', filename);
    
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadDir, safeFilename);
    
    console.log('Full path:', filePath);
    
    // Проверяем, существует ли файл
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
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
  console.log(`Upload directory: ${uploadDir}`);
});