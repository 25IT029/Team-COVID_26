# VROOMY — Hackathon MongoDB Setup

## 1. Backend

Open Command Prompt in this folder:

```bat
cd backend
npm install
npm start
```

Expected:

```text
MongoDB connected → database: vroomy
VROOMY running on http://localhost:5000
Server listening on 0.0.0.0:5000
```

## 2. Demo data

In a second terminal:

```bat
cd backend
npm run seed
```

This creates demo vehicles/rides and the first admin if one does not already exist.

## 3. MongoDB database

The backend explicitly uses the `vroomy` database. This prevents MongoDB/Mongoose from silently using the default `test` database.

The old `test` database can remain as legacy data. VROOMY no longer reads it.

## 4. Initial admin

```text
Email:    admin@vroomy.local
Password: Admin@12345
```

Login from `login.html`. Admin users are created only by the backend; normal registration cannot create an admin.

After login, the navbar shows **Admin** and opens `admin.html`.

## 5. Add another admin

Admin Dashboard → Add another admin → enter the current admin password → create the new admin.

## 6. Vehicle verification flow

Owner:

```text
List & Earn → submit vehicle → MongoDB status = pending
```

Admin:

```text
Admin → Vehicle inventory → Approve
```

After approval:

```text
status = available
verified = true
```

Only approved/verified vehicles appear in **Rent a Vehicle**.

## 7. Shared ride verification

Driver/owner:

```text
Offer a Ride → submit → pending
```

Admin:

```text
Admin → Ride-sharing activity → Approve
```

Only approved rides appear in **Find a Ride**.

## 8. Demo payment

The payment modal is a hackathon-only demo. It does not collect card, CVV, UPI PIN or bank passwords.

Successful rental payment records:

- payment status = paid
- booking status = confirmed
- 10% VROOMY commission
- 90% owner earning
- digital agreement

## 9. LAN / hotspot

The server listens on `0.0.0.0:5000`.

On the host laptop:

```bat
ipconfig
```

Find the IPv4 address of the active Wi-Fi/hotspot adapter. Other devices on the same network can open:

```text
http://HOST-IP:5000
```

All devices use the same MongoDB database, so vehicles, bookings and earnings stay synchronized.
