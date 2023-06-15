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
import NominasPdf from "./NominasPdf";

const fetchData = async () => {
  try {
    let { data, error } = await supabase
      .from("trabajadores")
      .select(
        "dui,candidatos(nombres,apellidos),categoriascapital(salarioBase,nombre)"
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

export default function NominaEmpleados() {
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
  return (
    <>
      <TableContainer>
        <Table variant="striped" colorScheme="teal">
          <TableCaption>Nomina de empleados</TableCaption>
          <Thead>
            <Tr>
              <Th>DUI</Th>
              <Th>Nombre completo</Th>
              <Th>Salario base</Th>
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

                item = {
                  dui: dato.dui,
                  puesto: dato.categoriascapital.nombre,
                  nombre:
                    dato.candidatos.nombres + " " + dato.candidatos.apellidos,
                  salarioBase: dato.categoriascapital.salarioBase,
                  descuentos: descuentosCargados.map((descuento) => {
                    return {
                      tipo: descuento.nombre,
                      monto:
                        dato.categoriascapital.salarioBase *
                        (descuento.porcentajeTrabajador / 100),
                    };
                  }),
                  renta: calcularRenta(
                    dato.categoriascapital.salarioBase,
                    rentaCargada,
                    deducciones
                  ),
                  salarioLiquido:
                    dato.categoriascapital.salarioBase -
                    deducciones -
                    calcularRenta(
                      dato.categoriascapital.salarioBase,
                      rentaCargada,
                      deducciones
                    ),
                };
                nominas.push(item);

                return (
                  <Tr key={item.dui}>
                    <Td>{item.dui}</Td>
                    <Td>{item.nombre}</Td>
                    <Td>${item.salarioBase}</Td>
                    {descuentosCargados != null &&
                      descuentosCargados.map((descuento, i) => {
                        return (
                          <Td key={i}>
                            $
                            {(
                              dato.categoriascapital.salarioBase *
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
        onClick={() => generarPDF(nominas)}
      >
        Generar boletas de pago
      </Button>
    </>
  );
}
