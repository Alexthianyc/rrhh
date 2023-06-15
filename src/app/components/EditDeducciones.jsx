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
  useDisclosure,
  useToast,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { supabase } from "@app/utils/supabaseClient";
import { MdOutlineModeEditOutline } from "react-icons/md";
import ConfirmationButton from "./ConfirmationButton";

const dataProp = {
  table: "deducciones",
  tableCaptionText: "Lista de deducciones",
  headerText: "Editar deduccion ",
  tittleSuccess: "Deduccion actualizada",
  tittleError: "Error al actualizar deduccion",
  columns: [
    { name: "Nombre", key: "nombre", typeCol: "text" },
    {
      name: "Porcentaje Trabajador",
      key: "porcentajeTrabajador",
      typeCol: "number",
    },
    {
      name: "Porcentaje Empleador",
      key: "porcentajeEmpleador",
      typeCol: "number",
    },
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
    return res;
  };

  return (
    <>
      <MdOutlineModeEditOutline onClick={onOpen} />

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
                return col.typeCol == "number" ? (
                  <FormControl key={col.name}>
                    <FormLabel>{col.name}</FormLabel>
                    <InputGroup>
                      <Input
                        name={col.key}
                        onChange={handleInputChange}
                        type={col.typeCol}
                        defaultValue={
                          prevData[col.key] != null && prevData[col.key]
                        }
                      />
                      <InputRightElement
                        pointerEvents="none"
                        color="gray.400"
                        fontSize="1.2em"
                      >
                        %
                      </InputRightElement>
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
              <ConfirmationButton
                buttonLabel="Actualizar deduccion"
                confirmationLabel="actualizar esta deduccion"
                isTd={false}
                onConfirm={async () => {
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
              />
            </ModalFooter>
          </ModalContent>
        </Flex>
      </Modal>
    </>
  );
}
