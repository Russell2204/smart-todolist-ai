# Smart ToDoList с AI-приоритезацией (Google Gemini)

Интеллектуальное веб-приложение для управления задачами с автоматическим анализом, матрицей Эйзенхауэра и расстановкой приоритетов на базе **Google Gemini API** (`@google/genai`).

🌐 **Production URL (Vercel):** [https://smart-ai-todolist.vercel.app](https://smart-ai-todolist.vercel.app)  
🐘 **Database (Neon PostgreSQL):** `smart-ai-todolist` на базе Neon Serverless Driver  
🚀 **Хостинг:** Vercel (Next.js 15 App Router)

![Smart ToDoList](https://img.shields.io/badge/Gemini_2.5_Flash-Ready-8b5cf6?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel_CLI-Deployed-000000?style=for-the-badge&logo=vercel)
![Neon](https://img.shields.io/badge/Neon_Postgres-Connected-00e599?style=for-the-badge&logo=postgresql)
![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)

---

## 🌟 Ключевые возможности

1. **🔐 Регистрация и авторизация (Auth):**
   - Полноценная аутентификация пользователей с хешированием паролей (`bcryptjs`) и защищенными сессиями через JWT (`jose`) в HTTP-only cookies.
   - Задачи каждого пользователя изолированы и сохраняются в облачной реляционной базе данных **Neon PostgreSQL**.
2. **🔑 Персональный Google Gemini API Key (BYOK):**
   - Каждый пользователь после регистрации привязывает свой собственный бесплатный `GEMINI_API_KEY` (через модальное окно или настройки).
   - Ключ сохраняется в профиле пользователя в базе данных Neon и используется для выполнения AI-запросов (приоритезация, декомпозиция, NLP).
   - Проверка валидности ключа в реальном времени.
3. **✨ Умное добавление (Smart Input & AI Auto-fill):**
   - Ввод задачи естественным языком (*«Подготовить квартальный отчет к пятнице»*).
   - Gemini автоматически рассчитывает дедлайн, выставляет приоритет, квадрант матрицы, теги и оценку времени.
4. **🪄 «Разобрать с AI» (Magic Sort & Prioritization):**
   - Глобальная перегруппировка активных задач по матрице Эйзенхауэра с расчетом индекса `aiScore` (1–100) и мотивационного пояснения `aiReasoning`.
   - Анимация свечения карточек во время анализа (Shimmer Effect) и плавное анимированное перестроение (Framer Motion).
   - Защита от спама (Cooldown / Rate limit на 30 секунд).
5. **🧩 Декомпозиция сложных задач на подзадачи:**
   - Кнопка *«Разбить на шаги»* генерирует 3–5 конкретных подзадач с чек-листом и прогресс-баром.
6. **📊 Два режима отображения:**
   - **Классический список:** Сортировка по AI-рейтингу (`aiScore`), дедлайнам или приоритету.
   - **Матрица Эйзенхауэра (2x2):** 4 квадранта (Q1: Сделать сейчас, Q2: Запланировать, Q3: Делегировать, Q4: Исключить) с возможностью быстрого перемещения задач между ними.
7. **🌓 Темная и светлая тема.**

---

## 🛠 Технический стек

* **Frontend & Backend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Zustand.
* **База данных:** **Neon PostgreSQL** через `@neondatabase/serverless`.
* **Хостинг:** **Vercel** через Vercel CLI.
* **AI SDK:** Официальный `@google/genai` с поддержкой Structured Outputs (`responseSchema`), модель `gemini-2.5-flash` (с fallback на `gemini-2.0-flash`).
* **Безопасность:** `bcryptjs` для хеширования паролей, `jose` для JWT-токенов в HTTP-only cookies.

---

## 💻 Работа через CLI

### 1. Neon CLI (`neonctl`)
```bash
# Просмотр проектов
npx neonctl projects list

# Получение строки подключения
npx neonctl connection-string --project-id withered-art-81829905
```

### 2. Vercel CLI (`vercel`)
```bash
# Связывание проекта с Vercel
npx vercel link

# Управление переменными окружения
npx vercel env ls
npx vercel env pull .env.local

# Деплой в продакшен
npx vercel --prod
```

---

## 🚀 Локальный запуск

1. Установка зависимостей:
   ```bash
   npm install
   ```
2. Настройка переменных в `.env.local`:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_...ep-muddy-bar-ba35o4yx.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="smart-todolist-super-secret-jwt-key-2026-secure"
   ```
3. Запуск сервера:
   ```bash
   npm run dev
   ```
   Откройте [http://localhost:3000](http://localhost:3000).
