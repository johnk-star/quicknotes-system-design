# QuickNotes System Architecture & Scaling Plan

## Architecture Diagram
+-----------------------------------------------------------------------------------+
|                                 CLIENT APPLICATIONS                               |
|                             (Web App / Mobile Browser)                            |
+-----------------------------------------------------------------------------------+
|
v
+--------------------------+
|      Load Balancer       |
|       (Nginx / ALB)      |
+--------------------------+
|
v
+--------------------------+
|  Stateless Application   |
|      Server Cluster      |
|     (Node.js / Express)  |
+--------------------------+
/

Read / Write  /                \ Cache Queries
v                  v
+--------------------+   +--------------------+
|  Relational DB     |   |    Redis Cache     |
|  (PostgreSQL/MySQL)|   | (In-Memory Session  |
|  Primary + Replicas|   |   & Note Cache)    |
+--------------------+   +--------------------+

## Component Roles
1. **Load Balancer:** Balances incoming web requests across API servers to ensure high availability.
2. **Stateless App Servers:** Handles authentication and REST API business logic state-lessly.
3. **Primary PostgreSQL DB:** Handles write operations (creating/updating notes).
4. **Read Replicas:** Scales read queries for user note feeds.
5. **Redis Cache:** Delivers sub-10ms response times for active user notes and session lookups.

## Design Trade-Off
* **PostgreSQL vs MongoDB:** Chosen PostgreSQL to enforce relational user-category-note integrity and strict data security despite requiring upfront migration schemas.
