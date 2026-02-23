# 🚀 Guía Completa: Despliegue en Vercel + Automatización n8n

## Parte 1: Crear Cuenta en Vercel y Desplegar el Dashboard

### Paso 1: Crear cuenta en Vercel
1. Ve a **[vercel.com](https://vercel.com)**
2. Haz clic en **"Sign Up"**
3. Elige **"Continue with GitHub"** (lo más fácil — necesitas tu repo ahí)
4. Autoriza Vercel en tu cuenta de GitHub

### Paso 2: Subir el proyecto a GitHub
Si aún no tienes el dashboard en GitHub:
```bash
cd /Users/rubenbellod/Documents/antigravity-awesome-skills/dashboard-la-agencia-del-barrio
git init
git add .
git commit -m "Dashboard LADB - La Agencia del Barrio"
git remote add origin https://github.com/TU_USUARIO/dashboard-ladb.git
git push -u origin main
```

### Paso 3: Importar en Vercel
1. En el dashboard de Vercel, clic en **"Add New → Project"**
2. Selecciona tu repositorio **"dashboard-ladb"** de GitHub
3. Vercel detectará automáticamente que es un proyecto **Next.js**
4. En **"Environment Variables"**, añade:
   - Nombre: `NEXT_PUBLIC_DATA_URL`
   - Valor: `https://TU_N8N.com/webhook/ladb-dashboard-data`
   _(Esta URL la obtendrás del Paso 5 de n8n)_
5. Clic en **"Deploy"** 🎉

### Paso 4: Tu URL pública
Vercel te dará una URL como:
```
https://dashboard-ladb.vercel.app
```
¡Esa es la URL que enviarás a tu cliente! 🏠

---

## Parte 2: Configurar n8n para Actualización en Tiempo Real

### Paso 5: Importar el flujo en n8n
1. Abre tu instancia de n8n
2. Crea un **nuevo workflow**
3. Haz clic en los 3 puntos (**⋮**) → **"Import from File"**
4. Selecciona el archivo: `n8n_dashboard_workflow.json`
5. El flujo aparecerá con 4 nodos:
   - **Webhook GET** → Recibe la petición del dashboard
   - **Google Sheets** → Lee los datos de tu hoja
   - **Procesar Datos** → Convierte los datos al formato del dashboard
   - **Responder con JSON** → Devuelve el JSON al dashboard

### Paso 6: Configurar Google Sheets
1. Haz doble clic en el nodo **"Google Sheets - Leer Todas Las Hojas"**
2. Selecciona tus **credenciales de Google** (o crea unas nuevas)
3. En **"Document"**, busca y selecciona: `Llamadas Contactos IA.`
4. En **"Sheet"**, selecciona una hoja de asesor (o selecciona la primera)
5. **IMPORTANTE**: En las opciones, activa **"Read All Sheets"** para que lea todas las pestañas

### Paso 7: Activar el flujo
1. Haz clic en el botón **"Active"** (toggle arriba a la derecha)
2. Copia la **Production URL** del nodo Webhook:
   ```
   https://TU_N8N.com/webhook/ladb-dashboard-data
   ```
3. Esa es la URL que debes poner como variable de entorno en Vercel (Paso 4)

### Paso 8: Actualizar la variable en Vercel
1. Ve a tu proyecto en **Vercel** → **Settings** → **Environment Variables**
2. Actualiza `NEXT_PUBLIC_DATA_URL` con la URL real del Webhook
3. Haz clic en **"Save"**
4. Ve a **Deployments** → clic en los 3 puntos del último deploy → **"Redeploy"**

---

## Parte 3: ¿Cómo funciona la actualización automática?

```
Tu cliente edita Google Sheets
         ↓
Dashboard se abre en Vercel
         ↓
Frontend hace fetch al Webhook de n8n
         ↓
n8n lee Google Sheets en tiempo real
         ↓
n8n devuelve datos procesados
         ↓
Dashboard muestra los datos actualizados
```

**Cada vez que alguien abre o refresca el dashboard**, los datos se leen directamente de Google Sheets. No hay caché, no hay delay. Es **tiempo real**.

El botón **"REFRESCAR"** del dashboard también permite actualizar los datos sin recargar la página.

---

## Resumen de URLs

| Recurso | URL |
|---------|-----|
| Dashboard público | `https://dashboard-ladb.vercel.app` |
| Webhook n8n (datos) | `https://TU_N8N.com/webhook/ladb-dashboard-data` |
| Google Sheets (fuente) | Tu hoja "Llamadas Contactos IA." |

---

## ¿Problemas?

- **CORS**: El flujo n8n ya incluye cabeceras `Access-Control-Allow-Origin: *`
- **Credenciales Google**: Asegúrate de que las credenciales de Google Sheets en n8n funcionan correctamente
- **Variable de entorno**: Debe llamarse exactamente `NEXT_PUBLIC_DATA_URL`
