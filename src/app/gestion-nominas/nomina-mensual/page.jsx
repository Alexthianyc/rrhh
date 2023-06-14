"use client";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import NominaEmpleados from "@app/components/NominaEmpleados";
import NominaEmpresa from "@app/components/NominaEmpresa";
// import { PrestacionesCalc } from "@app/utils/PrestacionesCalc";

export default function NominaMensual() {
  // console.log(PrestacionesCalc(365));
  return (
    <>
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
    </>
  );
}
