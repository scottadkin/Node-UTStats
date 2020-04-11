#Webserver Assets

Files to set-up a full stack instalation on a Linux webserver. 

## syslog

Recomended to install the syslog file first, so the logs will be written by the first run.

File: `syslog/ut-stats.conf`

1. Dependencies: install `rsyslog` package from your distro. example: `apt install rsyslog`.
2. On your webserver, copy file to `/etc/rsyslog.d/` directory
3. run `systemctl restart syslog`

## Systemd

To install the systemd service:

File: `systemd/ut-stats.service` 

1. Change `WorkingDirectory` to your Webserver folder.
2. On your webserver, copy systemd file to `/etc/systemd/system/` folder
3. run `systemctl daemon-reload`
4. run `systemctl start ut-stats`

### optional

It's not secure to run daemon as root, we recommend to run as a regular user.

1. Add ut-stats user `useradd -M -s /bin/false ut-stats`
2. edit systemd file uncomentting `User` and `Group` directives
3. Restart daemon if it's up: `systemctl restart ut-stats`

## Logrotate (optional)

It's not cool to full your server disk with logfiles, logrotate will split and compact your logs daily.

File: `logrotate/ut-stats`

1. copy logrotate file to `/etc/logrotate.d/` folder.

## nginx (optional)

Use nginx to hide port number and install ssl certificate to your stats website.

Instalation will depend from your server setup, but you can use `nginx/ut-stats.conf` file to your reference.
