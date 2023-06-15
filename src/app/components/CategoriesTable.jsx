import { supabase } from "@app/utils/supabaseClient";
import { useEffect, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import EditCategorias from "./EditCategorias";
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
import ConfirmationButton from "./ConfirmationButton";

const dataProp = {
  table: "categoriascapital",
  tableCaptionText: "Lista de categorias de capital",
  thItems: ["Nombre", "Descripcion", "Salario base"],
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

const deleteCandidate = async (col, id) => {
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

export default function CategoriesTable() {
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
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {datosCargados != null &&
              datosCargados.map((dato) => {
                return (
                  <Tr key={dato.id}>
                    <Td>{dato.nombre}</Td>
                    <Td>{dato.descripcion}</Td>
                    <Td>
                      ${" "}
                      {(() => {
                        let salary = dato.salarioBase;
                        salary = salary.toFixed(2);
                        return salary;
                      })()}
                    </Td>
                    <Td>
                      <EditCategorias prevData={dato} />
                    </Td>
                    <ConfirmationButton
                      buttonLabel={<MdOutlineDelete />}
                      confirmationLabel="eliminar esta categoria"
                      onConfirm={() => {
                        let del = deleteCandidate("id", dato.id);
                        del.then((res) => {
                          if (res == null) {
                            toast({
                              title: "Categoria eliminada exitosamente",
                              status: "susccess",
                              duration: 3000,
                              isClosable: true,
                            });
                          } else {
                            toast({
                              title:
                                "Error: la categoria no pudo ser eliminada",
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
