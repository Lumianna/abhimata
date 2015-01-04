--Drop all tables except the admin table

drop table abhimata_registration cascade;
drop table abhimata_event cascade;
drop trigger trig_abhimata_registration_insert;
drop function abhimata_registration_trigger();
