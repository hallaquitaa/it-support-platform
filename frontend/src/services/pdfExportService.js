import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const pdfExportService = {
  // Exportar PDF sin contraseñas
  exportToPDF: async (credentials, includePasswords = false, masterPassword = null, revealCallback = null) => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text('Bóveda de Credenciales - IT Support Platform', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleString('es-ES');
    doc.text(`Exportado: ${dateStr}`, 14, 25);
    
    doc.setFontSize(9);
    doc.text(`Total de credenciales: ${credentials.length}`, 14, 32);
    
    const headers = ['Servicio', 'Usuario', 'URL/IP', 'Categoría', 'Estado', 'Última actualización'];
    
    const rows = credentials.map(cred => [
      cred.service_name,
      cred.username,
      cred.url || '-',
      cred.category || 'Sin categoría',
      cred.status === 'active' ? 'Activa' : 'Inactiva',
      new Date(cred.last_updated).toLocaleDateString('es-ES')
    ]);
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 45,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 45 },
        3: { cellWidth: 35 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por IT Support Platform`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`credenciales_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);
  },
  
  // Exportar PDF con contraseñas (datos ya descifrados)
  exportToPDFWithPasswords: async (credentials) => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text('Bóveda de Credenciales - IT Support Platform (CON CONTRASEÑAS)', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleString('es-ES');
    doc.text(`Exportado: ${dateStr}`, 14, 25);
    
    doc.setFontSize(9);
    doc.text(`Total de credenciales: ${credentials.length}`, 14, 32);
    doc.setTextColor(220, 38, 38);
    doc.text('⚠️ ESTE DOCUMENTO INCLUYE CONTRASEÑAS - MANTENER EN LUGAR SEGURO', 14, 39);
    
    const headers = ['Servicio', 'Usuario', 'Contraseña', 'URL/IP', 'Categoría', 'Estado', 'Última actualización'];
    
    const rows = credentials.map(cred => [
      cred.service_name,
      cred.username,
      cred.password || '••••••••',
      cred.url || '-',
      cred.category || 'Sin categoría',
      cred.status === 'active' ? 'Activa' : 'Inactiva',
      new Date(cred.last_updated).toLocaleDateString('es-ES')
    ]);
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 45,
      theme: 'striped',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25 },
        5: { cellWidth: 15 },
        6: { cellWidth: 20 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por IT Support Platform - INCLUYE CONTRASEÑAS`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`credenciales_con_passwords_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`);
  },
  
  // Exportar categoría sin contraseñas
  exportCategoryToPDF: async (credentials, categoryName, categoryColor) => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text(`Categoría: ${categoryName}`, 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Exportado: ${new Date().toLocaleString('es-ES')}`, 14, 25);
    doc.text(`Total: ${credentials.length} credenciales`, 14, 32);
    
    const headers = ['Servicio', 'Usuario', 'URL/IP', 'Estado', 'Última actualización'];
    
    const rows = credentials.map(cred => [
      cred.service_name,
      cred.username,
      cred.url || '-',
      cred.status === 'active' ? 'Activa' : 'Inactiva',
      new Date(cred.last_updated).toLocaleDateString('es-ES')
    ]);
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por IT Support Platform`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`categoria_${categoryName}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
};

export default pdfExportService;