# Smart ToDoList с AI-приоритезацией (Google Gemini)

Интеллектуальное веб-приложение для управления задачами с автоматическим анализом, матрицей Эйзенхауэра и расстановкой приоритетов на базе **Google Gemini API** (`@google/genai`).

![Smart ToDoList](https://img.shields.io/badge/Gemini_2.5_Flash-Ready-8b5cf6?style=for-the-badge)
![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)

---

## 🌟 Ключевые возможности

1. **✨ Умное добавление (Smart Input & AI Auto-fill):**
   - Введите задачу естественным языком, например: *"Подготовить квартальный отчет к пятнице"*.
   - Gemini автоматически выделит дедлайн, назначит приоритет, оценит затраты времени и сгенерирует теги.
2. **🪄 «Разобрать с AI» (Magic Sort & Prioritization):**
   - Глобальная перегруппировка активных задач по матрице Эйзенхауэра.
   - Вычисление индекса важности `aiScore` (1–100) и мотивирующее объяснение `aiReasoning` для каждого пункта.
   - Защита от перегрузки (Rate limiting / Cooldown на 30 секунд).
   - Эффект свечения карточек во время анализа (Shimmer Effect) и плавная анимация перестроения (Framer Motion).
3. **🧩 Декомпозиция сложных задач на подзадачи:**
   - Кнопка *«Разбить на шаги»* генерирует 3–5 конкретных шагов для выполнения задачи за один подход.
4. **📊 Два режима отображения:**
   - **Классический список:** Сортировка по AI-рейтингу (`aiScore`), дедлайнам или приоритету.
   - **Матрица Эйзенхауэра (2x2):** Разделение на 4 квадранта (Q1: Сделать сейчас, Q2: Запланировать, Q3: Делегировать, Q4: Исключить) с возможностью быстрого перемещения.
5. **⚙️ Гибкая настройка API ключа (Server-Side & BYOK):**
   - Серверный режим: переменная окружения `GEMINI_API_KEY` в `.env.local`.
   - Режим BYOK (Bring Your Own Key): ввод пользовательского ключа в окне настроек с сохранением в `localStorage` и кнопкой проверки подключения.
   - Офлайн-эвристика: если ключ не задан, приложение работает полноценно благодаря локальному эвристическому анализатору.
6. **🌓 Темная и светлая тема:** адаптивный дизайн с поддержкой системных настроек.

---

## 🛠 Технический стек

* **Frontend:** React 19, Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Zustand.
* **Backend:** Next.js API Routes (`/api/ai/*`, `/api/tasks/*`).
* **AI SDK:** Официальный `@google/genai` с поддержкой Structured Outputs (`responseSchema`), модель `gemini-2.5-flash` (с fallback на `gemini-2.0-flash`).
* **Хранилище:** Локальное сохранение состояния (`localStorage`) + серверные REST эндпоинты.

---

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка API-ключа (опционально)
Создайте файл `.env.local` в корне проекта:
```env
GEMINI_API_KEY=ваш_ключ_от_Google_AI_Studio
```
*(Или введите ключ прямо в приложении через меню Настройки ⚙️)*

### 3. Запуск сервера разработки
```bash
npm run dev
```
Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### 4. Сборка для Production
```bash
npm run build
npm start
```

---

## 📐 Архитектура API

* `POST /api/ai/prioritize` — пакетный анализ активных задач и расчет матрицы Эйзенхауэра (`responseSchema`).
* `POST /api/ai/decompose` — разбиение задачи на 3–5 шагов.
* `POST /api/ai/quick-add` — NLP-парсинг текста для умного автозаполнения.
* `POST /api/ai/status` — валидация работоспособности API-ключа.
* `GET / POST / PATCH / DELETE /api/tasks` — REST API для управления задачами.
