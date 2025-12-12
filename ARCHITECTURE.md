# Architecture & Scaling (Short Write-up)

## High-level architecture
- Clients (web/mobile) -> API Gateway / Node.js Express -> Postgres (Primary)
- Optional: Use Load Balancer + multiple API instances, behind which a message queue (e.g., RabbitMQ / Kafka) handles async work.

## Database design
- `shows` table holds show metadata and `seats_booked` counter.
- `bookings` table stores individual booking records and status.
- For production:
  - Use primary-replica replication for reads.
  - Partition/shard shows by region or show_id ranges.
  - Use connection pooling and prepared statements.

## Concurrency control
- Use DB transactions with row-level locks (`SELECT ... FOR UPDATE`) to atomically check and update seat counts.
- Alternative: per-show distributed locks (Redis RedLock) to coordinate across app instances.
- For high contention, introduce seat-level rows and optimistic locking (version column) or queue requests.

## Caching
- Cache show metadata and availability (TTL short) in Redis for fast reads.
- Invalidate cache when bookings change, or push updates via websocket.

## Message queue
- For non-blocking flows (payment, ticketing emails), push booking events to a queue and process asynchronously.
- For large scale, use idempotent consumers and dead-letter queues.

## Booking expiry
- Implement TTL or scheduled job that fails PENDING bookings after N minutes (2 minutes in demo).

This is a concise plan — expand for production with monitoring, observability, and security (auth, rate limits).
