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

const fetchData = async () => {
  try {
    let { data, error } = await supabase
      .from("trabajadores")
      .select(
        "dui,candidatos(nombres,apellidos),categoriascapital(salarioBase)"
      )
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

const generarPDF = async (reporte, totalPagara, totalCobrara) => {
  // const contenidoPDF = await generarContenidoPDF(data); // Llama a la función para generar el contenido del PDF
  // const blob = new Blob([contenidoPDF], { type: "application/pdf" });
  // const url = URL.createObjectURL(blob);
  // window.open(url, "_blank"); // Abre el PDF en una nueva pestaña
  console.log(reporte, totalPagara, totalCobrara);
};

export default function NominaEmpleados() {
  const [datosCargados, setDatosCargados] = useState(null);
  const [descuentosCargados, setDescuentosCargados] = useState(null);
  const [prestacionesCargadas, setPrestacionesCargadas] = useState(null);

  useEffect(() => {
    const fetchDataAndSetState = async (tableChange = null) => {
      if (tableChange == null) {
        const data = await fetchData();
        const descuentos = await fetchDescuentos();
        const prestaciones = await fetchPrestaciones();

        setDatosCargados(data || []);
        setDescuentosCargados(descuentos || []);
        setPrestacionesCargadas(prestaciones || []);
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
      }
    };

    if (!datosCargados || !descuentosCargados || !prestacionesCargadas) {
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
        }
      })
      .subscribe();

    return () => {
      suscripcion.unsubscribe();
    };
  }, [datosCargados, descuentosCargados, prestacionesCargadas]);

  let prestaciones = 0;
  let totalPagara = 0;
  let totalCobrara = 0;
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
              <Th>Salario del empleado</Th>
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
                descuentosCargados.forEach((descuento) => {
                  prestaciones +=
                    dato.categoriascapital.salarioBase *
                    (descuento.porcentajeEmpleador / 100);
                });

                const item = {
                  salarioBase: dato.categoriascapital.salarioBase,
                  prestaciones: prestaciones,
                  totalPagar: dato.categoriascapital.salarioBase + prestaciones,
                  ganancia:
                    (dato.categoriascapital.salarioBase *
                      prestacionesCargadas[0].valor) /
                    100,
                  totalCobrar:
                    dato.categoriascapital.salarioBase +
                    prestaciones +
                    (dato.categoriascapital.salarioBase *
                      prestacionesCargadas[0].valor) /
                      100,
                };

                reporte.push(item);

                return (
                  <Tr key={dato.dui}>
                    <Td>{dato.dui}</Td>
                    <DescripcionEmpleado dui={dato.dui} />
                    <Td>
                      {dato.candidatos.nombres} {dato.candidatos.apellidos}
                    </Td>
                    <Td>${item.salarioBase}</Td>
                    {Array.isArray(descuentosCargados) &&
                      descuentosCargados.map((descuento, i) => (
                        <Td key={i}>
                          $
                          {(
                            dato.categoriascapital.salarioBase *
                            (descuento.porcentajeEmpleador / 100)
                          ).toFixed(2)}
                        </Td>
                      ))}
                    <Td>$ {item.totalPagar.toFixed(2)}</Td>
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
          generarPDF(reporte, totalPagara, totalCobrara);
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
