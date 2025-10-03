import telebot
from telebot import types
import time
bot = telebot.TeleBot('8111172105:AAGsI6Fb23vIheBAhkibjPVFdhbpjX08s3s')  #  @homeder_bot
URL_channel = 'https://t.me/+Ewj5b4FyKo1hMGI1'
channel_id = -1001656251836
url_webapp = 'https://sfedu.ru/'
def webAppKeyboard(): #создание клавиатуры с webapp кнопкой
    
    keyboard = types.ReplyKeyboardMarkup() #создаем клавиатуру
    web_app = types.WebAppInfo(url_webapp) #создаем webappinfo - формат хранения url
    button = types.InlineKeyboardButton(text="Open", web_app=web_app)
    keyboard = types.InlineKeyboardMarkup([[button]])
    return keyboard 
@bot.callback_query_handler(func=lambda call: True)
def callback_worker(call):
    if call.data == "check":
        user_in_channel = bot.get_chat_member(channel_id, call.from_user.id)
        #print(user_in_channel)
        if user_in_channel.status in ["member", "administrator", "creator"]:
            bot.send_message(call.from_user.id, "Подписка подтверждена!")
            get_menu(call)
        else:
            # Пользователь не является участником канала
            markup = types.InlineKeyboardMarkup()
            button1 = types.InlineKeyboardButton("Подписаться ✔", url=URL_channel)
            markup.add(button1)
            key_check = types.InlineKeyboardButton(text='Проверить подписку ✔', callback_data='check')
            markup.add(key_check)
            bot.send_message(call.from_user.id, f'Ты *НЕ* подписан',  parse_mode='MarkdownV2', reply_markup=markup)
@bot.message_handler(commands=['start'])
def get_start(message):
    print("\nСтарт!")
    keyboard_theme = telebot.types.InlineKeyboardMarkup()
    sub = types.InlineKeyboardButton("Подписаться ✔", url=URL_channel)
    key_check = types.InlineKeyboardButton(text='Проверить подписку ✔', callback_data='check')
    keyboard_theme.add(sub, key_check)
    bot.send_chat_action(chat_id=message.from_user.id, action="record_video_note")
    time.sleep(3)
    bot.send_video_note(message.chat.id, open('video.mp4', 'rb'))
    bot.send_message(message.from_user.id, 'Привет. Добро пожаловать в home/der!\nПодпишись на наш канал', reply_markup=keyboard_theme)
    return

@bot.message_handler(commands=['menu'])
def get_menu(message):
    keyboard_menu = webAppKeyboard()
    bot.send_message(message.from_user.id, 'Начнем?', reply_markup=keyboard_menu)

bot.polling(none_stop=True)