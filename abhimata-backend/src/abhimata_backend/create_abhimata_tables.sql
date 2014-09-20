create table abhimata_event
(
  event_id serial,
  title varchar(2000) not null,
  signup_form text not null,
  constraint event_pk primary key (event_id)
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
  name varchar(2000) not null,
  email varchar(2000) not null,
  event_id integer not null,
  submitted_form text not null,
  constraint registration_pk primary key (registration_id),
  constraint registration_event_id_fk 
    foreign key(event_id) references abhimata_event(event_id)
);
