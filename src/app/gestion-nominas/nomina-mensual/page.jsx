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
} from "@chakra-ui/react";
import NominaEmpleados from "@app/components/NominaEmpleados";
import NominaEmpresa from "@app/components/NominaEmpresa";

export default function NominaMensual() {
  const [loading, setLoading] = useState(null);

  const handleBuscarClick = () => {
    setLoading(true);

    // Aquí iría tu lógica para buscar y cargar los datos

    // Simulación de una llamada asincrónica
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <>
      <Flex my={3} mx={4}>
        <Text as="b" fontSize="md" w="100%" alignSelf="center">
          Seleccione una fecha
        </Text>
        <Input type="date" mx={3} />
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
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Empleados</Tab>
            <Tab>Empresa</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <NominaEmpleados />
            </TabPanel>
            <TabPanel>
              <NominaEmpresa />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </>
  );
}
