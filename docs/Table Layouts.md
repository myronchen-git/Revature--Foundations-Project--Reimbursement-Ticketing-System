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

- String submitter

### Sort key

- Number timestamp

### Attributes

- String status
- String type
- Number amount
- String description
- String resolver

### Global Secondary Index(es)

#### Partition Key

- String status (project all)

#### Sort key

- Number timestamp
