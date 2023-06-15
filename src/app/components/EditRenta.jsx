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
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { useState, useRef } from "react";
import { supabase } from "@app/utils/supabaseClient";
import { MdOutlineModeEditOutline } from "react-icons/md";
import ConfirmationButton from "./ConfirmationButton";

const dataProp = {
  table: "renta",
  headerText: "Editar Tramo de Renta",
  tittleSuccess: "Trajo de renta actualizado",
  tittleError: "Error al actualizar tramo de renta",
  columns: [
    { name: "Desde", key: "desde", typeCol: "number" },
    { name: "Hasta", key: "hasta", typeCol: "number" },
    { name: "Porcentaje", key: "porcentaje", typeCol: "number" },
    { name: "Sobre ecceso", key: "sobreExceso", typeCol: "number" },
    { name: "Cuota fija", key: "cuotaFija", typeCol: "number" },
  ],
};

export default function EditRenta({ prevData }) {
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
    let res = editData(formData, "tramo", prevData.tramo);
    // console.log(formData);
    return res;
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
                return col.key == "porcentaje" ? (
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
                );
              })}
            </ModalBody>

            <ModalFooter>
              <ConfirmationButton
                buttonLabel="Actualizar traamo"
                confirmationLabel="actualizar este tramo de renta"
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
