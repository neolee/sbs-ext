# Deployment Guide (Arch Linux + uv + Nginx)

This document provides a step-by-step guide for deploying the SBS Editor on an Arch Linux server.

## 1. Prerequisites

- **Arch Linux** updated (`pacman -Syu`).
- **uv** installed (`pacman -S python-uv`).
- **nginx** installed (`pacman -S nginx`).
- **Python 3.11+**.

## 2. Environment Setup

Create a dedicated system user to run the services, and prepare the project directory.

```bash
# 1. Create the system user and group 'sentry'
sudo groupadd -r sentry
sudo useradd -r -g sentry -s /usr/bin/nologin sentry

# 2. Prepare the directory and clone the repository
sudo mkdir -p /var/www
sudo chown sentry:sentry /var/www
cd /var/www

# Clone as your current user or sentry
git clone https://github.com/your-repo/sbs-ext.git
cd sbs-ext

# 3. Sync dependencies and create a virtual environment
# Run this as your current user who has internet access and permissions.
# This creates the .venv directory correctly.
uv sync

# 4. Finalize permissions
# Transfer ownership of the entire project (including .venv) to the 'sentry' user.
sudo chown -R sentry:sentry /var/www/sbs-ext
```

## 3. Systemd Service Configuration

Create a `systemd` unit file to manage the FastAPI process.

Create the file `/etc/systemd/system/sbs-editor.service`:

```ini
[Unit]
Description=SBS Editor - FastAPI Backend
After=network.target

[Service]
# Run as the restricted 'sentry' user
User=sentry
Group=sentry
WorkingDirectory=/var/www/sbs-ext
# Ensure Python can find our source code
Environment="PYTHONPATH=/var/www/sbs-ext/src"
# Point directly to the python interpreter inside the virtual environment.
# Using 'python -m uvicorn' is more robust than calling the wrapper script
# because wrapper scripts often have hardcoded shebang paths that break if moved.
ExecStart=/var/www/sbs-ext/.venv/bin/python -m uvicorn sbs_editor.main:app --host 127.0.0.1 --port 8080 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable sbs-editor
sudo systemctl start sbs-editor
```

## 4. Nginx Reverse Proxy

Configure Nginx to handle external traffic and serve static widgets directly for performance.

Create `/etc/nginx/conf.d/sbs-editor.conf` (or add to your `nginx.conf`):

```nginx
server {
    listen 80;
    server_name sbs.your-domain.com;

    # Backend API and Editor UI
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static Widget Hosting (High Performance)
    # This bypasses Python for JS/CSS assets
    location /widgets/ {
        alias /var/www/sbs-ext/widgets/;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # Optional: Deny access to sensitive files
    location ~ /\.(git|venv|sh) {
        deny all;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Maintenance Commands

- **Check logs**: `journalctl -u sbs-editor -f`
- **Restart Backend**: `sudo systemctl restart sbs-editor`
- **Update Application**:
  ```bash
  git pull
  uv sync
  sudo systemctl restart sbs-editor
  ```

## 6. Security Hardening

- **Firewall**: Ensure only 80 (and 443) are open to the world.
- **SSL**: Use `certbot` for Let's Encrypt certificates.
- **Permissions**: Ensure `/var/www/sbs-ext` is owned by the `sentry` user. Avoid running as `root`.
