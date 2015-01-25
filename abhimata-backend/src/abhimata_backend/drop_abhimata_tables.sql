--Drop all tables except the admin table

drop trigger trig_abhimata_registration_insert on abhimata_registration;
drop function abhimata_registration_trigger();
drop function abhimata_throw_exception();
drop table abhimata_registration cascade;
drop table abhimata_event cascade;
drop table abhimata_email cascade;
