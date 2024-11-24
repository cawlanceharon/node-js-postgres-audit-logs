
# Project: Node.js with Express & PostgreSQL API

## Set up the database

```json
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255),
    record_id INT,
    action VARCHAR(50),
    old_data JSONB,
    new_data JSONB,
    performed_at TIMESTAMP,
    performed_by VARCHAR(255)
);
```

## Example API Requests

### 1. Get All Users
```json
curl -X GET http://localhost:3000/api/users
```

### 2. Create a New User
```json
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com"
  }'
```

### 3. Update a User
```json
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Johnathan Doe",
    "email": "johnathan.doe@example.com"
  }'
```

# Alternative

## Set up a function for auto log in postgres SQL
```json
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data)
        VALUES ('users', NEW.id, 'INSERT', row_to_json(NEW));

    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data)
        VALUES ('users', OLD.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));

    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data)
        VALUES ('users', OLD.id, 'DELETE', row_to_json(OLD));
    END IF;

    RETURN NULL; -- Triggers on AFTER don't modify the row
END;
$$ LANGUAGE plpgsql;
```

## Attach the Trigger to the users Table
```json
CREATE TRIGGER user_audit_trigger
AFTER INSERT OR UPDATE OR DELETE
ON users
FOR EACH ROW
EXECUTE FUNCTION log_user_changes();
```
