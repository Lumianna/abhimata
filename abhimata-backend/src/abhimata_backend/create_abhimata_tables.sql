create table abhimata_event
(
  event_id serial,
  title varchar(2000) not null,
  max_participants integer not null,
  max_waiting_list_length integer not null,
  visible_to_public boolean not null,
  registration_open boolean not null,
  registration_form text not null,
  constraint event_pk primary key (event_id),
  constraint positive_max_participants CHECK (max_participants > 0),
  constraint positive_max_waiting_list_length CHECK (max_waiting_list_length > 0)
);


create table abhimata_admin
(
  username varchar(50) not null unique,
  password char(60) not null,
  constraint admin_pk primary key (username)
);

create table abhimata_registration
(
  registration_id serial,
  email varchar(2000) not null,
  email_verified boolean not null,
  email_verification_code varchar(1000) unique not null,
  cancellation_code varchar(1000) unique not null,
  event_id integer not null,
  submitted_form text not null,
  submission_date timestamp with time zone not null,
--  tentatively_accepted boolean not null,
  cancelled boolean not null,
  confirmed boolean not null,
  constraint registration_pk primary key (registration_id),
  constraint registration_event_id_fk 
    foreign key(event_id) references abhimata_event(event_id)
);

create table abhimata_email 
(
  email_id serial not null,
  event_id integer not null,
  registration_id integer not null,
  subject text not null,
  body text not null,
  sent boolean not null,
  send_time timestamp not null,
  constraint email_pk primary key (email_id),
  constraint email_event_id_fk
    foreign key(event_id) references abhimata_event(event_id),
  constraint email_registration_id_fk
    foreign key(registration_id) references abhimata_registration(registration_id)
);


create view abhimata_public_events as
select
  event_id,
  title,
  max_participants,
  registration_form,
  (select count(*) from abhimata_registration 
    where abhimata_registration.event_id = abhimata_event.event_id
      and abhimata_registration.cancelled = false) 
    as num_participants,
  registration_open
from abhimata_event where abhimata_event.visible_to_public = true;


create function abhimata_registration_trigger() returns trigger as $$
declare
  event_record record;
  num_registrants integer;
begin
  new.submission_date = current_timestamp;
  new.confirmed = false;
  new.email_verified = false;
  select * into event_record from abhimata_event
    where abhimata_event.event_id = new.event_id;
  select count(*) into num_registrants from abhimata_registration
    where abhimata_registration.event_id = new.event_id;

  if num_registrants = event_record.max_participants + event_record.max_waiting_list_length then
    raise notice 'Insertion aborted: waiting list full';
    return null;
  else
    return new;
  end if;
end
$$ language plpgsql;

create trigger trig_abhimata_registration_insert
before insert on abhimata_registration
for each row
execute procedure abhimata_registration_trigger(); 


-- Don't allow updates on primary keys
create function abhimata_throw_exception() returns trigger as $$
begin
  raise exception 'Do not modify primary keys!';
end
$$ language plpgsql;

create trigger trig_abhimata_event_before_pk_update
before update of event_id on abhimata_event 
for each row
execute procedure abhimata_throw_exception(); 

create trigger trig_abhimata_email_before_pk_update
before update of email_id on abhimata_email 
for each row
execute procedure abhimata_throw_exception(); 

create trigger trig_abhimata_registration_before_pk_update
before update of registration_id on abhimata_registration
for each row
execute procedure abhimata_throw_exception(); 
