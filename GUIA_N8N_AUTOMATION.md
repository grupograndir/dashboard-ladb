# Guía de Automatización: n8n + Google Sheets + Dashboard

Esta guía explica cómo conectar tu hoja de Google Sheets "**LLAMADAS ASESORESq (1)**" directamente con el dashboard para que se actualice solo.

## 1. El Flujo en n8n
Debes crear un workflow en n8n con esta estructura:

1.  **Webhook Trigger:** (Método GET, Path: `dashboard-data`) -> Será la URL que use el dashboard.
2.  **Google Sheets Node:** (Operación: Read, Document: `LLAMADAS ASESORESq (1)`) -> Debe leer todas las pestañas de los asesores.
3.  **Code Node (JavaScript):** Aquí pegaremos la lógica de procesamiento (ver abajo).
4.  **Webhook Response:** Para devolver el JSON al dashboard.

## 2. Código para el Nodo "Code"
Copia y pega este código en el nodo **Code** de n8n para procesar los datos exactamente como lo hacemos en local:

```javascript
const items = $input.all();
const result = {
    summary: { totalCalls: 0, contacted: 0, notContacted: 0 },
    advisors: []
};

// Función para anonimizar (igual que en el dashboard)
function anonimize(text) {
    if (!text) return 'Sin datos';
    if (typeof text !== 'string') return text;
    if (/^\d{3}/.test(text.replace(/\s/g, ''))) return text.substring(0, 3) + ' *** ***';
    return 'Cliente ' + text.charAt(0).toUpperCase();
}

// Agrupar por asesor (pestaña)
const advisorsMap = {};

items.forEach(item => {
    const row = item.json;
    const sheetName = row['__SHEET_NAME__'] || 'General'; // n8n suele dar el nombre de la hoja
    
    if (!advisorsMap[sheetName]) {
        advisorsMap[sheetName] = { name: sheetName, calls: [] };
    }

    const contactedRaw = (row['Contactado'] || row['No'] || row['Nº'] || '').toString().toLowerCase();
    const isContacted = contactedRaw.includes('si') || contactedRaw === 'sí';

    result.summary.totalCalls++;
    if (isContacted) result.summary.contacted++;
    else result.summary.notContacted++;

    advisorsMap[sheetName].calls.push({
        id: `${sheetName}-${advisorsMap[sheetName].calls.length}`,
        customer: anonimize(row['Nombre']),
        phone: anonimize(row['Teléfono']),
        date: row['Fecha'] || row['Fecha alta'],
        contacted: isContacted,
        obs: row['Observaciones'] || row['__EMPTY'] || row['Observacion'] || '',
        ref: row['Referencia'] || row['Inmueble'] || 'N/A'
    });
});

result.advisors = Object.values(advisorsMap);
return [{ json: result }];
```

## 3. Conectando el Dashboard
Una vez tengas el Webhook en n8n (ej. `https://tu-n8n.com/webhook/dashboard-data`), actualizaremos el código del dashboard para que haga un `fetch` a esa URL.

## 4. Entrega al Cliente
- **Hosting del Frontend:** Recomiendo **Vercel**. Es gratis para un proyecto así y se conecta a tu GitHub.
- **Seguridad:** El Webhook de n8n puede protegerse con una API Key básica que configuraremos en el código.

---
**¿Quieres que modifique ahora el código del Dashboard para que soporte esta conexión por Webhook?**
