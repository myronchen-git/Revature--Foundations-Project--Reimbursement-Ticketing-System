## Accounts

### Table Name

Foundations_Project-Accounts

### Partition Key

- String username

### Attributes

- String password
- String role
- String authToken

## Tickets

### Table Name

Foundations_Project-ERS-Tickets

### Partition Key

- String id

### Attributes

- String status
- String submitter
- String resolver
- String type
- Number amount
- String description
- Number timestamp

### Global Secondary Index(es)

- String submitter (project all)
