## Approve/Deny Tickets

### Application Layer -

> **URI:** /tickets/:submitter-:timestamp  
> **Method:** POST  
> **Header Parameters:** `token`  
> **Path Parameters:** `submitter`, `timestamp`  
> **Body Parameters:** `status`  
> **Returns:**
>
> - `200` success: updated ticket details
> - `400` user error: authentication failed, ticket already processed
>
> Routes API calls to core logic. Converts errors to HTTP responses.

### Business Layer -

> **File:** `ticketService.js`  
> **Function:** `processTicket`  
> **Parameters:** `username`, `role`, `submitter`, `timestamp`, `status`  
> **Returns:** ticket object `{submitter, timestamp, status, type, amount, description}`  
> **Throws:** `Error` if ticket is already processed
>
> If role is `manager`, then calls tickets DAO to update ticket status.
> If ticket status is pending, then updates the status. Else throws an error saying that it is already processed.

### Persistance Layer -

> **File:** `ticketDao.js`  
> **Function:** `setTicketStatus`  
> **Parameters:** `submitter`, `timestamp`, `status`, `resolver`  
> **Returns:** ticket object `{submitter, timestamp, status, type, amount, description}`  
> **Throws:** `Error` if ticket is already processed
>
> Calls database to update the status of the ticket.
