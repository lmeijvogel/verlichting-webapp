require 'redis'

redis = Redis.new

redis.hset "zwave_available_programmes", "off", "Uit"
redis.hset "zwave_available_programmes", "morning", "Ochtend"
redis.hset "zwave_available_programmes", "evening", "Avond"
redis.hset "zwave_available_programmes", "evening_tv", "Avond (tv-meubel uit)"
redis.hset "zwave_available_programmes", "kitchen_full", "Keuken fel"
redis.hset "zwave_available_programmes", "dimmed", "Gedimd"
redis.hset "zwave_available_programmes", "night", "Nacht (zeer gedimd)"
redis.hset "zwave_available_programmes", "full", "Alles aan"
