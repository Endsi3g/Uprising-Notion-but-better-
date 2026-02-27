## Documentation Index
> Fetch the complete documentation index at: https://docs.twenty.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 1-Click w/ Docker Compose

> [!WARNING]
> Docker containers are for production hosting or self-hosting, for the contribution please check the [Local Setup](/developers/contribute/capabilities/local-setup).

## Overview

This guide provides step-by-step instructions to install and configure the Twenty application using Docker Compose. The aim is to make the process straightforward and prevent common pitfalls that could break your setup.

**Important:** Only modify settings explicitly mentioned in this guide. Altering other configurations may lead to issues.

See docs [Setup Environment Variables](/developers/self-host/capabilities/setup) for advanced configuration. All environment variables must be declared in the docker-compose.yml file at the server and / or worker level depending on the variable.

## System Requirements

* RAM: Ensure your environment has at least 2GB of RAM. Insufficient memory can cause processes to crash.
* Docker & Docker Compose: Make sure both are installed and up-to-date.

## Option 1: One-line script

Install the latest stable version of Twenty with a single command:

```bash
bash <(curl -sL https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-docker/scripts/install.sh)
```

To install a specific version or branch:

```bash
VERSION=vx.y.z BRANCH=branch-name bash <(curl -sL https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-docker/scripts/install.sh)
```

* Replace x.y.z with the desired version number.
* Replace branch-name with the name of the branch you want to install.

## Option 2: Manual steps

Follow these steps for a manual setup.

### Step 1: Set Up the Environment File

1. **Create the .env File**

   Copy the example environment file to a new .env file in your working directory:

   ```bash
   curl -o .env https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/.env.example
   ```

2. **Generate Secret Tokens**

   Run the following command to generate a unique random string:

   ```bash
   openssl rand -base64 32
   ```

   **Important:** Keep this value secret / do not share it.

3. **Update the `.env`**

   Replace the placeholder value in your .env file with the generated token:

   ```ini
   APP_SECRET=first_random_string
   ```

4. **Set the Postgres Password**

   Update the `PG_DATABASE_PASSWORD` value in the .env file with a strong password. Special characters are allowed but must be handled correctly:
   - **In `.env` files** : wrap the value in single quotes (e.g., `PG_DATABASE_PASSWORD='my$tr0ng!P@ss'`).
   - **Characters to avoid or escape** : the characters `'` (single quote) and `\` (backslash) can cause parsing issues in some `.env` loaders — avoid them or escape with `\`.
   - **In `DATABASE_URL`** : if your password contains `@`, `:`, `/`, or `#`, URL-encode them (e.g., `@` → `%40`, `#` → `%23`).
   - Use a password generator to create a 32+ character password with mixed case, numbers, and symbols for maximum entropy.

   ```ini
   PG_DATABASE_PASSWORD=my_strong_password
   ```

### Step 2: Obtain the Docker Compose File

Download the `docker-compose.yml` file to your working directory:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/twentyhq/twenty/refs/heads/main/packages/twenty-docker/docker-compose.yml
```

### Step 3: Launch the Application

Start the Docker containers:

```bash
docker compose up -d
```

### Step 4: Access the Application

If you host twentyCRM on your own computer, open your browser and navigate to [http://localhost:3000](http://localhost:3000).

If you host it on a server, check that the server is running and that everything is ok with

```bash
curl http://localhost:3000
```

## Configuration

### Expose Twenty to External Access

By default, Twenty runs on `localhost` at port `3000`. To access it via an external domain or IP address, you need to configure the `SERVER_URL` in your `.env` file.

#### Understanding `SERVER_URL`

* **Protocol:** Use `http` or `https` depending on your setup.
  * Use `http` if you haven't set up SSL.
  * Use `https` if you have SSL configured.
* **Domain/IP:** This is the domain name or IP address where your application is accessible.
* **Port:** Include the port number if you're not using the default ports (`80` for `http`, `443` for `https`).

### SSL Requirements

SSL (HTTPS) is required for certain browser features to work properly. While these features might work during local development (as browsers treat localhost differently), a proper SSL setup is needed when hosting Twenty on a regular domain.

For example, the clipboard API might require a secure context - some features like copy buttons throughout the application might not work without HTTPS enabled.

We strongly recommend setting up Twenty behind a reverse proxy with SSL termination for optimal security and functionality.

#### Configuring `SERVER_URL`

1. **Determine Your Access URL**
   * **Without Reverse Proxy (Direct Access):**

     If you're accessing the application directly without a reverse proxy:

     ```ini
     SERVER_URL=http://your-domain-or-ip:3000
     ```

   * **With Reverse Proxy (Standard Ports):**

     If you're using a reverse proxy like Nginx or Traefik and have SSL configured:

     ```ini
     SERVER_URL=https://your-domain-or-ip
     ```

   * **With Reverse Proxy (Custom Ports):**

     If you're using non-standard ports:

     ```ini
     SERVER_URL=https://your-domain-or-ip:custom-port
     ```

2. **Update the `.env` File**

   Open your `.env` file and update the `SERVER_URL`:

   ```ini
   SERVER_URL=http(s)://your-domain-or-ip:your-port
   ```

   **Examples:**

   * Direct access without SSL:
     ```ini
     SERVER_URL=http://123.45.67.89:3000
     ```
   * Access via domain with SSL:
     ```ini
     SERVER_URL=https://mytwentyapp.com
     ```

3. **Restart the Application**

   For changes to take effect, restart the Docker containers:

   ```bash
   docker compose down
   docker compose up -d
   ```

#### Considerations

* **Reverse Proxy Configuration:**

  Ensure your reverse proxy forwards requests to the correct internal port (`3000` by default). Configure SSL termination and any necessary headers.

* **Firewall Settings:**

  Open necessary ports in your firewall to allow external access.

* **Consistency:**

  The `SERVER_URL` must match how users access your application in their browsers.

#### Persistence

* **Data Volumes:**

  The Docker Compose configuration uses volumes to persist data for the database and server storage.

* **Stateless Environments:**

  If deploying to a stateless environment (e.g., certain cloud services), configure external storage to persist data.

## Backup and Restore

Regular backups protect your CRM data from loss.

### Create a Database Backup

```bash
docker exec twenty-postgres pg_dump -U postgres twenty > backup_$(date +%Y%m%d).sql
```

### Automate Daily Backups

Add to your crontab (`crontab -e`):

```bash
0 2 * * * docker exec twenty-postgres pg_dump -U postgres twenty > /backups/twenty_$(date +\%Y\%m\%d).sql
```

### Restore from Backup

1. Stop the application:

```bash
docker compose stop twenty-server twenty-front
```

2. Restore the database:

```bash
docker exec -i twenty-postgres psql -U postgres twenty < backup_20240115.sql
```

3. Restart services:

```bash
docker compose up -d
```

### Backup Best Practices

* **Test restores regularly** — verify backups actually work
* **Store backups off-site** — use cloud storage (S3, GCS, etc.)
* **Encrypt sensitive data** — protect backups with encryption
* **Retain multiple copies** — keep daily, weekly, and monthly backups

## Troubleshooting

If you encounter any problem, check [Troubleshooting](/developers/self-host/capabilities/troubleshooting) for solutions.

---

# Configuration Management

> [!WARNING]
> **First time installing?** Follow the [Docker Compose installation guide](#1-click-w-docker-compose) to get Twenty running, then return here for configuration.

Twenty offers **two configuration modes** to suit different deployment needs:

**Admin panel access:** Only users with admin privileges (`canAccessFullAdminPanel: true`) can access the configuration interface.

## 1. Admin Panel Configuration (Default)

```bash
IS_CONFIG_VARIABLES_IN_DB_ENABLED=true  # default
```

**Most configuration happens through the UI** after installation:

1. Access your Twenty instance (usually `http://localhost:3000`)
2. Go to **Settings / Admin Panel / Configuration Variables**
3. Configure integrations, email, storage, and more
4. Changes take effect immediately (within 15 seconds for multi-container deployments)

> [!WARNING]
> **Multi-Container Deployments:** When using database configuration (`IS_CONFIG_VARIABLES_IN_DB_ENABLED=true`), both server and worker containers read from the same database. Admin panel changes affect both automatically, eliminating the need to duplicate environment variables between containers (except for infrastructure variables).

**What you can configure through the admin panel:**

* **Authentication** - Google/Microsoft OAuth, password settings
* **Email** - SMTP settings, templates, verification
* **Storage** - S3 configuration, local storage paths
* **Integrations** - Gmail, Google Calendar, Microsoft services
* **Workflow & Rate Limiting** - Execution limits, API throttling
* **And much more...**

> [!WARNING]
> Each variable is documented with descriptions in your admin panel at **Settings → Admin Panel → Configuration Variables**.
> Some infrastructure settings like database connections (`PG_DATABASE_URL`), server URLs (`SERVER_URL`), and app secrets (`APP_SECRET`) can only be configured via `.env` file.
>
> [Complete technical reference →](https://github.com/twentyhq/twenty/blob/main/packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts)

## 2. Environment-Only Configuration

```bash
IS_CONFIG_VARIABLES_IN_DB_ENABLED=false
```

**All configuration managed through `.env` files:**

1. Set `IS_CONFIG_VARIABLES_IN_DB_ENABLED=false` in your `.env` file
2. Add all configuration variables to your `.env` file
3. Restart containers for changes to take effect
4. Admin panel will show current values but cannot modify them

## Multi-Workspace Mode

By default, Twenty runs in **single-workspace mode** — ideal for most self-hosted deployments where you need one CRM instance for your organization.

### Single-Workspace Mode (Default)

```bash
IS_MULTIWORKSPACE_ENABLED=false  # default
```

* One workspace per Twenty instance
* First user automatically becomes admin with full privileges (`canImpersonate` and `canAccessFullAdminPanel`)
* New signups are disabled after the first workspace is created
* Simple URL structure: `https://your-domain.com`

### Enabling Multi-Workspace Mode

```bash
IS_MULTIWORKSPACE_ENABLED=true
DEFAULT_SUBDOMAIN=app  # default value
```

Enable multi-workspace mode for SaaS-like deployments where multiple independent teams need their own workspaces on the same Twenty instance.

**Key differences from single-workspace mode:**

* Multiple workspaces can be created on the same instance
* Each workspace gets its own subdomain (e.g., `sales.your-domain.com`, `marketing.your-domain.com`)
* Users sign up and log in at `{DEFAULT_SUBDOMAIN}.your-domain.com` (e.g., `app.your-domain.com`)
* No automatic admin privileges — first user in each workspace is a regular user
* Workspace-specific settings like subdomain and custom domain become available in workspace settings

> [!WARNING]
> **Environment-only setting:** `IS_MULTIWORKSPACE_ENABLED` can only be configured via `.env` file and requires a restart. It cannot be changed through the admin panel.

### DNS Configuration for Multi-Workspace

When using multi-workspace mode, configure your DNS with a wildcard record to allow dynamic subdomain creation:

```
*.your-domain.com -> your-server-ip
```

This enables automatic subdomain routing for new workspaces without manual DNS configuration.

### Restricting Workspace Creation

In multi-workspace mode, you may want to limit who can create new workspaces:

```bash
IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS=true
```

When enabled, only users with `canAccessFullAdminPanel` can create additional workspaces. Users can still create their first workspace during initial signup.

## Gmail & Google Calendar Integration

### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:

* [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
* [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
* [People API](https://console.cloud.google.com/apis/library/people.googleapis.com)

### Configure OAuth

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add these redirect URIs:
   * `https://{your-domain}/auth/google/redirect` (for SSO)
   * `https://{your-domain}/auth/google-apis/get-access-token` (for integrations)

### Configure in Twenty

1. Go to **Settings → Admin Panel → Configuration Variables**
2. Find the **Google Auth** section
3. Set these variables:
   * `MESSAGING_PROVIDER_GMAIL_ENABLED=true`
   * `CALENDAR_PROVIDER_GOOGLE_ENABLED=true`
   * `AUTH_GOOGLE_CLIENT_ID={client-id}`
   * `AUTH_GOOGLE_CLIENT_SECRET={client-secret}`
   * `AUTH_GOOGLE_CALLBACK_URL=https://{your-domain}/auth/google/redirect`
   * `AUTH_GOOGLE_APIS_CALLBACK_URL=https://{your-domain}/auth/google-apis/get-access-token`

> [!WARNING]
> **Environment-only mode:** If you set `IS_CONFIG_VARIABLES_IN_DB_ENABLED=false`, add these variables to your `.env` file instead.

**Required scopes** (automatically configured):
[See relevant source code](https://github.com/twentyhq/twenty/blob/main/packages/twenty-server/src/engine/core-modules/auth/utils/get-google-apis-oauth-scopes.ts#L4-L10)

* `https://www.googleapis.com/auth/calendar.events`
* `https://www.googleapis.com/auth/gmail.readonly`
* `https://www.googleapis.com/auth/profile.emails.read`

### If your app is in test mode

If your app is in test mode, you will need to add test users to your project.

Under [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent), add your test users to the "Test users" section.

## Microsoft 365 Integration

> [!WARNING]
> Users must have a [Microsoft 365 Licence](https://admin.microsoft.com/Adminportal/Home) to be able to use the Calendar and Messaging API. They will not be able to sync their account on Twenty without one.

### Create a project in Microsoft Azure

You will need to create a project in [Microsoft Azure](https://portal.azure.com/#view/Microsoft_AAD_IAM/AppGalleryBladeV2) and get the credentials.

### Enable APIs

On Microsoft Azure Console enable the following APIs in "Permissions":

* Microsoft Graph: Mail.ReadWrite
* Microsoft Graph: Mail.Send
* Microsoft Graph: Calendars.Read
* Microsoft Graph: User.Read
* Microsoft Graph: openid
* Microsoft Graph: email
* Microsoft Graph: profile
* Microsoft Graph: offline\_access

Note: "Mail.ReadWrite" and "Mail.Send" are only mandatory if you want to send emails using our workflow actions. You can use "Mail.Read" instead if you only want to receive emails.

### Authorized redirect URIs

You need to add the following redirect URIs to your project:

* `https://{your-domain}/auth/microsoft/redirect` if you want to use Microsoft SSO
* `https://{your-domain}/auth/microsoft-apis/get-access-token`

### Configure in Twenty

1. Go to **Settings → Admin Panel → Configuration Variables**
2. Find the **Microsoft Auth** section
3. Set these variables:
   * `MESSAGING_PROVIDER_MICROSOFT_ENABLED=true`
   * `CALENDAR_PROVIDER_MICROSOFT_ENABLED=true`
   * `AUTH_MICROSOFT_ENABLED=true`
   * `AUTH_MICROSOFT_CLIENT_ID={client-id}`
   * `AUTH_MICROSOFT_CLIENT_SECRET={client-secret}`
   * `AUTH_MICROSOFT_CALLBACK_URL=https://{your-domain}/auth/microsoft/redirect`
   * `AUTH_MICROSOFT_APIS_CALLBACK_URL=https://{your-domain}/auth/microsoft-apis/get-access-token`

> [!WARNING]
> **Environment-only mode:** If you set `IS_CONFIG_VARIABLES_IN_DB_ENABLED=false`, add these variables to your `.env` file instead.

### Configure scopes

[See relevant source code](https://github.com/twentyhq/twenty/blob/main/packages/twenty-server/src/engine/core-modules/auth/utils/get-microsoft-apis-oauth-scopes.ts#L2-L9)

* 'openid'
* 'email'
* 'profile'
* 'offline\_access'
* 'Mail.ReadWrite'
* 'Mail.Send'
* 'Calendars.Read'

### If your app is in test mode

If your app is in test mode, you will need to add test users to your project.

Add your test users to the "Users and groups" section.

## Background Jobs for Calendar & Messaging

After configuring Gmail, Google Calendar, or Microsoft 365 integrations, you need to start the background jobs that sync data.

### How to register these jobs

Each command below is a **one-shot execution** that processes pending items and exits. They must be run **on a recurring schedule** (e.g., every 5 minutes) using one of the following mechanisms:

**Option A: System crontab (Linux/macOS)**

Add entries to your crontab (`crontab -e`) pointing to your worker container:

```bash
# Example: run every 5 minutes inside the worker container
*/5 * * * * docker exec twenty-worker yarn command:prod cron:messaging:messages-import
*/5 * * * * docker exec twenty-worker yarn command:prod cron:messaging:message-list-fetch
*/5 * * * * docker exec twenty-worker yarn command:prod cron:calendar:calendar-event-list-fetch
*/5 * * * * docker exec twenty-worker yarn command:prod cron:calendar:calendar-events-import
*/10 * * * * docker exec twenty-worker yarn command:prod cron:messaging:ongoing-stale
*/10 * * * * docker exec twenty-worker yarn command:prod cron:calendar:ongoing-stale
*/5 * * * * docker exec twenty-worker yarn command:prod cron:workflow:automated-cron-trigger
```

**Option B: Kubernetes CronJob**

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: twenty-messaging-import
spec:
  schedule: "*/5 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: worker
            image: your-twenty-worker-image
            command: ["yarn", "command:prod", "cron:messaging:messages-import"]
          restartPolicy: OnFailure
```

### Complete list of recurring jobs

```bash
yarn command:prod cron:messaging:messages-import
yarn command:prod cron:messaging:message-list-fetch
yarn command:prod cron:calendar:calendar-event-list-fetch
yarn command:prod cron:calendar:calendar-events-import
yarn command:prod cron:messaging:ongoing-stale
yarn command:prod cron:calendar:ongoing-stale
yarn command:prod cron:workflow:automated-cron-trigger
```

## Email Configuration

1. Go to **Settings → Admin Panel → Configuration Variables**
2. Find the **Email** section
3. Configure your SMTP settings:

### Gmail
You will need to provision an [App Password](https://support.google.com/accounts/answer/185833).

* EMAIL\_DRIVER=smtp
* EMAIL\_SMTP\_HOST=smtp.gmail.com
* EMAIL\_SMTP\_PORT=465
* EMAIL\_SMTP\_USER=gmail\_email\_address
* EMAIL\_SMTP\_PASSWORD='gmail\_app\_password'

### Office365
Keep in mind that if you have 2FA enabled, you will need to provision an [App Password](https://support.microsoft.com/en-us/account-billing/manage-app-passwords-for-two-step-verification-d6dc8c6d-4bf7-4851-ad95-6d07799387e9).

* EMAIL\_DRIVER=smtp
* EMAIL\_SMTP\_HOST=smtp.office365.com
* EMAIL\_SMTP\_PORT=587
* EMAIL\_SMTP\_USER=office365\_email\_address
* EMAIL\_SMTP\_PASSWORD='office365\_password'

### Smtp4dev
**smtp4dev** is a fake SMTP email server for development and testing.

* Run the smtp4dev image: `docker run --rm -it -p 8090:80 -p 2525:25 rnwood/smtp4dev`
* Access the smtp4dev ui here: [http://localhost:8090](http://localhost:8090)
* Set the following variables:
  * EMAIL\_DRIVER=smtp
  * EMAIL\_SMTP\_HOST=localhost
  * EMAIL\_SMTP\_PORT=2525

> [!WARNING]
> **Environment-only mode:** If you set `IS_CONFIG_VARIABLES_IN_DB_ENABLED=false`, add these variables to your `.env` file instead.

## Logic Functions

Twenty supports logic functions for workflows and custom logic. The execution environment is configured via the `SERVERLESS_TYPE` environment variable.

> [!WARNING]
> **Security Notice:** The local driver (`SERVERLESS_TYPE=LOCAL`) runs code directly on the host in a Node.js process with no sandboxing. It should only be used for trusted code in development. For production deployments handling untrusted code, we highly recommend using `SERVERLESS_TYPE=LAMBDA` or `SERVERLESS_TYPE=DISABLED`.

### Available Drivers

| Driver   | Environment Variable       | Use Case                             | Security Level                  |
| -------- | -------------------------- | ------------------------------------ | ------------------------------- |
| Disabled | `SERVERLESS_TYPE=DISABLED` | Disable logic functions entirely     | N/A                             |
| Local    | `SERVERLESS_TYPE=LOCAL`    | Development and trusted environments | Low (no sandboxing)             |
| Lambda   | `SERVERLESS_TYPE=LAMBDA`   | Production with untrusted code       | High (hardware-level isolation) |

### Recommended Configuration

**For development:**

```bash
SERVERLESS_TYPE=LOCAL  # default
```

**For production (AWS):**

```bash
SERVERLESS_TYPE=LAMBDA
SERVERLESS_LAMBDA_REGION=us-east-1
SERVERLESS_LAMBDA_ROLE=arn:aws:iam::123456789:role/your-lambda-role
SERVERLESS_LAMBDA_ACCESS_KEY_ID=your-access-key
SERVERLESS_LAMBDA_SECRET_ACCESS_KEY=your-secret-key
```

**To disable logic functions:**

```bash
SERVERLESS_TYPE=DISABLED
```

> [!NOTE]
> When using `SERVERLESS_TYPE=DISABLED`, any attempt to execute a logic function will return an error. This is useful if you want to run Twenty without logic function capabilities.
