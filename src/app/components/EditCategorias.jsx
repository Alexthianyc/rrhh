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
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { supabase } from "@app/supabaseClient";
import { MdOutlineModeEditOutline } from "react-icons/md";

const dataProp = {
  table: "categoriascapital",
  tableCaptionText: "Lista de categorias de capital",
  headerText: "Editar categoria ",
  tittleSuccess: "Categoria actualizada",
  tittleError: "Error al actualizar categoria",
  columns: [
    { name: "Nombre", key: "nombre", typeCol: "text" },
    { name: "Descripcion", key: "descripcion", typeCol: "text" },
    { name: "Salario Base", key: "salarioBase", typeCol: "number" },
  ],
};

export default function EditCategorias({ prevData }) {
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef(null);
  const finalRef = useRef(null);

  const [formData, setFormData] = useState({});
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const editData = async (formData, column, id) => {
    try {
      const { data, error } = await supabase
        .from(dataProp.table)
        .update(formData)
        .eq(`${column}`, `${id}`);

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
    let res = editData(formData, "id", prevData.id);
    // console.log(formData);
    return null;
  };

  let visible = prevData.aprobacion == null;
  return (
    <>
      {visible && <MdOutlineModeEditOutline onClick={onOpen} />}

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
              {dataProp.columns.map((col) => {
                return col.key == "salarioBase" ? (
                  <FormControl key={col.name}>
                    <FormLabel>{col.name}</FormLabel>
                    <InputGroup>
                      <InputLeftElement
                        pointerEvents="none"
                        color="gray.400"
                        fontSize="1.2em"
                      >
                        $
                      </InputLeftElement>
                      <Input
                        name={col.key}
                        onChange={handleInputChange}
                        type={col.typeCol}
                        defaultValue={
                          prevData[col.key] != null && prevData[col.key]
                        }
                      />
                    </InputGroup>
                  </FormControl>
                ) : (
                  <FormControl key={col.name}>
                    <FormLabel>{col.name}</FormLabel>
                    <Input
                      name={col.key}
                      onChange={handleInputChange}
                      type={col.typeCol}
                      defaultValue={
                        prevData[col.key] != null && prevData[col.key]
                      }
                    />
                  </FormControl>
                );
              })}
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
                Actualizar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Flex>
      </Modal>
    </>
  );
}
