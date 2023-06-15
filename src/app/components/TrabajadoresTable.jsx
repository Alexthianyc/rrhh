import { supabase } from "@app/utils/supabaseClient";
import { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  useToast,
  Box
} from "@chakra-ui/react";
import EditTrabajadores from "./EditTrabajadores";
import { HiMinusCircle, HiCheckCircle } from "react-icons/hi2";
import ConfirmationButton from "./ConfirmationButton";
import DescripcionEmpleado from "./DescripcionEmpleado";

const dataProp = {
  table: "trabajadores",
  tableCaptionText: "Lista de trabajadores",
  thItems: [
    "dui",
    "nombre completo",
    "Salario",
    "telefono",
    "direccion",
    "estadoCivil",
  ],
};

const fetchData = async () => {
  try {
    let { data, error } = await supabase
      .from(dataProp.table)
      .select("*,categoriascapital(salarioBase),candidatos(nombres,apellidos)");

    if (error) {
      return error;
    } else {
      return data;
    }
  } catch (error) {
    return error;
  }
};

const changeEstado = async (col, id, estado) => {
  try {
    const { data, error } = await supabase
      .from(dataProp.table)
      .update({ activo: estado })
      .eq(col, id);

    if (error) {
      return error;
    } else {
      return data;
    }
  } catch (error) {
    return error;
  }
};

export default function TrabajadoresTable() {
  const [datosCargados, setDatosCargados] = useState(null);

  useEffect(() => {
    const fetchDataAndSetState = async () => {
      const data = await fetchData();
      // console.log(data);
      setDatosCargados(data || []);
    };

    if (!datosCargados) {
      fetchDataAndSetState();
    }

    const suscripcion = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: dataProp.table },
        (payload) => {
          // console.log(payload);
          fetchDataAndSetState();
        }
      )
      .subscribe();

    return () => {
      suscripcion.unsubscribe();
    };
  }, [datosCargados]);

  const toast = useToast();
  // console.log("Renderizado");
  return (
    <>
      <TableContainer mt={4}>
        <Table>
          <TableCaption>{dataProp.tableCaptionText}</TableCaption>
          <Thead>
            <Tr>
              {dataProp.thItems.map((thItem) => {
                return <Th key={thItem}>{thItem}</Th>;
              })}
              <Th></Th>
              <Th></Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {datosCargados != null &&
              datosCargados.map((dato) => {
                return (
                  <Tr
                    key={dato.dui}
                    bg={
                      dato.activo == false
                        ? "red.200"
                        : dato.telefono == null ||
                          dato.direccion == null ||
                          dato.estadoCivil == null
                        ? "orange.200"
                        : ""
                    }
                  >
                    <Td>{dato.dui}</Td>
                    <DescripcionEmpleado dui={dato.dui} />
                    <Td>
                      {dato.candidatos.nombres +
                        " " +
                        dato.candidatos.apellidos}
                    </Td>
                    <Td>
                      ${" "}
                      {(() => {
                        let salary = dato.categoriascapital.salarioBase;
                        salary = salary.toFixed(2);
                        return salary;
                      })()}
                    </Td>
                    {dato.telefono != null ? (
                      <Td>{dato.telefono}</Td>
                    ) : (
                      <Td>No definido</Td>
                    )}
                    {dato.direccion != null ? (
                      <Td>
                        <Box
                          w={300}
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="wrap"
                        >
                          {dato.direccion}
                        </Box>
                      </Td>
                    ) : (
                      <Td>No definido</Td>
                    )}
                    {dato.estadoCivil != null ? (
                      <Td>{dato.estadoCivil}</Td>
                    ) : (
                      <Td>No definido</Td>
                    )}
                    <Td>
                      <EditTrabajadores prevData={dato} />
                    </Td>
                    <ConfirmationButton
                    buttonLabel={dato.activo ? <HiMinusCircle /> : <HiCheckCircle />}
                    confirmationLabel= {dato.activo ? "desactivar el empleado" : "activar el empleado"}
                    onConfirm={() => {
                      let res = changeEstado("dui", dato.dui, !dato.activo);
                      if (res == null) {
                        toast({
                          title: "Error",
                          description: "No se pudo actualizar el estado",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                      }else{
                        toast({
                          title: "Actualizado",
                          description: dato.activo ? "Trabajador desactivado" : "Trabajador activado",
                          status: "success",
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                  />
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}
