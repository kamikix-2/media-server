# media-server

Stack multimedia autohospedado con Docker Compose para:
- Streaming (Jellyfin)
- Biblioteca de libros (Calibre Web)
- Gestion de fotos y videos (Immich)
- Sincronizacion bidireccional con OneDrive (rclone bisync)
- Reverse proxy HTTPS con certificados Let's Encrypt (SWAG + DuckDNS)
- VPN (WireGuard) y navegador aislado por VPN (Kasm Chrome)

## Arquitectura

Servicios incluidos en [docker/docker-compose.yml](docker/docker-compose.yml):
- `swag`: Nginx reverse proxy + SSL automatico.
- `rclone-sync`: sincroniza `pelis`, `musica`, `fotos` y `calibre-biblioteca` con OneDrive.
- `jellyfin`: servidor multimedia.
- `calibre-web`: interfaz web para biblioteca Calibre.
- `immich-server`: servidor principal de Immich.
- `immich-machine-learning`: modelos ML para Immich.
- `immich-redis`: cache/cola para Immich.
- `immich-postgres`: base de datos PostgreSQL con `pgvecto-rs`.
- `wireguard`: servidor VPN.
- `navegador`: navegador Chrome (Kasm) con `network_mode: service:wireguard`.

## Caracteristicas principales

- HTTPS automatico con Let's Encrypt mediante SWAG.
- Soporte de subdominios DuckDNS para cada app.
- Proxy-confs versionados en git:
  - [docker/swag/nginx/proxy-confs/jellyfin.subdomain.conf](docker/swag/nginx/proxy-confs/jellyfin.subdomain.conf)
  - [docker/swag/nginx/proxy-confs/calibre-web.subdomain.conf](docker/swag/nginx/proxy-confs/calibre-web.subdomain.conf)
  - [docker/swag/nginx/proxy-confs/immich-server.subdomain.conf](docker/swag/nginx/proxy-confs/immich-server.subdomain.conf)
  - [docker/swag/nginx/proxy-confs/navegador-vpn.subdomain.conf](docker/swag/nginx/proxy-confs/navegador-vpn.subdomain.conf)
- Sincronizacion rclone con estrategia robusta:
  - Primera ejecucion con `--resync`.
  - Ejecuciones periodicas (`SYNC_INTERVAL`).
  - Recuperacion automatica de errores con resync.
  - Limpieza de locks de bisync.
- Persistencia por volumenes Docker para configuraciones y BD.
- Librerias multimedia locales fuera de git (`pelis/`, `musica/`, `fotos/`, `calibre-biblioteca/`).

## Estructura del repo

```text
media-server/
  .gitignore
  README.md
  calibre-biblioteca/
  fotos/
  musica/
  pelis/
  docker/
    .env
    docker-compose.yml
    rclone/
      rclone.conf
      sync.sh
    swag/
      nginx/
        proxy-confs/
          calibre-web.subdomain.conf
          immich-server.subdomain.conf
          jellyfin.subdomain.conf
          navegador-vpn.subdomain.conf
```

## Requisitos

- Debian/Ubuntu recomendado.
- Docker Engine + Docker Compose plugin.
- Dominio DuckDNS configurado (si usas acceso externo con SWAG).
- Puertos abiertos en router/firewall (al menos 80, 443, 51820/udp).

## Instalacion rapida (Debian)

1. Instalar Docker:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER
newgrp docker
```

2. Clonar en `/opt` y ajustar permisos:

```bash
sudo mkdir -p /opt/media-server
sudo chown -R $USER:$USER /opt/media-server
git clone https://github.com/kamikix-2/media-server.git /opt/media-server
```

3. Revisar variables en [docker/.env](docker/.env):
- Rutas locales (`PELIS_DIR`, `MUSICA_DIR`, `FOTOS_DIR`, `CALIBRE_DIR`)
- DuckDNS (`SWAG_SUBDOMAIN`, `DUCKDNS_TOKEN`)
- SSL (`SWAG_EMAIL`, `SWAG_VALIDATION`, `SWAG_CERTPROVIDER`)
- Immich (`IMMICH_DB_PASSWORD`)
- WireGuard (`WIREGUARD_*`)

4. Crear carpetas de datos si no existen:

```bash
mkdir -p /opt/media-server/pelis \
         /opt/media-server/musica \
         /opt/media-server/fotos \
         /opt/media-server/calibre-biblioteca
```

5. Levantar el stack:

```bash
cd /opt/media-server
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d
```

6. Verificar:

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env ps
docker compose -f docker/docker-compose.yml --env-file docker/.env logs -f --tail=100
```

## Arranque automatico al reiniciar (systemd)

Para que Debian ejecute `docker compose up -d` automaticamente al iniciar:

0. Asegurar que el usuario `kamikix` existe, tiene acceso a Docker y permiso sobre el proyecto:

```bash
sudo usermod -aG docker kamikix
sudo chown -R kamikix:kamikix /opt/media-server
```

La unidad incluida en este repo ya esta configurada para ejecutarse con `User=kamikix`.

1. Copiar la unidad incluida en el repo:

```bash
sudo cp /opt/media-server/docker/systemd/media-server.service /etc/systemd/system/media-server.service
```

2. Recargar `systemd`, habilitar y arrancar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable media-server.service
sudo systemctl start media-server.service
```

3. Verificar estado:

```bash
sudo systemctl status media-server.service
docker compose -f /opt/media-server/docker/docker-compose.yml --env-file /opt/media-server/docker/.env ps
```

4. Probar reinicio del host:

```bash
sudo reboot
```

5. Al volver, comprobar que todo levanto:

```bash
sudo systemctl status media-server.service
docker compose -f /opt/media-server/docker/docker-compose.yml --env-file /opt/media-server/docker/.env ps
```

## Endpoints y puertos

Locales:
- Jellyfin: `http://HOST:8096`
- Calibre Web: `http://HOST:8083`
- Immich: `http://HOST:2283`
- Navegador Kasm (via WireGuard): `http://HOST:6901`

Externos (HTTPS por SWAG, segun proxy-confs):
- Jellyfin: `https://kamikix.duckdns.org`
- Calibre Web: `https://kamikix-calibre.duckdns.org`
- Immich: `https://kamikix-fotos.duckdns.org`
- Navegador VPN: `https://kamikix-vpn.duckdns.org`

## Variables importantes

Archivo: [docker/.env](docker/.env)

- `TZ`: zona horaria.
- `PUID` / `PGID`: uid/gid usados por contenedores linuxserver.
- `RCLONE_CONFIG_DIR`: ubicacion de `rclone.conf` en el host.
- `SYNC_INTERVAL`: intervalo de sincronizacion en segundos.
- `PELIS_DIR`, `MUSICA_DIR`, `FOTOS_DIR`, `CALIBRE_DIR`: rutas locales de contenido.
- `IMMICH_DB_PASSWORD`: password de PostgreSQL para Immich.
- `SWAG_*` y `DUCKDNS_TOKEN`: parametros de certificados y dominio.
- `WIREGUARD_*`: configuracion VPN.

## rclone bisync

Script: [docker/rclone/sync.sh](docker/rclone/sync.sh)

Sincroniza estas rutas:
- `/data/pelis` <-> `onedrive:/NUBE/Pelis`
- `/data/musica` <-> `onedrive:/NUBE/Musica`
- `/data/fotos` <-> `onedrive:/Imágenes`
- `/data/calibre` <-> `onedrive:/NUBE/Calibre Biblioteca`

Comportamiento:
- Primera ejecucion por carpeta: `--resync`.
- Ejecucion normal posterior: `bisync`.
- Si falla: elimina flag y reintenta con `--resync`.
- Estado persistente en volumen `rclone-bisync-state`.

## Seguridad y buenas practicas

- No subir secretos a git:
  - `docker/.env`
  - `docker/rclone/rclone.conf`
  - claves/certs generados por SWAG y WireGuard.
- Rotar inmediatamente secretos reales si se han expuesto publicamente (tokens, passwords, email de administracion).
- Usar passwords fuertes para Immich, WireGuard y Kasm (`VNC_PW`).
- Limitar acceso publico con firewall y/o fail2ban si expones servicios.

## Operacion diaria

Actualizar imagenes y recrear contenedores:

```bash
cd /opt/media-server
docker compose -f docker/docker-compose.yml --env-file docker/.env pull
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d
```

Parar todo:

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env down
```

Reiniciar un servicio:

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env restart jellyfin
```

Ver logs de un servicio:

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env logs -f immich-server
```

## Troubleshooting rapido

- Error de permisos en `/opt/media-server`:

```bash
sudo chown -R $USER:$USER /opt/media-server
```

- SWAG no emite certificados:
  - Revisar `DUCKDNS_TOKEN`, `SWAG_SUBDOMAIN`, `SWAG_VALIDATION` y apertura de puertos 80/443.
  - Ver logs de `swag`.

- rclone no sincroniza:
  - Verificar [docker/rclone/rclone.conf](docker/rclone/rclone.conf).
  - Ver logs de `rclone-sync`.

- Immich no arranca:
  - Comprobar `IMMICH_DB_PASSWORD` consistente entre `immich-server` y `immich-postgres`.
  - Ver estado de `immich-redis` y `immich-postgres`.

## Notas

- Este proyecto prioriza datos persistentes en host y configuracion por variables de entorno.
- Los `proxy-confs` estan pensados para mantenerse versionados y desplegarse por git.
