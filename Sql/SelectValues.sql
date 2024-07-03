SELECT * FROM public."SensorValues"
WHERE "ReadingDateTime" > '2024-07-01 15:06:52.000+04'
AND "ReadingDateTime" < '2024-07-01 15:07:53.000+04'
ORDER BY "Id" DESC LIMIT 100
