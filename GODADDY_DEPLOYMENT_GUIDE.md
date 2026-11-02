# STUVVY GoDaddy Hosting Deployment Guide for `stuvvy.in`

This guide explains step-by-step how to deploy STUVVY on GoDaddy Hosting (**https://host.godaddy.com/hosting**) for your domain **stuvvy.in**.

---

## 1. Files Prepared Specifically for GoDaddy
- **`server.js`**: GoDaddy Node.js application entry point (configured for production).
- **`.htaccess`**: Apache redirect rules forcing HTTPS and passing traffic cleanly.
- **`customers.csv`**: Live customer database sheet reflecting addresses dynamically.
- **`ecosystem.config.js`**: PM2 process manager config (if using GoDaddy VPS / SSH).
- **`package.json`**: Contains `"start:godaddy": "node server.js"`.

---

## 2. Deployment Method A: GoDaddy Web Hosting with cPanel (Most Common)

If your plan is GoDaddy Linux Web Hosting with cPanel:

### Step 1: Access cPanel
1. Go to [https://host.godaddy.com/hosting](https://host.godaddy.com/hosting) and click **Manage** on your Web Hosting plan.
2. Click **cPanel Admin** button.

### Step 2: Create Node.js Application in cPanel
1. In cPanel, scroll to the **Software** section and click **"Setup Node.js App"**.
2. Click **"Create Application"** (blue button in top right).
3. Fill in the fields:
   - **Node.js version**: Select `20.x` (or `18.x`).
   - **Application mode**: `Production`.
   - **Application root**: `stuvvy` (or `public_html`).
   - **Application URL**: Select `stuvvy.in` from the domain dropdown.
   - **Application startup file**: Type `server.js`.
4. Click **Create**.

### Step 3: Upload Files
You can upload files using **cPanel File Manager** or **FTP** (e.g. FileZilla):
- Upload the contents of your `STUVVY` folder into the application root folder (e.g. `stuvvy/`).
- **Do NOT upload the `node_modules` folder** (it is faster and cleaner to install on the server).
- **Make sure to upload**:
  - `src/`
  - `public/`
  - `.next/` (or build on server)
  - `customers.csv`
  - `server.js`
  - `package.json`
  - `package-lock.json`
  - `next.config.ts`
  - `tsconfig.json`
  - `.htaccess`

### Step 4: Install Dependencies & Build
1. In cPanel **Setup Node.js App**, click on your application.
2. Under "Detected configuration files", click **"Run NPM Install"**.
3. Or open **Terminal** in cPanel (under Advanced section) and run:
   ```bash
   cd stuvvy
   npm install
   npm run build
   ```

### Step 5: Start / Restart Application
1. In **Setup Node.js App**, click **"Restart"**.
2. Visit **`https://stuvvy.in`** — your website is live!

---

## 3. Deployment Method B: GoDaddy VPS / Dedicated Server (SSH Terminal)

If your plan is a GoDaddy Linux VPS:

1. **Connect via SSH**:
   ```bash
   ssh root@<YOUR-GODADDY-SERVER-IP>
   ```

2. **Install Node.js 20 & PM2**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx git
   sudo npm install -g pm2
   ```

3. **Upload or Clone Code**:
   ```bash
   mkdir -p /var/www/stuvvy
   cd /var/www/stuvvy
   # upload files or git clone here
   npm install
   npm run build
   ```

4. **Start Application with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**:
   - Copy `nginx.stuvvy.in.conf` to `/etc/nginx/sites-available/stuvvy.in`:
   ```bash
   sudo cp nginx.stuvvy.in.conf /etc/nginx/sites-available/stuvvy.in
   sudo ln -s /etc/nginx/sites-available/stuvvy.in /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Free SSL via Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d stuvvy.in -d www.stuvvy.in
   ```

---

## 4. GoDaddy DNS Configuration for `stuvvy.in`

Make sure your domain points to your GoDaddy hosting:
1. In your GoDaddy account, go to **Domain Portfolio** -> click **`stuvvy.in`** -> **DNS**.
2. Verify:
   - **Type `A`**: Name `@`, Value = `Your GoDaddy Hosting IP Address`, TTL `1/2 hour` (or Default).
   - **Type `CNAME`**: Name `www`, Value = `stuvvy.in`, TTL `1 hour`.
