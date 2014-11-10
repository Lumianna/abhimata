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
  event_id integer not null,
  submitted_form text not null,
  submission_date date not null,
  tentatively_accepted boolean not null,
  confirmed boolean not null,
  constraint registration_pk primary key (registration_id),
  constraint registration_event_id_fk 
    foreign key(event_id) references abhimata_event(event_id)
);


create view abhimata_public_events as
select
  event_id,
  title,
  max_participants,
  (select count(*) from abhimata_registration 
    where abhimata_registration.event_id = abhimata_event.event_id) 
    as num_participants,
  registration_open
from abhimata_event;


create function abhimata_registration_trigger() returns trigger as $$
declare
  event_record record;
  num_registrants integer;
begin
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
