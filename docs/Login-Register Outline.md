## Register

### Controller Layer -

> **File:** `AccountRouter.js`  
> **URI:** /accounts/register  
> **Method:** POST  
> **Parameters:** `username`, `password`  
> **Returns:**
>
> - `200` success: `username`, `role`
> - `400` user error: invalid username or password, username already exists
>
> Routes API calls to core logic. Converts errors to HTTP responses.  
> Checks that username and password arguments are valid.

### Service Layer -

> **File:** `AccountService.js`  
> **Function:** `register`  
> **Parameters:** `username`, `password`  
> **Returns:** { `username`, `role` }  
> **Throws:** `Error` for an already existing username
>
> Checks if username is already in the database by calling DAO.
> If username does not already exist, passes username, password, and role to DAO for account creation (role should be
> employee).

### Persistance Layer -

> **File:** `AccountDao.js`  
> **Function:** `get`  
> **Parameters:** `username`  
> **Returns:** Account object or undefined
>
> Gets an account with provided username.

> **File:** `AccountDao.js`  
> **Function:** `add`  
> **Parameters:** `username`, `password`, `role`  
> **Returns:** { `username`, `role` } or null
>
> Adds a new account to database.

## Login

### Controller Layer -

> **File:** `AccountRouter.js`  
> **URI:** /accounts/login  
> **Method:** POST  
> **Parameters:** `username`, `password`  
> **Returns:**
>
> - `200` success: authentication token
> - `400` user error: invalid username or password
>
> Routes API calls to core logic. Converts errors to HTTP responses.  
> Checks that username and password arguments are valid inputs.

### Service Layer -

> **File:** `AccountService.js`  
> **Function:** `login`  
> **Parameters:** `username`, `password`  
> **Returns:** authentication token  
> **Throws:** `InvalidLoginError` for wrong username or password
>
> Checks if the provided username and password are correct by calling the database.
> If correct, then returns a token that expires after an hour.
