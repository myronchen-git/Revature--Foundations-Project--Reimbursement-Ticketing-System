## View Tickets

### Application Layer -

> **URI:** /tickets  
> **Method:** GET  
> **Header Parameters:** `token`  
> **Query Parameters:** `status`, `type`, `submitter`  
> **Returns:**
>
> - `200` success: list of tickets with details
> - `400` user error: authentication failed
>
> Routes API calls to core logic. Converts errors to HTTP responses.  
> For an employee, only tickets the employee has submitted are returned.  
> For a manager, all tickets from all employees are returned by default. A manager can filter by employee.

### Business Layer -

> **File:** `ticketService.js`  
> **Function:** `retrieveTickets`  
> **Parameters:** `username`, `role`, `status`, `type`, `submitter`  
> **Returns:** A list of ticket objects
>
> Sends filter options, if any are given, to tickets DAO to retrieve a list of tickets.
> For employees, submitter parameter will be the employee's username.

### Persistance Layer -

> **File:** `ticketDao.js`  
> **Function:** `getTickets`  
> **Parameters:** `status`, `type`, `submitter`  
> **Returns:** A list of ticket objects
>
> Calls database with any provided filters and returns a list of tickets.
