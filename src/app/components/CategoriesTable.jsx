import { supabase } from "@app/supabaseClient";
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
import { MdOutlineModeEditOutline, MdOutlineDelete } from "react-icons/md";

const dataProp = {
  table: "categoriasCapital",
  tableCaptionText: "Lista de categorias de capital",
  thItems: ["Nombre", "Descripcion", "Porcentaje del trabajador"],
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
          console.log(payload);
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
                    <Td>{dato.nombre}</Td>
                    <Td>{dato.descripcion}</Td>
                    <Td>$ {dato.salarioBase}</Td>
                    <Td
                      onClick={() => {
                        let del = deleteCandidate("id", dato.id);
                        del.then((res) => {
                          if (res == null) {
                            toast({
                              title: "Categoria eliminada exitosamente",
                              status: "error",
                              duration: 3000,
                              isClosable: true,
                            });
                          }
                        });
                      }}
                    >
                      <MdOutlineDelete />
                    </Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}