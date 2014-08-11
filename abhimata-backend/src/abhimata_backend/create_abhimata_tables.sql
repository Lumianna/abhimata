create table abhimata_event
(
  event_id serial,
  title varchar(500),
  constraint event_pk primary key (event_id)
);

create table abhimata_short_question
(
  short_question_id serial,
  title varchar(2000),
  event_id integer not null,
  constraint short_question_pk primary key (short_question_id),
  constraint short_question_event_id_fk foreign key(event_id) references abhimata_event(event_id)
);

create table abhimata_long_question
(
  long_question_id serial,
  title varchar(2000),
  event_id integer not null,
  constraint long_question_pk primary key (long_question_id),
  constraint long_question_event_id_fk foreign key(event_id) references abhimata_event(event_id)
);

create table abhimata_radio
(
  radio_id serial,
  title varchar(2000),
  event_id integer not null,
  constraint radio_pk primary key (radio_id),
  constraint radio_event_id_fk foreign key(event_id) references abhimata_event(event_id)
);

create table abhimata_checkbox
(
  checkbox_id serial,
  title varchar(2000),
  event_id integer not null,
  constraint checkbox_pk primary key (checkbox_id),
  constraint checkbox_event_id_fk foreign key(event_id) references abhimata_event(event_id)
);

create table abhimata_radio_alternative
(
  radio_alternative_id serial,
  title varchar(2000),
  radio_id integer not null,
  constraint radio_alternative_pk primary key (radio_alternative_id),
  constraint radio_alternative_radio_id_fk foreign key(radio_id) references abhimata_radio(radio_id)
);

create table abhimata_checkbox_alternative
(
  checkbox_alternative_id serial,
  title varchar(2000),
  checkbox_id integer not null,
  constraint checkbox_alternative_pk primary key (checkbox_alternative_id),
  constraint checkbox_alternative_checkbox_id_fk foreign key(checkbox_id) references abhimata_radio(checkbox_id)
);


