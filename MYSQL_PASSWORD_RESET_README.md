# MySQL Password Reset Guide

This guide helps you reset your MySQL root password from `Mysql123!@#` to `Mysql123!@@` to avoid issues with the `#` character in `.env` files.

## Quick Method (Recommended)

Run the PowerShell script as Administrator:

```powershell
# Right-click PowerShell and select "Run as Administrator"
cd "D:\PROJECTS\MY PROJECTS\appapp"
.\reset-mysql-password-v2.ps1
```

## Manual Method (If Script Doesn't Work)

### Step 1: Stop MySQL Service
```powershell
Stop-Service -Name "MySQL80" -Force
```

### Step 2: Create Initialization File
Create a file at `C:\temp\mysql-init.txt` with this content:
```
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mysql123!@@';
```

### Step 3: Start MySQL with Init File
```powershell
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
.\mysqld.exe --init-file="C:\temp\mysql-init.txt" --console
```

Wait 5-10 seconds, then press `Ctrl+C` to stop it.

### Step 4: Start MySQL Service Normally
```powershell
Start-Service -Name "MySQL80"
```

### Step 5: Test the New Password
```powershell
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
.\mysql.exe -u root -p
# Enter password: Mysql123!@@
```

## Alternative: Using MySQL Workbench or Command Line

If you can still log in with the old password:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Mysql123!@@';
FLUSH PRIVILEGES;
```

## Update Your .env File

After resetting the password, update your `.env` file:

```env
DB_PASSWORD=Mysql123!@@
```

Note: The new password uses `@@` instead of `!@#` to avoid the `#` character which is used for comments in `.env` files.

## Troubleshooting

### If MySQL service won't start:
1. Check Windows Event Viewer for MySQL errors
2. Verify MySQL data directory permissions
3. Check if port 3306 is already in use

### If password reset doesn't work:
1. Make sure you're running PowerShell as Administrator
2. Check that MySQL is installed at: `C:\Program Files\MySQL\MySQL Server 8.0`
3. Verify the service name is `MySQL80` (check with `Get-Service | Where-Object {$_.Name -like "*mysql*"}`)

### If you get "Access Denied" errors:
- Make sure you're running commands as Administrator
- Check Windows Firewall settings
- Verify MySQL service account permissions

