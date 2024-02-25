## Submit Ticket

### Controller Layer -

> **URI:** /tickets  
> **Method:** POST  
> **Header Parameters:** `token`  
> **Body Parameters:** `type`, `amount`, `description`  
> **Returns:**
>
> - `200` success: ticket info
> - `400` user error: authentication failed or wrong role
>
> Routes API calls to core logic. Converts errors to HTTP responses.
> Checks that the parameters are valid. Identity is verified thru the token.

### Service Layer -

> **File:** `ticketService.js`  
> **Function:** `submitTicket`  
> **Parameters:** `username`, `role`, `type`, `amount`, `description`  
> **Returns:** ticket object `{submitter, timestamp, status, type, amount, description}`  
> **Throws:** `AuthorizationError` if account role is not employee
>
> If role is `employee`, then sends all ticket info to tickets DAO to be saved. Then returns a ticket object.  
> Else, an error will be thrown.

### Persistance Layer -

> **File:** `ticketDao.js`  
> **Function:** `add`  
> **Parameters:** `submitter`, `timestamp`, `status`, `type`, `amount`, `description`  
> **Returns:** Ticket object `{submitter, timestamp, status, type, amount, description}` or null
>
> Adds an entry in the `tickets` table with all arguments.
