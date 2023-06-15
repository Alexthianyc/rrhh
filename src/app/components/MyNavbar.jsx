import Link from "next/link";
import { useRef } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Avatar,
  Button,
  Flex,
  Box,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { supabase } from "@app/utils/supabaseClient";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { IoLogOutSharp } from "react-icons/io5";

const menu = [
  {
    Titulo: "Gestión Reclutamiento de Capital Humano",
    items: [
      {
        Nombre: "Descriptor de los puestos de Trabajo",
        path: "/gestion-reclutamiento/descriptor-puestos",
      },
      {
        Nombre: "Reclutamiento de Capital Humano",
        path: "/gestion-reclutamiento/reclutamiento",
      },
      {
        Nombre: "Seguimiento de candidatos",
        path: "/gestion-reclutamiento/seguimiento-candidatos",
      },
      {
        Nombre: "Expediente de los Trabajadores",
        path: "/gestion-reclutamiento/expediente-trabajadores",
      },
      //  ,
      // {
      //   Nombre: "Reporte o Informe de categoría o módulo",
      //   path: "/gestion-reclutamiento",
      // },
    ],
  },
  {
    Titulo: "Gestión de nóminas y retribuciones Económicas",
    items: [
      {
        Nombre: "Categorias de Capital Humano",
        path: "/gestion-nominas/definicion-salario",
      },
      {
        Nombre: "Deducciones",
        path: "/gestion-nominas/deducciones",
      },
      {
        Nombre: "Prestaciones",
        path: "/gestion-nominas/prestaciones",
      },
      {
        Nombre: "Nómina de Salario Mensuales",
        path: "/gestion-nominas/nomina-mensual",
      },
      // ,
      // {
      //   Nombre: "Reporte o Informe de categoría o módulo",
      //   path: "/gestion-nominas",
      // },
    ],
  },
  {
    Titulo: "Módulo de Gestión del tiempo y horarios",
    items: [
      {
        Nombre: "Gestor de ausencias y vacaciones",
        path: "/gestion-horarios/gestor-ausencias",
      },
      {
        Nombre: "Gestor de horas extras",
        path: "/gestion-horarios/gestor-horas-extras",
      },
      // ,
      // {
      //   Nombre: "Reporte o Informe de categoría o módulo",
      //   path: "/gestion-horarios",
      // },
    ],
  },
  {
    Titulo: "Evaluación del Personal ",
    items: [
      { Nombre: "Evaluar", path: "/evaluacion-personal" },
      // ,
      // {
      //   Nombre: "Reporte o Informe de categoría o módulo",
      //   path: "/evaluacion-personal",
      // },
    ],
  },
];

export default function MyNavbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();

  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={2}
        bg="gray.900"
        color="white"
      >
        <IconButton
          ref={btnRef}
          aria-label="Open Menu"
          bg="gray.900"
          color="white"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          onClick={isOpen ? onClose : onOpen}
        />

        <Menu>
          <MenuButton
            as={Button}
            rounded={"full"}
            variant={"link"}
            cursor={"pointer"}
            minW={0}
            bg="gray.900"
            colorScheme="teal"
          >
            <Avatar size={"sm"} name={"A D"} />
          </MenuButton>
          <MenuList bg="gray.900" color="white">
            <MenuItem
              p={1.5}
              bg="gray.900"
              color="white"
              icon={<IoLogOutSharp />}
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                console.log(error);
              }}
            >
              Cerrar Sesión
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
        size={"sm"}
      >
        <DrawerOverlay>
          <DrawerContent bg="gray.700" color="white">
            <DrawerHeader></DrawerHeader>
            <DrawerCloseButton />
            <DrawerBody>
              <Accordion mt={2}>
                {menu.map((menuItem) => (
                  <AccordionItem key={menuItem.Titulo}>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left">
                          {menuItem.Titulo}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Flex flexDirection="column">
                        {menuItem.items.map((item) => (
                          <Link
                            key={item.Nombre}
                            href={item.path}
                            onClick={onClose}
                          >
                            {item.Nombre}
                          </Link>
                        ))}
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
}
