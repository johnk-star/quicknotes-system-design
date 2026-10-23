# QuickNotes Architecture & Scaling Document

## 1. System Load Estimations (1 Million DAU)
* **Daily Active Users (DAU):** 1,000,000 users
* **Read Queries:** 20 reads/user/day = 20,000,000 daily reads ($\approx 231$ Read RPS average, $\approx 1,155$ Peak RPS)
* **Write Operations:** 2 writes/user/day = 2,000,000 daily writes ($\approx 23$ Write RPS average)
* **Read-to-Write Ratio:** 10:1 (Read-Heavy System)

---

## 2. High-Availability Architecture Diagram
[ DNS (Route 53) ]
|
v
[ CDN (Cloudfront Edge Cache) ] --> Serves Static Assets (HTML/CSS/JS)
|
v
[ Application Load Balancer ]
|
+-----------------------+
|                       |
v                       v
[ App Server 1 ]       [ App Server 2 ] (Node.js REST Cluster)
|       \               /       |
|        +----+   +----+        |
|             |   |             |
v             v   v             v
[ Primary DB ]  [ Read Replicas ] [ Redis Cache ]
(Writes)         (Reads)          (Sessions & Cache)
|
v
[ Message Queue (RabbitMQ / SQS) ]
|
v
[ Background Workers ] --> (Asynchronous Email & Analytics Jobs)
---

## 3. Core Component Roles
1. **DNS (Route 53):** Resolves client domain queries with low latency routing.
2. **CDN (CloudFront):** Serves static frontend assets at global edge locations to decrease origin latency.
3. **Load Balancer:** Distributes API traffic evenly across stateless application instances.
4. **Stateless App Servers:** Executes Express REST endpoints and handles JWT verification.
5. **Primary PostgreSQL DB:** Manages persistent relational write queries.
6. **Read Replicas:** Serves load-balanced read queries to handle high read volume.
7. **Redis Cache:** Provides sub-10ms memory cache for active user notes and token lookups.
8. **Message Queue & Workers:** Processes async tasks (notifications, index creation) without blocking HTTP responses. 
