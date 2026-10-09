# Office Hours Queue Demo

This project is a homework prototype for the Office Hours Bot. It is intentionally limited to the scope described in the project requirements.

## What this prototype includes
- A student name-only entry flow for demo purposes
- An in-memory queue for students waiting to speak with staff
- A simple course-question assistant that answers only from the sample course materials
- A simulated payment button that shows the user flow without charging real money

## Non-goals
- Real payment processing
- Real authentication or university sign-in
- A persistent database or long-term storage
- Production-grade authorization or security controls beyond the classroom prototype

## Data behavior
All queue data and chat session data are kept in memory on the server only. That means the data resets on every deploy and is not stored permanently.

## How to use it
1. Open the app in the browser.
2. Enter a name in the queue field and click "Join queue".
3. Add more names to see the queue order update.
4. Click "Call next student" to advance the queue.
5. Use the chat area to ask course questions grounded in the sample materials.
