import { supabase } from "@app/utils/supabaseClient";
import { useEffect, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import ConfirmationButton from "./ConfirmationButton";
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
  table: "horasextras",
  tableCaptionText: "Lista de horas extra",
  thItems: ["Dui", "Fecha", "Cantidad de horas", "Tipo de horas extra"],
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

const deleteHora = async (col, id) => {
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

export default function HorasExtrasTable() {
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
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {datosCargados != null &&
              datosCargados.map((dato) => {
                return (
                  <Tr key={dato.id}>
                    <Td>{dato.dui}</Td>
                    <Td>{dato.fecha}</Td>
                    <Td>
                      {dato.cantidad} {dato.cantidad > 1 ? "horas" : "hora"}
                    </Td>
                    <Td>{dato.tipo}</Td>
                    <ConfirmationButton
                      buttonLabel={<MdOutlineDelete />}
                      confirmationLabel="eliminar esta hora extra"
                      onConfirm={() => {
                        let del = deleteHora("id", dato.id);
                        del.then((res) => {
                          if (res == null) {
                            toast({
                              title: "Hora extra eliminada exitosamente",
                              status: "susccess",
                              duration: 3000,
                              isClosable: true,
                            });
                          } else {
                            toast({
                              title: "Error: No se pudo eliminar la hora extra",
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
