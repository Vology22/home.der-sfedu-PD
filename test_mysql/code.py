import mysql.connector
from mysql.connector import Error

# Конфигурация базы данных MySQL
DB_CONFIG = {
    'host': '194.87.101.244',
    'database': 'homeder',
    'user': 'user',
    'password': '123456789',
    'port': 3306
}

def get_all_tables():
    """Получение списка всех таблиц в базе данных"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Получаем список таблиц
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            print("=" * 50)
            print(f"Таблицы в базе данных '{DB_CONFIG['database']}':")
            print("=" * 50)
            
            for i, table in enumerate(tables, 1):
                table_name = table[0]
                print(f"{i}. {table_name}")
                
                # Получаем структуру таблицы
                cursor.execute(f"DESCRIBE {table_name}")
                columns = cursor.fetchall()
                
                print(f"   Структура таблицы '{table_name}':")
                print(f"   {'-' * 40}")
                print(f"   {'Имя':<20} {'Тип':<15} {'NULL':<6} {'Ключ':<10}")
                print(f"   {'-' * 40}")
                
                for col in columns:
                    col_name, col_type, col_null, col_key = col[0], col[1], col[2], col[3]
                    print(f"   {col_name:<20} {col_type:<15} {col_null:<6} {col_key:<10}")
                
                # Получаем количество записей в таблице
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                count = cursor.fetchone()[0]
                print(f"   Количество записей: {count}")
                print()
            
            cursor.close()
            connection.close()
            
    except Error as e:
        print(f"Ошибка подключения к MySQL: {e}")
        return None

def get_database_info():
    """Получение общей информации о базе данных"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Информация о версии сервера
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()[0]
            print(f"Версия MySQL: {version}")
            
            # Текущая база данных
            cursor.execute("SELECT DATABASE()")
            current_db = cursor.fetchone()[0]
            print(f"Текущая база данных: {current_db}")
            
            # Размер базы данных
            cursor.execute("""
                SELECT table_schema AS 'Database', 
                       SUM(data_length + index_length) / 1024 / 1024 AS 'Size_MB'
                FROM information_schema.TABLES
                WHERE table_schema = %s
                GROUP BY table_schema
            """, (DB_CONFIG['database'],))
            
            size_info = cursor.fetchone()
            if size_info:
                print(f"Размер базы данных: {size_info[1]:.2f} MB")
            
            cursor.close()
            connection.close()
            print()
            
    except Error as e:
        print(f"Ошибка подключения к MySQL: {e}")

def show_table_data():
    """Показать данные из таблиц"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)  # Возвращает словари
            
            # Получаем список таблиц
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            for table_record in tables:
                table_name = list(table_record.values())[0]
                
                print(f"\n{'='*60}")
                print(f"Данные таблицы: {table_name}")
                print(f"{'='*60}")
                
                # Получаем данные из таблицы (ограничим 10 записями для удобства)
                try:
                    cursor.execute(f"SELECT * FROM {table_name} LIMIT 10")
                    rows = cursor.fetchall()
                    
                    if rows:
                        # Выводим заголовки столбцов
                        if rows:
                            columns = rows[0].keys()
                            header = " | ".join(columns)
                            print(header)
                            print("-" * len(header))
                            
                            # Выводим данные
                            for row in rows:
                                values = []
                                for col in columns:
                                    value = row[col]
                                    if value is None:
                                        values.append("NULL")
                                    elif isinstance(value, str) and len(value) > 50:
                                        values.append(f"{value[:47]}...")
                                    else:
                                        values.append(str(value))
                                print(" | ".join(values))
                    else:
                        print("Таблица пуста")
                        
                    # Показываем общее количество
                    cursor.execute(f"SELECT COUNT(*) as total FROM {table_name}")
                    total = cursor.fetchone()['total']
                    print(f"\nВсего записей: {total} (показано: {min(len(rows), 10)})")
                    
                except Error as e:
                    print(f"Ошибка чтения таблицы {table_name}: {e}")
            
            cursor.close()
            connection.close()
            
    except Error as e:
        print(f"Ошибка подключения к MySQL: {e}")

def export_table_schema():
    """Экспорт структуры таблиц в SQL файл"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Получаем CREATE TABLE для всех таблиц
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            sql_file = "database_schema.sql"
            
            with open(sql_file, 'w', encoding='utf-8') as f:
                f.write(f"-- Структура базы данных: {DB_CONFIG['database']}\n")
                f.write(f"-- Экспорт: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"-- Хост: {DB_CONFIG['host']}\n")
                f.write("\n")
                
                for table in tables:
                    table_name = table[0]
                    cursor.execute(f"SHOW CREATE TABLE {table_name}")
                    create_table = cursor.fetchone()[1]
                    
                    f.write(f"-- Таблица: {table_name}\n")
                    f.write(f"{create_table};\n")
                    f.write("\n")
            
            print(f"\nСтруктура базы данных экспортирована в файл: {sql_file}")
            
            cursor.close()
            connection.close()
            
    except Error as e:
        print(f"Ошибка подключения к MySQL: {e}")

if __name__ == "__main__":
    import datetime
    
    print("=" * 60)
    print(f"АНАЛИЗ БАЗЫ ДАННЫХ MySQL")
    print(f"Время: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Получаем общую информацию
    get_database_info()
    
    # Показываем таблицы
    get_all_tables()
    
    # Спрашиваем пользователя, хочет ли он увидеть данные
    choice = input("\nХотите просмотреть данные из таблиц? (y/n): ").lower()
    if choice == 'y':
        show_table_data()
    
    # Спрашиваем об экспорте схемы
    choice = input("\nХотите экспортировать структуру таблиц в SQL файл? (y/n): ").lower()
    if choice == 'y':
        export_table_schema()
    
    print("\n" + "=" * 60)
    print("ЗАВЕРШЕНО")
    print("=" * 60)