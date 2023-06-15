import {
  Table,
  Tbody,
  Tr,
  Td,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { supabase } from "@app/utils/supabaseClient";
import { useEffect, useState, useRef, forwardRef } from "react";
import { AiOutlineEye, AiOutlineCloseCircle } from "react-icons/ai";

const fetchData = async (dui) => {
  try {
    let { data, error } = await supabase
      .from("trabajadores")
      .select("dui,candidatos(*),categoriascapital(salarioBase,nombre)")
      .eq("dui", dui);

    if (error) {
      return { error };
    } else {
      return { data };
    }
  } catch (error) {
    return { error };
  }
};

const CustomAlertDialog = forwardRef((props, ref) => (
  <AlertDialog {...props} leastDestructiveRef={ref} />
));
CustomAlertDialog.displayName = "CustomAlertDialog";

export default function DescripcionEmpleado(dui) {
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef();

  useEffect(() => {
    const fetchDataAndSetState = async () => {
      const { data, error } = await fetchData(dui);

      if (error) {
        console.log(error);
      } else {
        setData(data[0]);
      }
    };

    if (!data.dui) {
      fetchDataAndSetState();
      //   console.log("fetching data");
    }
  }, [data, dui]);
  return (
    <Td>
      <AiOutlineEye onClick={() => setIsOpen(true)} />

      <CustomAlertDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ref={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Descripcion del empleado
            </AlertDialogHeader>

            <AlertDialogBody>
              {data.dui != null ? (
                <Table>
                  <Tbody>
                    <Tr>
                      <Td>Dui:</Td>
                      <Td>{data.dui}</Td>
                    </Tr>
                    <Tr>
                      <Td>Nombre:</Td>
                      <Td>
                        {data.candidatos.nombres} {data.candidatos.apellidos}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>Experiencia Laboral:</Td>
                      <Td>{data.candidatos.experienciaLaboral}</Td>
                    </Tr>
                    <Tr>
                      <Td>Habilidades:</Td>
                      <Td>{data.candidatos.habilidades}</Td>
                    </Tr>
                    <Tr>
                      <Td>Nombre del puesto de trabajo:</Td>
                      <Td>{data.categoriascapital.nombre}</Td>
                    </Tr>
                    <Tr>
                      <Td>Salario Base:</Td>
                      <Td>${data.categoriascapital.salarioBase}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              ) : (
                <p>Cargando datos...</p>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                colorScheme="teal"
                mr={3}
                onClick={() => {
                  // Lógica para imprimir
                  window.print();
                }}
              >
                Imprimir
              </Button>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                Cerrar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </CustomAlertDialog>
    </Td>
  );
}
