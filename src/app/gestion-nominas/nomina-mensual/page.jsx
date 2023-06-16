"use client";
import { useState } from "react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Input,
  Text,
  Button,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import NominaEmpleados from "@app/components/NominaEmpleados";
import NominaEmpresa from "@app/components/NominaEmpresa";

function obtenerNombreMes(mes) {
  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return nombresMeses[mes - 1]; // Restar 1 para obtener el índice correcto
}

function ValidarFecha(fechaString) {
  const fecha = new Date(fechaString);
  const mes = fecha.getMonth() + 1; // Los meses en JavaScript son indexados desde 0, por lo que se suma 1

  return {
    esDiciembre: mes === 12,
    nombreMes: obtenerNombreMes(mes),
  };
}

export default function NominaMensual() {
  const [loading, setLoading] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleBuscarClick = () => {
    if (!selectedDate) {
      setIsAlertOpen(true);
      return;
    }

    setLoading(true);
    setResultado(ValidarFecha(selectedDate));

    // Simulación de una llamada asincrónica
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const closeAlertDialog = () => {
    setIsAlertOpen(false);
  };

  return (
    <>
      <Flex my={3} mx={4}>
        <Text fontSize="md" w="100%" alignSelf="center">
          Seleccione una fecha
        </Text>
        <Input
          type="date"
          mx={3}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          required // Validación de campo requerido
        />
        <Button colorScheme="teal" w="sm" mx={4} onClick={handleBuscarClick}>
          Buscar
        </Button>
      </Flex>
      {loading === true && (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      )}
      {loading === false && (
        <>
          <Text
            as="b"
            fontSize="md"
            w="100%"
            my={3}
            pl={4}
          >
            Nomina del mes de {resultado?.nombreMes}
          </Text>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Empleados</Tab>
              <Tab>Empresa</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <NominaEmpleados esDiciembre={resultado.esDiciembre} fechaNomina={selectedDate} />
              </TabPanel>
              <TabPanel>
                <NominaEmpresa esDiciembre={resultado.esDiciembre} fechaNomina={selectedDate} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}

      {/* Diálogo de alerta */}
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={closeAlertDialog}
        leastDestructiveRef={undefined}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Error
            </AlertDialogHeader>
            <AlertDialogBody>
              Por favor, seleccione una fecha antes de continuar.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button colorScheme="red" onClick={closeAlertDialog}>
                Cerrar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
