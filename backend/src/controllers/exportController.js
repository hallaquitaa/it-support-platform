import ExcelJS from 'exceljs';
import { openDb } from '../config/database.js';
import { VaultCredential } from '../models/VaultCredential.js';

export const exportCredentialsToExcel = async (req, res) => {
  try {
    const includePasswords = req.query.includePasswords === 'true';
    const masterPassword = req.body.masterPassword;
    
    const db = await openDb();
    
    // Obtener credenciales del usuario
    let credentials = await db.all(`
      SELECT v.*, u.username as created_by_name
      FROM vault_credentials v
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.created_by = ?
      ORDER BY v.service_name ASC
    `, [req.user.id]);

    // Si se incluyen contraseñas y se proporcionó Master Password, descifrar
    if (includePasswords && masterPassword) {
      for (const cred of credentials) {
        try {
          const revealed = await VaultCredential.revealPassword(cred.id, masterPassword);
          cred.decrypted_password = revealed.password;
        } catch (error) {
          cred.decrypted_password = '*** ERROR: MASTER PASSWORD INCORRECTA ***';
        }
      }
    }

    // Crear Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Credenciales');

    // Estilos para encabezados
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Servicio', key: 'service_name', width: 30 },
      { header: 'Usuario', key: 'username', width: 25 },
      { header: 'Contraseña', key: 'password', width: 30 },
      { header: 'URL/IP', key: 'url', width: 35 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Notas', key: 'notes', width: 40 },
      { header: 'Última Actualización', key: 'last_updated', width: 20 },
      { header: 'Creado por', key: 'created_by_name', width: 20 }
    ];

    // Aplicar estilo a encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });

    // Agregar datos
    for (const cred of credentials) {
      worksheet.addRow({
        id: cred.id,
        service_name: cred.service_name,
        username: cred.username,
        password: includePasswords ? (cred.decrypted_password || '*** NO DISPONIBLE ***') : '********',
        url: cred.url || '',
        category: cred.category || '',
        status: cred.status === 'active' ? 'Activa' : 'Inactiva',
        notes: cred.notes || '',
        last_updated: new Date(cred.last_updated).toLocaleString(),
        created_by_name: cred.created_by_name || ''
      });
    }

    // Ajustar altura de filas
    worksheet.eachRow((row) => {
      row.height = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    
    const filename = `credenciales_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting credentials:', error);
    res.status(500).json({ error: error.message });
  }
};