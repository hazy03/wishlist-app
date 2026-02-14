# ⚡ Быстрый деплой за 15 минут

## 🎯 Для демонстрации руководителю

### 1️⃣ Frontend → Vercel (5 минут)

1. Зайдите на [vercel.com](https://vercel.com) → войдите через GitHub
2. Нажмите "New Project" → выберите ваш репозиторий
3. Настройки:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Environment Variables (добавьте после деплоя backend):
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_WS_URL=wss://your-backend.onrender.com
   ```
5. Нажмите "Deploy"
6. ✅ Получите URL: `your-app.vercel.app`

---

### 2️⃣ Backend → Render (7 минут)

1. Зайдите на [render.com](https://render.com) → войдите через GitHub
2. "New +" → "Web Service" → выберите репозиторий
3. Настройки:
   - **Name:** `wishlist-api`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   ```
   DATABASE_URL=ваш-supabase-url
   SECRET_KEY=любой-длинный-случайный-ключ
   ALLOWED_ORIGINS=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Нажмите "Create Web Service"
6. ✅ Получите URL: `your-api.onrender.com`

---

### 3️⃣ Обновить переменные (3 минуты)

1. **В Render:** обновите `ALLOWED_ORIGINS` и `FRONTEND_URL` на URL Vercel
2. **В Vercel:** обновите `VITE_API_URL` и `VITE_WS_URL` на URL Render
3. Перезапустите оба сервиса

---

## ✅ Готово!

**Ваши ссылки:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-api.onrender.com/docs`

**Покажите руководителю:**
1. Главную страницу
2. Регистрацию/вход
3. Создание вишлиста
4. Публичную ссылку
5. Реалтайм обновления

---

## 🆘 Если что-то не работает

1. Проверьте логи в Render (вкладка "Logs")
2. Проверьте, что все переменные окружения установлены
3. Убедитесь, что CORS настроен правильно
4. Проверьте, что база данных Supabase активна

---

## 📝 Чеклист

- [ ] Frontend на Vercel
- [ ] Backend на Render
- [ ] Переменные окружения настроены
- [ ] Можно зарегистрироваться
- [ ] Можно создать вишлист
- [ ] Публичная ссылка работает

**Время деплоя: ~15 минут** ⏱️

