#!/bin/bash
# ═══════════════════════════════════════════════════════════
# AhorroMetrics - Script de instalación automática en VPS
# Instala PostgreSQL, crea la BD, migra datos y despliega
# ═══════════════════════════════════════════════════════════

set -e

# ─── Colores ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

print_header() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${BLUE}  $1${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""
}

print_step() {
  echo -e "${GREEN}[✓]${NC} $1"
}

print_warn() {
  echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
  echo -e "${RED}[✗]${NC} $1"
}

# ─── Configuración ───
DB_NAME="ahorrometrics"
DB_USER="ahorrometrics"
DB_PASS="AhorroMetrics2026!"
SMTP_USER="ahorrometrics@gmail.com"
SMTP_PASS="gzxe lcph yicg bplx"
SMTP_FROM="contacto@ahorrometrics.es"
BASE_URL="https://ahorrometrics.es"

# Detectar la ruta del proyecto (donde está el script)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

print_header "AhorroMetrics - Instalación Automática"
echo -e "  Directorio del proyecto: ${BOLD}${PROJECT_DIR}${NC}"
echo ""

# ─── PASO 1: Instalar PostgreSQL ───
print_header "PASO 1/7: Instalando PostgreSQL"

if command -v psql &> /dev/null; then
  print_warn "PostgreSQL ya está instalado"
  psql --version
else
  echo "Instalando PostgreSQL..."
  sudo apt update -qq
  sudo apt install -y postgresql postgresql-contrib
  print_step "PostgreSQL instalado correctamente"
fi

# Asegurar que está corriendo
sudo systemctl start postgresql
sudo systemctl enable postgresql
print_step "PostgreSQL está corriendo"

# ─── PASO 2: Crear base de datos y usuario ───
print_header "PASO 2/7: Configurando base de datos"

# Verificar si el usuario ya existe
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  print_warn "Usuario '${DB_USER}' ya existe"
else
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  print_step "Usuario '${DB_USER}' creado"
fi

# Verificar si la base de datos ya existe
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  print_warn "Base de datos '${DB_NAME}' ya existe"
else
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
  print_step "Base de datos '${DB_NAME}' creada"
fi

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
print_step "Permisos configurados"

# ─── PASO 3: Configurar archivos de entorno ───
print_header "PASO 3/7: Configurando variables de entorno"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public"

cd "$PROJECT_DIR"

# Crear .env (para Prisma CLI)
cat > .env << EOF
DATABASE_URL="${DATABASE_URL}"
EOF
print_step "Archivo .env creado"

# Crear .env.local (para Next.js) - solo si no existe
if [ -f .env.local ]; then
  # Verificar si DATABASE_URL ya está
  if grep -q "DATABASE_URL" .env.local; then
    print_warn ".env.local ya tiene DATABASE_URL configurado"
  else
    echo "" >> .env.local
    echo "# ─── PostgreSQL Database ───" >> .env.local
    echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env.local
    print_step "DATABASE_URL añadido a .env.local existente"
  fi
else
  cat > .env.local << EOF
# ─── SMTP Configuration ───
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_FROM}

# URL base del sitio
NEXT_PUBLIC_BASE_URL=${BASE_URL}

# ─── PostgreSQL Database ───
DATABASE_URL="${DATABASE_URL}"
EOF
  print_step "Archivo .env.local creado"
fi

# ─── PASO 4: Instalar dependencias ───
print_header "PASO 4/7: Instalando dependencias"

npm install --production=false
print_step "Dependencias instaladas"

# ─── PASO 5: Crear las tablas ───
print_header "PASO 5/7: Creando tablas en PostgreSQL"

# Generar el cliente de Prisma
npx prisma generate
print_step "Cliente Prisma generado"

# Aplicar el esquema a la base de datos
npx prisma db push --accept-data-loss
print_step "Tablas creadas en PostgreSQL"

# ─── PASO 6: Migrar datos de Baserow ───
print_header "PASO 6/7: Migrando datos de Baserow"

echo "Descargando datos de Baserow y insertándolos en PostgreSQL..."
node scripts/migrate-from-baserow.mjs

print_step "Datos migrados correctamente"

# ─── PASO 7: Build y reinicio ───
print_header "PASO 7/7: Compilando y reiniciando"

npm run build
print_step "Build completado"

# Intentar reiniciar con PM2 si está disponible
if command -v pm2 &> /dev/null; then
  pm2 restart all 2>/dev/null || pm2 start npm --name "ahorrometrics" -- start
  print_step "Aplicación reiniciada con PM2"
else
  print_warn "PM2 no detectado. Inicia la aplicación manualmente con:"
  echo "  npm start"
  echo "  # o instala PM2: npm install -g pm2 && pm2 start npm --name ahorrometrics -- start"
fi

# ─── Resumen ───
print_header "Instalación completada"
echo -e "  ${GREEN}Base de datos:${NC}  ${DB_NAME}"
echo -e "  ${GREEN}Usuario:${NC}        ${DB_USER}"
echo -e "  ${GREEN}Puerto:${NC}         5432"
echo -e "  ${GREEN}Proyecto:${NC}       ${PROJECT_DIR}"
echo ""
echo -e "  ${BOLD}Panel de admin:${NC} ${BASE_URL}/panel-am-2026"
echo ""
echo -e "  ${YELLOW}Para ver los logs:${NC} pm2 logs ahorrometrics"
echo ""
