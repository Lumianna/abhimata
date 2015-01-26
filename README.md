# Abhimata

Abhimata ([_(adj.) desired, wished for; pleasant, agreeable_](https://palidictionary.appspot.com/browse/a/abhimata)) tries to make the lives of people who organize meditation retreats slightly easier by handling registration, cancellations, and mundane email reminders. The software can be used for managing other kinds of events as well, but it has been designed specifically with retreats in mind. The idea is not to create a sophisticated general event management system, but rather to provide a simple tool to solve a specific problem.

Abhimata is not ready to use yet, but should get there in the coming months. The interface for managing and signing up for events is a single-page app built with React and Flux. The backend is written in Clojure, with PostgreSQL as the database.

## Why

I started working on Abhimata because [Nirodha](http://www.nirodha.fi/english), a small volunteer-run non-profit organization that organizes meditation retreats in Finland, needed a tool for managing registrations. Abhimata is designed with Nirodha's process in mind, but I suspect that retreat organizers across the world generally have similar needs.

## Features

- A simple WYSIWYG editor for creating registration (or feedback) forms
- Can keep track of application status information: has the application been screened, has the applicant paid the registration fee (if the event has one), etc.
- Customizable plain text email reminders, sent automatically on a given date or when the status of an application changes (e.g., the organizer verifies that payment has been received)
- Easy export of subsets of submitted answers (e.g., participants' food allergies for the retreat kitchen)
- Participants do not have accounts or passwords; at the discretion of the event manager, they can cancel their registration using a secret single-use URL.

Most features are optional. A simple one-day event with no registration fee could have a registration form consisting of one field (email), and would need no automatic emails beyond a basic confirmation that the application has been successfully submitted. There would also be no status information to track (that is, checkboxes for the event manager to check) for each application. On the other hand, a ten-day meditation retreat that people sign up for six months ahead of time might use all the available features.
