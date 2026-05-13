import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request


BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "").strip()
SITE_URL = os.getenv("SITE_URL", "").strip()

API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

SESSIONS = {}

TASKS = {
    "furniture": "Подобрать мебель",
    "style": "Изменить стиль комнаты",
    "layout": "Улучшить планировку",
}

STYLES = {
    "japandi": "Japandi",
    "minimal": "Минимализм",
    "scandi": "Сканди",
    "loft": "Лофт",
}

BUDGETS = {
    "low": "эконом",
    "middle": "средний",
    "premium": "премиум",
}


def request(method, payload=None):
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(
        f"{API_URL}/{method}",
        data=data,
        headers=headers,
        method="POST" if payload is not None else "GET",
    )

    with urllib.request.urlopen(req, timeout=30) as response:
        body = response.read().decode("utf-8")
        return json.loads(body)


def send_message(chat_id, text, keyboard=None):
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    if keyboard:
        payload["reply_markup"] = {"inline_keyboard": keyboard}
    return request("sendMessage", payload)


def answer_callback(callback_query_id):
    return request("answerCallbackQuery", {"callback_query_id": callback_query_id})


def task_keyboard():
    return [
        [{"text": label, "callback_data": f"task:{key}"}]
        for key, label in TASKS.items()
    ]


def editor_keyboard():
    if not SITE_URL:
        return None

    button = {"text": "Открыть редактор комнаты"}
    if SITE_URL.startswith("https://"):
        button["web_app"] = {"url": SITE_URL}
    else:
        button["url"] = SITE_URL

    return [[button]]


def style_keyboard():
    return [
        [{"text": label, "callback_data": f"style:{key}"}]
        for key, label in STYLES.items()
    ]


def budget_keyboard():
    return [
        [{"text": label.capitalize(), "callback_data": f"budget:{key}"}]
        for key, label in BUDGETS.items()
    ]


def get_session(chat_id):
    return SESSIONS.setdefault(
        chat_id,
        {
            "photo_file_id": None,
            "task": None,
            "style": None,
            "budget": None,
        },
    )


def reset_session(chat_id):
    SESSIONS[chat_id] = {
        "photo_file_id": None,
        "task": None,
        "style": None,
        "budget": None,
    }


def build_design_brief(session):
    task = TASKS.get(session["task"], "Подобрать интерьер")
    style = STYLES.get(session["style"], "Современный")
    budget = BUDGETS.get(session["budget"], "средний")

    prompt = (
        "Edit this room photo into a realistic interior design concept. "
        f"Goal: {task}. Style: {style}. Budget level: {budget}. "
        "Keep the original room layout, windows, walls, floor, camera angle, "
        "and lighting direction. Add realistic furniture and decor. "
        "Do not change the room geometry. Make it photorealistic and suitable "
        "for a real apartment."
    )

    furniture = {
        "эконом": "диван простой формы, журнальный столик, ковер, торшер, открытый стеллаж",
        "средний": "модульный диван, деревянный столик, текстильный ковер, напольный светильник, закрытая система хранения",
        "премиум": "диван с качественной обивкой, массивный журнальный стол, дизайнерский свет, большой ковер, встроенное хранение",
    }

    return (
        "<b>Готово. Черновик дизайн-задания:</b>\n\n"
        f"<b>Задача:</b> {task}\n"
        f"<b>Стиль:</b> {style}\n"
        f"<b>Бюджет:</b> {budget}\n\n"
        "<b>Что добавить:</b>\n"
        f"{furniture.get(budget, furniture['средний'])}\n\n"
        "<b>Промпт для генерации визуала:</b>\n"
        f"<code>{prompt}</code>\n\n"
        "В нулевой версии я собираю заявку и готовлю ТЗ. Следующий шаг MVP - "
        "подключить генерацию изображений, когда появится бюджет на API или локальная модель."
    )


def notify_admin(user, session):
    if not ADMIN_CHAT_ID:
        return

    username = user.get("username")
    name = " ".join(
        part for part in [user.get("first_name"), user.get("last_name")] if part
    )
    contact = f"@{username}" if username else name or str(user.get("id"))
    text = (
        "Новая заявка на интерьер:\n\n"
        f"Пользователь: {contact}\n"
        f"Задача: {TASKS.get(session['task'])}\n"
        f"Стиль: {STYLES.get(session['style'])}\n"
        f"Бюджет: {BUDGETS.get(session['budget'])}\n"
        f"Фото file_id: {session['photo_file_id']}"
    )
    send_message(ADMIN_CHAT_ID, text)


def handle_message(message):
    chat_id = message["chat"]["id"]
    text = message.get("text", "")

    if text == "/start":
        reset_session(chat_id)
        send_message(
            chat_id,
            "Привет. Отправьте фото комнаты, а я соберу дизайн-задание и промпт для визуала. Или откройте редактор, чтобы расставить мебель вручную.",
            editor_keyboard(),
        )
        return

    if "photo" in message:
        photo = message["photo"][-1]
        session = get_session(chat_id)
        session["photo_file_id"] = photo["file_id"]
        send_message(chat_id, "Фото получил. Что хотите сделать?", task_keyboard())
        return

    send_message(chat_id, "Отправьте фото комнаты или нажмите /start.")


def handle_callback(callback):
    answer_callback(callback["id"])

    chat_id = callback["message"]["chat"]["id"]
    user = callback["from"]
    data = callback["data"]
    session = get_session(chat_id)

    kind, value = data.split(":", 1)

    if kind == "task":
        session["task"] = value
        send_message(chat_id, "Выберите стиль:", style_keyboard())
        return

    if kind == "style":
        session["style"] = value
        send_message(chat_id, "Какой уровень бюджета?", budget_keyboard())
        return

    if kind == "budget":
        session["budget"] = value
        brief = build_design_brief(session)
        send_message(chat_id, brief)
        notify_admin(user, session)
        return


def main():
    if not BOT_TOKEN:
        raise SystemExit("Set TELEGRAM_BOT_TOKEN before running the bot.")

    offset = None
    print("Bot is running. Press Ctrl+C to stop.")

    while True:
        try:
            payload = {"timeout": 25}
            if offset is not None:
                payload["offset"] = offset
            updates = request("getUpdates", payload).get("result", [])

            for update in updates:
                offset = update["update_id"] + 1
                if "message" in update:
                    handle_message(update["message"])
                elif "callback_query" in update:
                    handle_callback(update["callback_query"])

        except urllib.error.URLError as exc:
            print(f"Network error: {exc}")
            time.sleep(5)
        except KeyboardInterrupt:
            print("Bot stopped.")
            break


if __name__ == "__main__":
    main()
