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
  Box,
} from "@chakra-ui/react";
import { MdOutlineDelete } from "react-icons/md";
import Editar from "./EditPuestos";
import ConfirmationButton from "./ConfirmationButton";

const dataProp = {
  table: "puestostrabajo",
  tableCaptionText: "Lista de puestos de trabajo",
  thItems: ["Nombre del puesto", "Descripcion", "Requisitos", "Estado"],
};

const fetchData = async () => {
  try {
    let { data, error } = await supabase.from(dataProp.table).select("*");

    if (error) {
      console.error(error);
      return error;
    } else {
      return data;
    }
  } catch (error) {
    return error;
  }
};

const deletePuesto = async (col, id) => {
  try {
    const { data, error } = await supabase
      .from(dataProp.table)
      .delete()
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

export default function PuestosTable({ editProp }) {
  const [datosCargados, setDatosCargados] = useState(null);

  useEffect(() => {
    const fetchDataAndSetState = async () => {
      const data = await fetchData();
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
          fetchDataAndSetState();
        }
      )
      .subscribe();

    return () => {
      suscripcion.unsubscribe();
    };
  }, [datosCargados]);

  const toast = useToast();

  return (
    <>
      <TableContainer>
        <Table>
          <TableCaption>{dataProp.tableCaptionText}</TableCaption>
          <Thead>
            <Tr>
              {dataProp.thItems.map((thItem) => {
                return <Th key={thItem}>{thItem}</Th>;
              })}
              <Th></Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {datosCargados != null &&
              datosCargados.map((dato) => {
                return (
                  <Tr
                    key={dato.id}
                    bg={dato.estadoPuesto ? "green.200" : "red.200"}
                  >
                    <Td>{dato.nombrePuesto}</Td>
                    <Td>
                      <Box
                        w={300}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="wrap"
                      >
                        {dato.descripcionPuesto}
                      </Box>
                    </Td>
                    <Td>
                      <Box
                        w={400}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="wrap"
                      >
                        {dato.requisitos}
                      </Box>
                    </Td>
                    <Td>{dato.estadoPuesto ? "Activo" : "Inactivo"}</Td>
                    <Td>
                      <Editar dataProp={editProp} prevData={dato} />
                    </Td>
                    <ConfirmationButton
                      buttonLabel={<MdOutlineDelete />}
                      confirmationLabel="eliminar este puesto"
                      onConfirm={() => {
                        let del = deletePuesto("id", dato.id);
                        del.then((res) => {
                          if (res == null) {
                            toast({
                              title: "Puesto eliminado exitosamente",
                              status: "success",
                              duration: 3000,
                              isClosable: true,
                            });
                          } else {
                            toast({
                              title: "Error: No se pudo eliminar el puesto",
                              status: "error",
                              duration: 3000,
                              isClosable: true,
                            });
                          }
                        });
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
