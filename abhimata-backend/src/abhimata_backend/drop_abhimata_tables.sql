--Drop all tables except the admin table

drop trigger trig_abhimata_registration_insert on abhimata_registration;
drop trigger trig_abhimata_registration_before_pk_update on abhimata_registration;
drop trigger trig_abhimata_event_guard_registration_form on abhimata_event;
drop trigger trig_abhimata_event_before_pk_update on abhimata_event;
drop trigger trig_abhimata_email_before_pk_update on abhimata_email;
drop function abhimata_guard_registration_form();
drop function abhimata_registration_trigger();
drop function abhimata_throw_exception();
drop table abhimata_registration cascade;
drop table abhimata_event cascade;
drop table abhimata_email cascade;
