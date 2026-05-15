#!/bin/sh
# ============================================================
#  rclone bisync - Pelis + Calibre Biblioteca -> OneDrive
#  Replica la logica de los .bat de c:/media-server/scripts
# ============================================================

INTERVAL=${SYNC_INTERVAL:-3600}
CACHE_DIR=/bisync-state
RCLONE_CONF=/config/rclone/rclone.conf

clear_bisync_locks() {
    lock_dir="$CACHE_DIR/.cache/rclone/bisync"
    if [ -d "$lock_dir" ]; then
        find "$lock_dir" -maxdepth 1 -type f -name '*.lck' -delete
    fi
}

# ---- Funcion principal de sincronizacion -------------------
run_bisync() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ===== Iniciando sincronizacion ====="

    # --- PELIS ---
    FLAG_PELIS="$CACHE_DIR/pelis_initialized.flag"
    if [ ! -f "$FLAG_PELIS" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Pelis] Primera ejecucion - resync completo..."
        clear_bisync_locks
        rclone bisync /data/pelis "onedrive:/NUBE/Pelis" \
            --resync \
            --cache-dir "$CACHE_DIR" \
            --config "$RCLONE_CONF" \
            --verbose \
        && touch "$FLAG_PELIS" \
        || echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Pelis] ERROR en resync inicial"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Pelis] Ejecutando bisync normal..."
        clear_bisync_locks
        rclone bisync /data/pelis "onedrive:/NUBE/Pelis" \
            --cache-dir "$CACHE_DIR" \
            --config "$RCLONE_CONF" \
            --verbose \
        || {
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Pelis] Error - ejecutando resync de recuperacion..."
            rm -f "$FLAG_PELIS"
            rclone bisync /data/pelis "onedrive:/NUBE/Pelis" \
                --resync \
                --cache-dir "$CACHE_DIR" \
                --config "$RCLONE_CONF" \
                --verbose \
            && touch "$FLAG_PELIS"
        }
    fi


    # --- MUSICA ---
    FLAG_MUSICA="$CACHE_DIR/musica_initialized.flag"
    if [ ! -f "$FLAG_MUSICA" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Musica] Primera ejecucion - resync completo..."
        clear_bisync_locks
        rclone bisync /data/musica "onedrive:/NUBE/Musica" \
            --resync \
            --cache-dir "$CACHE_DIR" \
            --config "$RCLONE_CONF" \
            --verbose \
        && touch "$FLAG_MUSICA" \
        || echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Musica] ERROR en resync inicial"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Musica] Ejecutando bisync normal..."
        clear_bisync_locks
        rclone bisync /data/musica "onedrive:/NUBE/Musica" \
            --cache-dir "$CACHE_DIR" \
            --config "$RCLONE_CONF" \
            --verbose \
        || {
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Musica] Error - ejecutando resync de recuperacion..."
            rm -f "$FLAG_MUSICA"
            rclone bisync /data/musica "onedrive:/NUBE/Musica" \
                --resync \
                --cache-dir "$CACHE_DIR" \
                --config "$RCLONE_CONF" \
                --verbose \
            && touch "$FLAG_MUSICA"
        }
    fi  
    # --- FIN MUSICA ---

    # --- FOTOS ---
    FLAG_FOTOS="$CACHE_DIR/fotos_initialized.flag"
    if [ ! -f "$FLAG_FOTOS" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Fotos] Primera ejecucion - resync completo..."
        clear_bisync_locks
        rclone bisync /data/fotos "onedrive:/Imágenes" \
            --resync \
            --cache-dir "$CACHE_DIR" \
            --config "$RCLONE_CONF" \
            --verbose \
        && touch "$FLAG_FOTOS" \
        || echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Fotos] ERROR en resync inicial"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Fotos] Ejecutando bisync normal..."
        clear_bisync_locks
        rclone bisync /data/fotos "onedrive:/Imágenes" \
            --cache-dir "$CACHE_DIR" \
            --config "$RCLONE_CONF" \
            --verbose \
        || {
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Fotos] Error - ejecutando resync de recuperacion..."
            rm -f "$FLAG_FOTOS"
            rclone bisync /data/fotos "onedrive:/Imágenes" \
                --resync \
                --cache-dir "$CACHE_DIR" \
                --config "$RCLONE_CONF" \
                --verbose \
            && touch "$FLAG_FOTOS"
        }
    fi      
    # --- FIN FOTOS --


    # --- CALIBRE BIBLIOTECA ---
    FLAG_CALIBRE="$CACHE_DIR/calibre_initialized.flag"
    if [ ! -f "$FLAG_CALIBRE" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Calibre] Primera ejecucion - resync completo..."
        clear_bisync_locks
        rclone bisync /data/calibre "onedrive:/NUBE/Calibre Biblioteca" \
            --resync \
            --cache-dir "$CACHE_DIR" \
            --config "$RCLONE_CONF" \
            --verbose \
        && touch "$FLAG_CALIBRE" \
        || echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Calibre] ERROR en resync inicial"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Calibre] Ejecutando bisync normal..."
        clear_bisync_locks
        rclone bisync /data/calibre "onedrive:/NUBE/Calibre Biblioteca" \
            --cache-dir "$CACHE_DIR" \
            --config "$RCLONE_CONF" \
            --verbose \
        || {
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] [Calibre] Error - ejecutando resync de recuperacion..."
            rm -f "$FLAG_CALIBRE"
            rclone bisync /data/calibre "onedrive:/NUBE/Calibre Biblioteca" \
                --resync \
                --cache-dir "$CACHE_DIR" \
                --config "$RCLONE_CONF" \
                --verbose \
            && touch "$FLAG_CALIBRE"
        }
    fi

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ===== Sincronizacion completada ====="
}

# Sincronizacion inicial al arrancar el contenedor
run_bisync

# Bucle periodico
while true; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Proxima sincronizacion en ${INTERVAL}s..."
    sleep "$INTERVAL"
    run_bisync
done
