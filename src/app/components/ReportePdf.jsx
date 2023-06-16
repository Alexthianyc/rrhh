import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default async function ReportePdf(reporte) {
  // console.log(reporte, totalPagara, totalCobrara);

  let totalDescuentosAFP = 0;
  let totalDescuentosISSS = 0;
  let totalPrestacionesAFP = 0;
  let totalPrestacionesISSS = 0;
  let totalSalario = 0;
  let totalAguinaldo = 0;
  let totalTotalPagar = 0;
  let totalGanancia = 0;
  let totalTotalCobrar = 0;
  let totalRenta = 0;

  reporte.forEach((item) => {
    // Sumar los montos de descuentos y prestaciones según el tipo
    item.descuentosEmpleados.forEach((descuento) => {
      if (descuento.tipo === "AFP") {
        totalDescuentosAFP += descuento.monto;
      } else if (descuento.tipo === "ISSS") {
        totalDescuentosISSS += descuento.monto;
      }
    });

    item.prestacionesDetalle.forEach((prestacion) => {
      if (prestacion.tipo === "AFP") {
        totalPrestacionesAFP += prestacion.monto;
      } else if (prestacion.tipo === "ISSS") {
        totalPrestacionesISSS += prestacion.monto;
      }
    });

    // Sumar los montos del resto de las variables
    totalSalario += item.salario;
    totalAguinaldo += item.aguinaldo;
    totalTotalPagar += item.totalPagar;
    totalGanancia += item.ganancia;
    totalTotalCobrar += item.totalCobrar;
    totalRenta += item.renta;
  });

  // console.log("Total Descuentos AFP:", totalDescuentosAFP);
  // console.log("Total Descuentos ISSS:", totalDescuentosISSS);
  // console.log("Total Prestaciones AFP:", totalPrestacionesAFP);
  // console.log("Total Prestaciones ISSS:", totalPrestacionesISSS);
  // console.log("Total Salario:", totalSalario);
  // console.log("Total Aguinaldo:", totalAguinaldo);
  // console.log("Total Total a Pagar:", totalTotalPagar);
  // console.log("Total Ganancia:", totalGanancia);
  // console.log("Total Total a Cobrar:", totalTotalCobrar);
  // console.log("Total Renta:", totalRenta);

  // Utilizar los valores sumados en la generación del reporte PDF
  async function generarReportePDF() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    // ... código para generar el contenido del PDF

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  generarReportePDF();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);

  // Generar el contenido del PDF utilizando las variables
  const content = `
    Informe de Nómina
    Pago total en Salarios: $${totalSalario.toFixed(2)}

    Descuentos en los salarios de los trabajadores:
    Total Descuentos AFP: $${totalDescuentosAFP.toFixed(2)}
    Total Descuentos ISSS: $${totalDescuentosISSS.toFixed(2)}
    Total Descuentos por Renta: $${totalRenta.toFixed(2)}

    Pago por prestaciones:
    Total Prestaciones AFP: $${totalPrestacionesAFP.toFixed(2)}
    Total Prestaciones ISSS: $${totalPrestacionesISSS.toFixed(2)}
    Total Aguinaldo: $${totalAguinaldo.toFixed(2)}

    
    Resumen del reporte:
    Pago total a realizar a AFP: $${(
      totalDescuentosAFP + totalPrestacionesAFP
    ).toFixed(2)}
    Pago total a realizar a ISSS: $${(
      totalDescuentosISSS + totalPrestacionesISSS
    ).toFixed(2)}
    Pago total a realizar al ministerio de hacienda: $${totalRenta.toFixed(2)}
    Pago total a trabajadores con los descuentos: $${(
      totalSalario -
      totalDescuentosAFP -
      totalDescuentosISSS -
      totalRenta
    ).toFixed(2)}
    Total Total a Pagar: $${totalTotalPagar.toFixed(2)}
    Total Total a Cobrar: $${totalTotalCobrar.toFixed(2)}
    Total Ganancia: $${totalGanancia.toFixed(2)}
  `;

  page.drawText(content, {
    x: 30,
    y: 800,
    lineHeight: 20,
    size: 10,
    font: await pdfDoc.embedFont(StandardFonts.Helvetica),
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
