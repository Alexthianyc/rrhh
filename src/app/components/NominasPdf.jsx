import { PDFDocument, rgb } from "pdf-lib";

export default async function NominasPdf(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  const { width, height } = page.getSize();
  const fontSize = 12;
  const margin = 50;

  const drawText = (text, x, y, options = {}) => {
    const defaultOptions = {
      size: fontSize,
      color: rgb(0, 0, 0),
    };

    const { size, color } = { ...defaultOptions, ...options };

    page.drawText(text, {
      x,
      y,
      size,
      color,
    });
  };

  data.forEach((boleta, index) => {
    const posY = height - margin - (index + 1) * (fontSize * 7);

    // Título de la boleta
    drawText("Boleta de Pago", margin, posY, { size: fontSize + 2 });

    // Separador
    const separadorY = posY - fontSize * 2;
    drawText("----------------------------------------------------------", margin, separadorY);

    // Nombre y puesto del empleado
    drawText(`Nombre: ${boleta.nombre}`, margin, separadorY - fontSize * 3);
    drawText(`Puesto: ${boleta.puesto}`, margin, separadorY - fontSize * 4);

    // Salario
    drawText(`Salario: $${boleta.salarioBase.toFixed(2)}`, margin, separadorY - fontSize * 6);

    // Deducciones
    let deduccionesPosY = separadorY - fontSize * 8;
    drawText("Deducciones:", margin, deduccionesPosY);
    boleta.descuentos.forEach((descuento, i) => {
      drawText(`${i + 1}. ${descuento.tipo}: $${descuento.monto.toFixed(2)}`, margin, deduccionesPosY - fontSize * (i + 1));
    });

    // Salario liquido
    const salarioLiquidoPosY = deduccionesPosY - fontSize * (boleta.descuentos.length + 3);
    drawText(`Salario liquido: $${boleta.salarioLiquido.toFixed(2)}`, margin, salarioLiquidoPosY);

    // Firma del empleado
    const firmaPosY = salarioLiquidoPosY - fontSize * 4;
    drawText("----------------------------------------------------------", margin, firmaPosY);
    drawText("Firma", margin, firmaPosY - fontSize);

    // Separador
    drawText("----------------------------------------------------------", margin, firmaPosY - fontSize * 3);
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
