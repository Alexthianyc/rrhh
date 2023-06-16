import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Tfoot,
  Button,
} from "@chakra-ui/react";
import { supabase } from "@app/utils/supabaseClient";
import { useEffect, useState } from "react";
import DescripcionEmpleado from "./DescripcionEmpleado";
import NominasPdf from "./NominasPdf";

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
      .select("dui,candidatos(*),categoriascapital(salarioBase,nombre)")
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

const generarPDF = async (data) => {
  const contenidoPDF = await NominasPdf(data); // Llama a la función para generar el contenido del PDF
  const blob = new Blob([contenidoPDF], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank"); // Abre el PDF en una nueva pestaña
};

export default function NominaEmpleados({ esDiciembre, fechaNomina }) {
  const [datosCargados, setDatosCargados] = useState(null);
  const [descuentosCargados, setDescuentosCargados] = useState(null);
  const [rentaCargada, setRentaCargada] = useState(null);

  useEffect(() => {
    const fetchDataAndSetState = async (tableChange = null) => {
      if (tableChange == null) {
        const data = await fetchData();
        const descuentos = await fetchDescuentos();
        const renta = await fetchRenta();

        setDatosCargados(data || []);
        setDescuentosCargados(descuentos || []);
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
        if (tableChange == "renta") {
          const renta = await fetchRenta();
          setRentaCargada(renta || []);
        }
      }
    };

    if (!datosCargados || !descuentosCargados || !rentaCargada) {
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
        } else if (table === "renta") {
          fetchDataAndSetState(table);
        }
      })
      .subscribe();

    return () => {
      suscripcion.unsubscribe();
    };
  }, [datosCargados, descuentosCargados, rentaCargada]);

  let deducciones = 0;
  let nominas = [];
  let item = {};
  let aguinaldo = 0;
  let salario = 0;

  // console.log(datosCargados);
  return (
    <>
      <TableContainer>
        <Table variant="striped" colorScheme="teal">
          <TableCaption>Nomina de empleados</TableCaption>
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
              <Th>Renta</Th>
              <Th>Salario liquido</Th>
            </Tr>
          </Thead>
          <Tbody>
            {datosCargados != null &&
              datosCargados.map((dato) => {
                descuentosCargados.map((descuento) => {
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
                  dui: dato.dui,
                  puesto: dato.categoriascapital.nombre,
                  nombre:
                    dato.candidatos.nombres + " " + dato.candidatos.apellidos,
                  salarioBase: salario,
                  descuentos: descuentosCargados.map((descuento) => {
                    return {
                      tipo: descuento.nombre,
                      monto: salario * (descuento.porcentajeTrabajador / 100),
                    };
                  }),
                  renta: calcularRenta(salario, rentaCargada, deducciones),
                  salarioLiquido:
                    salario -
                    deducciones -
                    calcularRenta(salario, rentaCargada, deducciones),
                };
                nominas.push(item);

                return (
                  <Tr key={item.dui}>
                    <Td>{item.dui}</Td>
                    <DescripcionEmpleado dui={item.dui} />
                    <Td>{item.nombre}</Td>
                    <Td>${dato.categoriascapital.salarioBase.toFixed(2)}</Td>
                    {esDiciembre && <Td>${aguinaldo.toFixed(2)}</Td>}
                    {descuentosCargados != null &&
                      descuentosCargados.map((descuento, i) => {
                        return (
                          <Td key={i}>
                            $
                            {(
                              salario *
                              (descuento.porcentajeTrabajador / 100)
                            ).toFixed(2)}
                          </Td>
                        );
                      })}
                    <Td>${item.renta.toFixed(2)}</Td>
                    <Td>$ {item.salarioLiquido.toFixed(2)}</Td>
                  </Tr>
                );
              })}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th></Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
      {/* {console.log(nominas)} */}
      <Button
        colorScheme="teal"
        size="sm"
        my={2}
        onClick={() => {
          // Lógica para imprimir
          window.print();
        }}
      >
        Imprimir
      </Button>
    </>
  );
}
