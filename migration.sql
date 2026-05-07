-- ============================================================
-- Миграция: добавляем новые поля в таблицу properties
-- Запустить один раз: mysql -u root -p homeder < migration.sql
-- ============================================================

USE homeder;

ALTER TABLE `properties`
  ADD COLUMN `floor`             VARCHAR(20) DEFAULT NULL,
  ADD COLUMN `rooms`             VARCHAR(20) DEFAULT NULL,
  ADD COLUMN `current_tenants`   VARCHAR(20) DEFAULT NULL,
  ADD COLUMN `potential_tenants` VARCHAR(20) DEFAULT NULL;

-- Проверяем результат
DESCRIBE properties;
