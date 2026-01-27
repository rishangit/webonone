# Oracle Cloud Infrastructure (OCI) Setup Guide

This guide helps you configure your backend to use Oracle Cloud MySQL Database Service.

## Prerequisites

- Oracle Cloud Infrastructure account
- MySQL DB System created in OCI (mysql-appapp)
- Access to OCI Console

## Step 1: Get Your MySQL Endpoint

1. Log in to [Oracle Cloud Console](https://cloud.oracle.com/)
2. Navigate to: **Databases** → **MySQL** → **mysql-appapp**
3. Click on **Endpoints** tab
4. Copy the **Hostname** or **IP Address** of your MySQL endpoint
   - For public endpoints: Usually in format `mysql-appapp.mysql.uk-london-1.oci.oraclecloud.com`
   - For private endpoints: An IP address in your VCN

## Step 2: Configure Environment Variables

### Option A: Create .env.oracle file (Recommended)

```bash
cd back-end
cp .env.oracle.template .env.oracle
```

Then edit `.env.oracle` and replace:
- `<your-mysql-endpoint>` with your actual MySQL endpoint from Step 1
- `your-super-secret-jwt-key-change-this-in-production-use-strong-random-string` with a strong random string
- `https://your-frontend-domain.com` with your actual frontend URL

### Option B: Update existing .env file

Edit your `.env` file and update the database configuration:

```env
DB_HOST=your-mysql-endpoint.mysql.uk-london-1.oci.oraclecloud.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=Mysql123!@@
DB_NAME=appapp
```

## Step 3: Configure Network Security

### Allow MySQL Access from Your Compute Instance

1. In OCI Console, go to your MySQL DB System: **mysql-appapp**
2. Click on **Networking** or **Security**
3. Add an **Ingress Rule** to allow MySQL connections:
   - **Source Type**: CIDR
   - **Source CIDR**: Your compute instance's subnet CIDR (e.g., `10.0.0.0/24`)
   - **Destination Port**: `3306`
   - **Protocol**: TCP

### Or Use Security List (If using VCN)

1. Navigate to: **Networking** → **Virtual Cloud Networks** → Your VCN
2. Click on **Security Lists** → Select your security list
3. Add **Ingress Rule**:
   - **Source**: Your compute instance subnet CIDR
   - **IP Protocol**: TCP
   - **Destination Port Range**: 3306

## Step 4: Test Database Connection

From your compute instance, test the connection:

```bash
mysql -h <your-mysql-endpoint> -u admin -p appapp
# Enter password: Mysql123!@@
```

If connection succeeds, you're ready to proceed!

## Step 5: Initialize Database

Run the database initialization scripts:

```bash
cd back-end
node scripts/initDatabase.js
node scripts/seedDatabase.js  # Optional - for sample data
```

## Step 6: Start Your Application

```bash
# Using PM2 (recommended for production)
pm2 start server.js --name "appapp-backend" --env production

# Or using npm
NODE_ENV=production npm start
```

## Current Configuration

- **DB System Name**: mysql-appapp
- **Region**: uk-london-1
- **Username**: admin
- **Password**: Mysql123!@@
- **Database Name**: appapp
- **Port**: 3306 (default MySQL port)

## Troubleshooting

### Connection Refused Error

- Verify security list/network rules allow port 3306
- Check that MySQL endpoint is correct
- Ensure you're using the correct port (3306 for OCI MySQL)

### Authentication Failed

- Verify username is `admin` (case-sensitive)
- Check password: `Mysql123!@@`
- Ensure database name is `appapp`

### Cannot Find Endpoint

- Check that MySQL DB System is in **Active** state
- Wait for DB System to finish creating (can take 10-15 minutes)
- Check **Endpoints** tab in DB System details

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use OCI Vault** to store sensitive credentials
3. **Rotate passwords** regularly
4. **Use private endpoints** when possible
5. **Enable SSL/TLS** for database connections
6. **Restrict network access** to only necessary IPs/subnets

## Additional Resources

- [OCI MySQL Documentation](https://docs.oracle.com/en-us/iaas/mysql-database/)
- [OCI Networking Documentation](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm)
- [OCI Security Lists](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securitylists.htm)
