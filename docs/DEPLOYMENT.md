# Production Deployment & Operations Guide

## 1. Centralized Production Topology

In production, the backend API and PostgreSQL database are hosted on a central secure server (e.g. AWS, Azure, DigitalOcean, or an on-premise company datacenter in Cairo). All branch desktop installations connect securely over HTTPS.

```
[Cairo Branch PCs]       \
[Alexandria Branch PCs]   ---> HTTPS (TLS 1.3) ---> [Reverse Proxy: Nginx] ---> [Node.js Backend] ---> [PostgreSQL 16]
[Mansoura Branch PCs]    /                                                                          |
[CEO Executive Laptop]  /                                                                 [Daily Backups]
```

---

## 2. Docker Compose Deployment (Server / Local Development)

A production-ready `docker-compose.yml` is provided in the project root:

```bash
# Start PostgreSQL and Backend services
docker compose up -d --build

# Run database migrations
docker compose exec backend npm run prisma:migrate

# Seed initial Egyptian branches, products, and targets
docker compose exec backend npm run seed
```

---

## 3. Desktop Application Packaging (Windows Installer)

The desktop application uses `electron-builder` configured for Windows NSIS installer generation:

```bash
cd desktop-app
npm install
npm run build:win
```

Output installer is generated at:
`desktop-app/dist/Egypt-Distribution-ERP-Setup-1.0.0.exe`

Features of the Windows package:
- Per-machine or per-user installation options.
- Desktop and Start Menu shortcut generation.
- Bundled auto-updater configuration.
- Sandboxed runtime with no local database server requirement.

---

## 4. PostgreSQL Backup & Disaster Recovery

### Automated Daily Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/egypt_erp"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# Full custom-format backup with compression
pg_dump -U postgres -h localhost -F c -b -v -f "$BACKUP_DIR/erp_db_$TIMESTAMP.dump" egypt_distribution_erp

# Keep last 30 days of backups
find "$BACKUP_DIR" -type f -name "*.dump" -mtime +30 -delete
```

### Database Restoration Procedure
```bash
# Create target database if needed
createdb -U postgres egypt_distribution_erp_restored

# Restore database schema and data
pg_restore -U postgres -d egypt_distribution_erp_restored -v "/var/backups/egypt_erp/erp_db_20261010.dump"
```
