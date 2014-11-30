# Abhimata

Abhimata ([_(adj.) desired, wished for; pleasant, agreeable_](https://palidictionary.appspot.com/browse/a/abhimata)) tries to make the lives of people who organize meditation retreats a bit easier by handling registration, cancellations, and mundane email reminders. The software can be used for managing other kinds of events as well, but it has been designed specifically with retreats in mind. The idea is not to create a sophisticated general event management system, but rather to provide a simple tool for making a specific workflow as easy as possible.

Abhimata uses React and Flux for the frontend and Clojure and PostgreSQL for the backend.

## Features
The software **is not ready for use yet**, but this is roughly what the workflow will look like from the perspective of the organizer:

1. Create the event: provide some essential details, such as the maximum number of participants, and design the registration form with a simple built-in WYSIWYG editor (or reuse a previously created template). You can also design a feedback form for your event.
2. When you're ready, publish the event and allow people to sign up. Most event details can still be edited after this point.
3. Once a user submits an application and verifies their email address, their application is automatically "tentatively approved"; it takes up one of the slots or moves to the waiting list if the maximum number of participants has already been reached. (Most retreats have a lot of cancellations and hence also long waiting lists.) You can screen applications and accept them or reject them. Abhimata doesn't try to handle payments in any way, but you can make notes about individual applications if you need more fine-grained status information (e.g. "application screened, pending payment").
3. Apart from accepting and rejecting applications, most parts of the registration process should require little human intervention. Abhimata will optionally send automatic email reminders to applicants either when their application's status changes or on specific user-defined dates (e.g., one week before the deadline for paying the full registration fee). Applicants receive a single-use URL that they can use for cancelling their registration (so there's no need for accounts or passwords).
4. You can export all the submitted applications, or specific fields from the forms, in some sensible, non-proprietary format. For example, the retreat's cooks need information about food allergies, and it's common to ask participants to read and sign a paper copy of the application that they submitted when the retreat starts.
5. Once the retreat is over, you can easily delete all the data submitted by your participants (except for the optional feedback, of course).

## Why

I started working on Abhimata because [Nirodha](http://www.nirodha.fi), a small volunteer-run non-profit organization that organizes meditation retreats in Finland, needed a tool for managing registrations. The workflow sketched above is based on Nirodha's process, but I would imagine that other retreat organizers have similar needs.
