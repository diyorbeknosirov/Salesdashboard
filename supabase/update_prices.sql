-- Tarif narxlarini yangilash
update tariffs set price = 555000 where id = 'prompt';
update tariffs set price = 888000 where id = 'media';
update tariffs set price = 1555000 where id = 'vibe';

-- Tekshirish
select * from tariffs;
