# Настройка Google OAuth

## Backend настройка

1. **Получите Google OAuth credentials:**
   - Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
   - Создайте новый проект или выберите существующий
   - Включите Google+ API
   - Перейдите в "Credentials" → "Create Credentials" → "OAuth client ID"
   - Выберите "Web application"
   - Добавьте Authorized redirect URIs:
     - Для разработки: `http://localhost:8000/api/auth/google/callback`
     - Для продакшена: `https://your-backend-url.com/api/auth/google/callback`

2. **Добавьте в `.env` файл:**
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   FRONTEND_URL=http://localhost:5173  # или ваш production URL
   ```

3. **Установите зависимости:**
   ```bash
   pip install -r requirements.txt
   ```

## Frontend настройка

Frontend уже настроен и готов к работе. Кнопка "Continue with Google" появится на страницах Login и Register.

## Как это работает

1. Пользователь нажимает "Continue with Google"
2. Перенаправление на Google для авторизации
3. Google перенаправляет обратно на `/api/auth/google/callback`
4. Backend создает/обновляет пользователя и генерирует JWT токен
5. Пользователь перенаправляется на `/auth/callback?token=...`
6. Frontend сохраняет токен и перенаправляет на Dashboard

## Проверка публичных ссылок

Публичные ссылки работают **без регистрации**:
- Формат: `/w/{slug}`
- Пример: `http://localhost:5173/w/wishlist-abc123`
- Любой пользователь может просматривать вишлисты по публичной ссылке
- Для резервирования/вклада требуется ввод имени (guest_name)

## Troubleshooting

### OAuth не работает
- Проверьте, что `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` установлены в `.env`
- Убедитесь, что redirect URI в Google Console совпадает с вашим backend URL
- Проверьте логи backend для ошибок

### Публичная ссылка не открывается
- Убедитесь, что вишлист существует
- Проверьте формат URL: `/w/{slug}`
- Проверьте, что backend доступен и работает

