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
} from "@chakra-ui/react";

const dataProp = {
  table: "ausencias",
  tableCaptionText: "Lista de ausecias",
  thItems: ["Dui", "Fecha", "Tipo de ausencia"],
};

const fetchData = async () => {
  try {
    let { data, error } = await supabase.from(dataProp.table).select("*");

    if (error) {
      return error;
    } else {
      return data;
    }
  } catch (error) {
    return error;
  }
};

const deleteAusencia = async (col, id) => {
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

export default function AusenciasTable() {
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
      <TableContainer>
        <Table variant="striped" colorScheme="teal">
          <TableCaption>{dataProp.tableCaptionText}</TableCaption>
          <Thead>
            <Tr>
              {dataProp.thItems.map((thItem) => {
                return <Th key={thItem}>{thItem}</Th>;
              })}
            </Tr>
          </Thead>
          <Tbody>
            {datosCargados != null &&
              datosCargados.map((dato) => {
                return (
                  <Tr key={dato.id}>
                    <Td>{dato.dui}</Td>
                    <Td>{dato.fecha}</Td>
                    <Td>{dato.tipo}</Td>
                    <ConfirmationButton
                      buttonLabel={<MdOutlineDelete />}
                      confirmationLabel="eliminar esta ausencia"
                      onConfirm={() => {
                        let del = deleteAusencia("id", dato.id);
                        del.then((res) => {
                          if (res == null) {
                            toast({
                              title: "Ausencia eliminada exitosamente",
                              status: "success",
                              duration: 3000,
                              isClosable: true,
                            });
                          } else {
                            toast({
                              title: "Error al eliminar la ausencia",
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
