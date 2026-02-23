const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../../Llamadas Contactos IA..xlsx');
const OUTPUT_PATH = path.join(__dirname, '../src/lib/calls-data.json');

function excelDateToJSDate(serial) {
    if (!serial || isNaN(serial)) return null;
    // Handle if it's already a string date
    if (typeof serial === 'string') {
        const d = new Date(serial);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
        return null;
    }
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0];
}

// Hojas a excluir del procesamiento
const EXCLUDED_SHEETS = ['Plantilla'];

try {
    const workbook = xlsx.readFile(EXCEL_PATH);
    const result = {
        summary: {
            totalCalls: 0,
            contacted: 0,
            notContacted: 0
        },
        advisors: []
    };

    workbook.SheetNames
        .filter(name => !EXCLUDED_SHEETS.includes(name))
        .forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet);

            const advisorData = {
                name: sheetName,
                calls: data.map((row, idx) => {
                    // Normalización de campos según el Excel real
                    const contactedRaw = (row['Contactado'] || row['No'] || row['Nº'] || '').toString().toLowerCase();
                    const isContacted = contactedRaw.includes('si') || contactedRaw === 'sí';

                    result.summary.totalCalls++;
                    if (isContacted) result.summary.contacted++;
                    else result.summary.notContacted++;

                    // Nombre y teléfono SIN anonimizar (datos reales)
                    const customerName = row['Nombre'] || row['Cliente'] || 'Sin datos';
                    const customerPhone = row['Teléfono'] || row['Movil'] || row['Telefono'] || 'Sin datos';

                    return {
                        id: `${sheetName}-${idx}`,
                        customer: String(customerName),
                        phone: String(customerPhone),
                        date: excelDateToJSDate(row['Fecha'] || row['Fecha alta']),
                        dateContact: excelDateToJSDate(row['Fecha contacto']),
                        contacted: isContacted,
                        obs: row['Observaciones'] || row['__EMPTY'] || row['Observacion'] || '',
                        ref: row['Referencia'] || row['Inmueble'] || row['Anuncios'] || 'N/A'
                    };
                }).filter(c => c.date !== null) // Eliminar filas vacías o sin fecha
            };
            if (advisorData.calls.length > 0) {
                result.advisors.push(advisorData);
            }
        });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
    console.log('✅ Datos procesados con éxito.');
    console.log(`   📊 Registros totales: ${result.summary.totalCalls}`);
    console.log(`   👤 Asesores: ${result.advisors.map(a => a.name).join(', ')}`);
    console.log(`   ✅ Contactados: ${result.summary.contacted}`);
    console.log(`   ⏳ Pendientes: ${result.summary.notContacted}`);
} catch (error) {
    console.error('❌ Error al procesar el Excel:', error);
}
