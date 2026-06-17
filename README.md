# Берсерк — тренажёр карт

Веб-приложение для запоминания карт ККИ «Берсерк». Показывается полное изображение карты, а зоны с ХП, ходами, силой удара и текстом способностей закрыты масками. Видны название, арт и стоимость.

## Требования

- Node.js 20+
- npm

## Установка

```bash
npm install
npm run fetch:all
npm run dev
```

**Windows + PowerShell:** если `npm` выдаёт ошибку про execution policy, используйте:

```bat
install.bat
dev.bat
```

или в PowerShell:

```powershell
npm.cmd run dev
```

Приложение откроется на `http://localhost:5173`.

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Сборка production |
| `npm run fetch:cards` | Загрузка и нормализация `data.json` |
| `npm run fetch:images` | Сопоставление URL изображений с berserk.ru |
| `npm run fetch:all` | Оба скрипта подряд |

После `fetch:images` в базе будет около **1474** карт с рабочими изображениями (официальный каталог berserk.ru). Без картинок остаётся только выпуск 22 «Русь против ящеров» — его нет на berserk.ru. Тренировка использует только карты с изображениями.

Если Node.js недоступен, можно использовать Python-аналоги:

```bash
python scripts/fetch-cards.py
python scripts/fetch-images-official.py
```

## Источники данных

- Карточные данные: [berserk-nxt/resources/data.json](https://github.com/SkAZi/berserk-nxt)
- Изображения карт: [berserk.ru](https://berserk.ru/) (URL подтягиваются скриптом `fetch-images-official.py`)
- Официальный сайт: [berserk.ru](https://berserk.ru/)

Арты и тексты карт © Hobby World. Приложение предназначено для личного обучения.

## Как пользоваться

1. Выберите выпуски в коллекции слева.
2. Режим **Повторение** (по умолчанию) — карты по расписанию FSRS; **Свободный просмотр** — случайный перебор.
3. Изучите карту — видны название, арт и стоимость.
4. Нажмите **Показать ответ** (Пробел).
5. Оцените вспоминание: **Снова / Трудно / Хорошо / Легко** (клавиши 1–4) или → для «Хорошо».
6. Прогресс повторения сохраняется в браузере между сессиями.

## Структура

- `src/components/CardWithMasks.tsx` — карта с масками
- `src/config/maskZones.ts` — координаты масок по типам карт
- `src/hooks/useCardPool.ts` — коллекция, режим SRS/browse, выдача карт
- `src/hooks/useStudyProgress.ts` — прогресс повторения (localStorage)
- `src/lib/fsrs.ts` — алгоритм FSRS (retention 90%)
- `public/data/cards.json` — нормализованная база карт
- `public/cards/` — изображения карт
