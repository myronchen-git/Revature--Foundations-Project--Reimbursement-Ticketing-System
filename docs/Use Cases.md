## #1: Register Account

### Primary Actor:

Employee / Manager

### Triggers:

Employee or manager wants to interact with the expense reimbursement system, or log in.
Examples of interactions are submitting reimbursement requests, viewing tickets, and approving tickets.

### Basic Flow:

1. A POST request is made to the registration URL, with username and password in the data body.
2. The service checks that the username and password are valid, and that the username is not already registered.
3. The service saves the new account to a database as an employee account.
4. The service returns feedback, describing a successfully created account.

### Alternative Flow 1:

1. A POST request is made to the registration URL, without a username or password.
2. The service checks that at least one is missing.
3. The service returns feedback, describing that username or password is missing.

### Alternative Flow 2:

1. A POST request is made to the registration URL, with an already registered username.
2. The service checks that the database already contains the provided username.
3. The service returns feedback, describing that the username is already registered.

## #2: Log In Account

### Primary Actor:

Employee / Manager

### Triggers:

Employee or manager wants to interact with the expense reimbursement system.
Examples of interactions are submitting reimbursement requests, viewing tickets, and approving tickets.

### Preconditions:

An account that is already created.

### Basic Flow:

1. A POST request is made to the login URL, with the correct username and password.
2. The service checks in the database that the username and password are correct.
3. The service generates a new authentication token.
4. The token is saved to the database. The database returns the username to the service.
5. The service returns the username and token to the client.

### Alternative Flow 1:

1. A POST request is made to the login URL, with an incorrect username or password.
2. The service checks in the database that the username or password is incorrect.
3. The service returns feedback, describing that either the username or password is incorrect.

## #3: Employee Submits New Ticket

### Primary Actor:

Employee

### Triggers:

Employee wants to create a new reimbursement request.

### Preconditions:

User is logged in (has authentication token).

### Basic Flow:

1. A POST request is made to the tickets URL, with type, amount, description, username, and authentication
   token in the data body.
2. The service verifies that the amount is valid and the description is not empty.
3. The service verifies with the accounts database that the username and token are correct.
4. The service calls the tickets database to create a new ticket entry with type, amount, description, username, status,
   date, and resolver. Resolver will be set to null. The database returns a ticket ID.
5. The service returns feedback to the client, describing the successful creation and giving the ticket ID.

### Alternative Flow 1:

1. A POST request is made to the tickets URL, with an incorrect username or authentication token.
2. The service verifies that the amount is valid and the description is not empty.
3. The service verifies that the username or token is incorrect.
4. The service returns feedback, describing that either the username or password is incorrect.

### Alternative Flow 2:

1. A POST request is made to the tickets URL, with a username that belongs to a manager.
2. The service verifies that the amount is valid and the description is not empty.
3. The service verifies that the username belongs to a manager.
4. The service returns feedback, describing that only employees can submit tickets.

## #4: View Tickets

### Primary Actor:

Employee / Manager

### Triggers:

Employee or manager wants to view list of submitted tickets.

### Preconditions:

User is logged in (has authentication token).

### Basic Flow:

1. A GET request is made to the tickets URL, with username and authentication token in the request body and any URL
   query parameters for the ticket attributes.
2. The service verifies with the accounts database that the username and token are correct, and receives the role of
   the user.
3. A filter is created for the tickets query with the query parameters.
4. If role is employee, then set the filter for the tickets query for the submitter attribute to be the employee's
   username.
5. The service calls the database and retrieves a list of tickets.
6. The service returns the list of tickets to the client.

### Alternative Flow 1:

1. A GET request is made to the tickets URL, with an incorrect username or authentication token.
2. The service verifies that the username or token is incorrect.
3. The service returns feedback, describing that either the username or password is incorrect.

## #5: Approve/Deny Tickets

### Primary Actors:

Manager

### Triggers:

Manager wants to process a pending reimbursement ticket.

### Preconditions:

Manager is logged in (has authentication token).

### Basic Flow:

1. A POST request is made to the tickets URL at a specific ticket ID, with username, authentication token, and status.
2. The service verifies with the accounts database that the username and token are correct, receives the role of
   the user, and checks that the role is manager.
3. The tickets database is called to get the ticket status and is checked to be "pending".
4. The ticket in the database is updated with "Approved" or "Denied", along with setting the resolver to the current
   manager.
5. The service returns feedback, giving the new ticket info.

### Alternative Flow 1:

1. A POST request is made to the tickets URL at a specific ticket ID, with an incorrect username or authentication
   token.
2. The service verifies that the username or token is incorrect.
3. The service returns feedback, describing that either the username or password is incorrect.

### Alternative Flow 2:

1. A POST request is made to the tickets URL at a specific ticket ID, with username, authentication token, and status,
   but the user is an employee.
2. The service verifies with the accounts database that the username and token are correct, receives the role of
   the user, and checks that the role is not manager.
3. The service returns feedback, describing that only managers can approve or deny tickets.

### Alternative Flow 3:

1. A POST request is made to the tickets URL at a specific ticket ID, with username, authentication token, and status.
2. The service verifies with the accounts database that the username and token are correct, receives the role of
   the user, and checks that the role is manager.
3. The tickets database is called to get the ticket status and is checked to not be "pending".
4. The service returns feedback, describing that only pending tickets can be changed.
