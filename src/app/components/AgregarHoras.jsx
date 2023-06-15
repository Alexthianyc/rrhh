import {
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  useDisclosure,
  useToast,
  Select,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { supabase } from "@app/utils/supabaseClient";

const opciones = [
  "Horas extras",
  "Horas extras dia de asueto",
];

export default function AgregarHoras({ dataProp }) {
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  const [formData, setFormData] = useState({});
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const insertData = async (formData) => {
    try {
      const { data, error } = await supabase
        .from(dataProp.table)
        .insert([formData]);

      if (error) {
        setFormData({});
        return error;
      }

      setFormData({});
      return data;
    } catch (error) {
      return error;
    }
  };
  const handleSubmit = () => {
    let message = insertData(formData);
    return message;
  };
  return (
    <>
      <Flex justifyContent="end" p={3}>
        <Button colorScheme="teal" onClick={onOpen}>
          Insertar
        </Button>
      </Flex>
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <Flex>
          <ModalContent>
            <ModalHeader>{dataProp.headerText}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {dataProp.columns.map((column) => {
                return (
                  <FormControl key={column.key} mt={2}>
                    <FormLabel>{column.name}</FormLabel>
                    <Input
                      name={column.key}
                      onChange={handleInputChange}
                      type={column.typeCol}
                    />
                  </FormControl>
                );
              })}
              <FormControl mt={2}>
                <FormLabel>Tipo de hora extra</FormLabel>
                <Select
                  name="tipo"
                  onChange={handleInputChange}
                  placeholder="Seleccionar tipo"
                >
                  {opciones.map((opcion) => {
                    return <option key={opcion}>{opcion}</option>;
                  })}
                </Select>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={async () => {
                  let res = await handleSubmit();
                  if (res == null) {
                    toast({
                      title: dataProp.tittleSuccess,
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                    });
                  } else {
                    toast({
                      title: dataProp.tittleError,
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                  onClose();
                }}
              >
                Registrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Flex>
      </Modal>
    </>
  );
}
