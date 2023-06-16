import { supabase } from "@app/utils/supabaseClient";
import { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Button,
} from "@chakra-ui/react";
import DescripcionEmpleado from "./DescripcionEmpleado";
import generarContenidoPDF from "./ReportePdf";

function calcularAniosYMesesTranscurridos(fechaString, fechaNom) {
  const fecha = new Date(fechaString);
  const fechaActual = new Date(fechaNom);

  // Cálculo de los años transcurridos
  let aniosTranscurridos = fechaActual.getFullYear() - fecha.getFullYear();

  // Cálculo de los meses transcurridos
  let mesesTranscurridos = fechaActual.getMonth() - fecha.getMonth();

  // Ajuste si los meses transcurridos son negativos
  if (mesesTranscurridos < 0) {
    aniosTranscurridos--;
    mesesTranscurridos += 12;
  }

  // Ajuste si es menor a un año
  if (aniosTranscurridos < 1) {
    aniosTranscurridos = 0;
  }

  return {
    anios: aniosTranscurridos,
    meses: mesesTranscurridos,
  };
}

function calcularAguinaldo(salarioMensual, aniosAntiguedad, mesesAntiguedad) {
  const salarioDiario = salarioMensual / 30; // Suponiendo 30 días en un mes
  let diasAguinaldo;

  const mesesTotales = aniosAntiguedad * 12 + mesesAntiguedad;

  if (aniosAntiguedad < 1) {
    diasAguinaldo = (10 * mesesAntiguedad) / 12;
  } else if (aniosAntiguedad < 3) {
    diasAguinaldo = 10;
  } else if (aniosAntiguedad < 10) {
    diasAguinaldo = 15;
  } else {
    diasAguinaldo = 18;
  }

  const aguinaldoProporcional = salarioDiario * diasAguinaldo;

  return aguinaldoProporcional;
}

const fetchData = async () => {
  try {
    let { data, error } = await supabase
      .from("trabajadores")
      .select("dui,candidatos(*),categoriascapital(salarioBase)")
      .eq("activo", true);

    if (error) {
      return error;
    } else {
      return data;
    }
  } catch (error) {
    return error;
  }
};

const fetchDescuentos = async () => {
  try {
    let { data, error } = await supabase
      .from("deducciones")
      .select("id,nombre,porcentajeTrabajador,porcentajeEmpleador");

    if (error) {
      return error;
    } else {
      return data;
    }
  } catch (error) {
    return error;
  }
};

const fetchPrestaciones = async () => {
  try {
    let { data: prestaciones, error } = await supabase
      .from("prestaciones")
      .select("*")
      .eq("cod", "GDE");

    if (error) {
      return error;
    } else {
      return prestaciones;
    }
  } catch (error) {
    return error;
  }
};

const fetchRenta = async () => {
  try {
    let { data, error } = await supabase
      .from("renta")
      .select("tramo,desde,hasta,porcentaje,sobreExceso,cuotaFija");

    if (error) {
      return error;
    } else {
      return data;
    }
  } catch (error) {
    return error;
  }
};

const generarPDF = async (reporte, totalPagara, totalCobrara) => {
  // console.log(reporte, totalPagara, totalCobrara);
  const contenidoPDF = await generarContenidoPDF(
    reporte,
    totalPagara,
    totalCobrara
  ); // Llama a la función para generar el contenido del PDF
  const blob = new Blob([contenidoPDF], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank"); // Abre el PDF en una nueva pestaña
};

const calcularRenta = (salarioBase, renta, deduccionesCargadas) => {
  if (renta == null) {
    return 0;
  }
  let rentaCalculada = 0;
  let cuotaFija = 0;
  let porcentaje = 0;
  let sobreExceso = 0;
  let deducciones = deduccionesCargadas;

  renta.map((tramo) => {
    if (tramo.hasta != null) {
      if (salarioBase >= tramo.desde && salarioBase <= tramo.hasta) {
        cuotaFija = tramo.cuotaFija;
        porcentaje = tramo.porcentaje;
        sobreExceso = tramo.sobreExceso;
      }
    } else {
      if (salarioBase >= tramo.desde) {
        cuotaFija = tramo.cuotaFija;
        porcentaje = tramo.porcentaje;
        sobreExceso = tramo.sobreExceso;
      }
    }
  });

  rentaCalculada =
    (salarioBase - deducciones - sobreExceso) * (porcentaje / 100) + cuotaFija;

  //   console.log(rentaCalculada);
  return rentaCalculada;
};

export default function NominaEmpleados({ esDiciembre, fechaNomina }) {
  const [datosCargados, setDatosCargados] = useState(null);
  const [descuentosCargados, setDescuentosCargados] = useState(null);
  const [prestacionesCargadas, setPrestacionesCargadas] = useState(null);
  const [rentaCargada, setRentaCargada] = useState(null);

  useEffect(() => {
    const fetchDataAndSetState = async (tableChange = null) => {
      if (tableChange == null) {
        const data = await fetchData();
        const descuentos = await fetchDescuentos();
        const prestaciones = await fetchPrestaciones();
        const renta = await fetchRenta();

        setDatosCargados(data || []);
        setDescuentosCargados(descuentos || []);
        setPrestacionesCargadas(prestaciones || []);
        setRentaCargada(renta || []);
      } else {
        if (tableChange == "trabajadores") {
          const datos = await fetchData();
          setDatosCargados(datos || []);
        }
        if (tableChange == "deducciones") {
          const descuentos = await fetchDescuentos();
          setDescuentosCargados(descuentos || []);
        }
        if (tableChange == "prestaciones") {
          const prestaciones = await fetchPrestaciones();
          setPrestacionesCargadas(prestaciones || []);
        }
        if (tableChange == "renta") {
          const renta = await fetchRenta();
          setRentaCargada(renta || []);
        }
      }
    };

    if (
      !datosCargados ||
      !descuentosCargados ||
      !prestacionesCargadas ||
      !rentaCargada
    ) {
      fetchDataAndSetState();
    }

    const suscripcion = supabase
      .channel("custom-all-channel")
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
        const { table } = payload;
        // console.log(table);

        if (table === "trabajadores") {
          fetchDataAndSetState(table);
        } else if (table === "deducciones") {
          fetchDataAndSetState(table);
        } else if (table === "prestaciones") {
          fetchDataAndSetState(table);
        } else if (table === "renta") {
          fetchDataAndSetState(table);
        }
      })
      .subscribe();

    return () => {
      suscripcion.unsubscribe();
    };
  }, [datosCargados, descuentosCargados, prestacionesCargadas, rentaCargada]);

  let prestaciones = 0;
  let deducciones = 0;
  let totalPagara = 0;
  let totalCobrara = 0;
  let aguinaldo = 0;
  let salario = 0;
  let reporte = [];
  let item = {};
  return (
    <>
      <TableContainer>
        <Table variant="striped" colorScheme="teal">
          <TableCaption>Nomina de la empresa</TableCaption>
          <Thead>
            <Tr>
              <Th>DUI</Th>
              <Th></Th>
              <Th>Nombre completo</Th>
              <Th>Salario</Th>
              {esDiciembre && <Th>Aguinaldo</Th>}
              {descuentosCargados != null &&
                descuentosCargados.map((descuento, i) => {
                  return <Th key={i}>{descuento.nombre}</Th>;
                })}
              <Th>Total a pagar</Th>
              <Th>Ganancia</Th>
              <Th>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {datosCargados != null &&
              datosCargados.map((dato) => {
                prestaciones = 0;
                descuentosCargados.forEach((descuento) => {
                  prestaciones +=
                    dato.categoriascapital.salarioBase *
                    (descuento.porcentajeEmpleador / 100);
                  deducciones +=
                    dato.categoriascapital.salarioBase *
                    (descuento.porcentajeTrabajador / 100);
                });

                if (esDiciembre) {
                  aguinaldo = calcularAguinaldo(
                    dato.categoriascapital.salarioBase,
                    calcularAniosYMesesTranscurridos(
                      dato.candidatos.created_at,
                      fechaNomina
                    ).anios,
                    calcularAniosYMesesTranscurridos(
                      dato.candidatos.created_at,
                      fechaNomina
                    ).meses
                  );
                  salario = dato.categoriascapital.salarioBase + aguinaldo;
                } else {
                  salario = dato.categoriascapital.salarioBase;
                }

                item = {
                  salarioBase: salario,
                  salario: dato.categoriascapital.salarioBase,
                  aguinaldo: aguinaldo,
                  prestaciones: prestaciones,
                  descuentosEmpleados: descuentosCargados.map((descuento) => {
                    return {
                      tipo: descuento.nombre,
                      monto: salario * (descuento.porcentajeTrabajador / 100),
                    };
                  }),
                  prestacionesDetalle: descuentosCargados.map((descuento) => {
                    return {
                      tipo: descuento.nombre,
                      monto: salario * (descuento.porcentajeEmpleador / 100),
                    };
                  }),
                  renta: calcularRenta(salario, rentaCargada, deducciones),
                  totalPagar: salario + prestaciones,
                  ganancia: (salario * prestacionesCargadas[0].valor) / 100,
                  totalCobrar:
                    salario +
                    prestaciones +
                    (salario * prestacionesCargadas[0].valor) / 100,
                };

                reporte.push(item);

                return (
                  <Tr key={dato.dui}>
                    <Td>{dato.dui}</Td>
                    <DescripcionEmpleado dui={dato.dui} />
                    <Td>
                      {dato.candidatos.nombres} {dato.candidatos.apellidos}
                    </Td>
                    <Td>${item.salario.toFixed(2)}</Td>
                    {esDiciembre && <Td>${item.aguinaldo.toFixed(2)}</Td>}
                    {Array.isArray(descuentosCargados) &&
                      descuentosCargados.map((descuento, i) => (
                        <Td key={i}>
                          $
                          {(
                            salario *
                            (descuento.porcentajeEmpleador / 100)
                          ).toFixed(2)}
                        </Td>
                      ))}
                    <Td>${item.totalPagar.toFixed(2)}</Td>
                    <Td>${item.ganancia.toFixed(2)}</Td>
                    <Td>${item.totalCobrar.toFixed(2)}</Td>
                  </Tr>
                );
              })}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              {esDiciembre && <Th></Th>}
              {descuentosCargados != null &&
                descuentosCargados.map((descuento, i) => {
                  return <Th key={i}></Th>;
                })}
              <Th>Total a pagar</Th>
              {reporte != null &&
                reporte.forEach((item) => {
                  totalPagara += item.totalPagar;
                  totalCobrara += item.totalCobrar;
                })}
              <Th>${totalPagara.toFixed(2)}</Th>
              <Th>Total a cobrar</Th>
              <Th>${totalCobrara.toFixed(2)}</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
      {/* <Text>Ganancia = {(totalCobrara - totalPagara).toFixed(2)}</Text> */}
      <Button
        onClick={() => {
          generarPDF(reporte);
        }}
        colorScheme="teal"
        size="sm"
        mt={2}
      >
        Generar informe
      </Button>
    </>
  );
}
