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
import { MdOutlineModeEditOutline } from "react-icons/md";

export default function EditarPuestos({ dataProp, prevData }) {
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
              {dataProp.columns.map((column) => {
                return (
                  <FormControl key={column.key} mt={2}>
                    <FormLabel>{column.name}</FormLabel>
                    <Input
                      name={column.key}
                      onChange={handleInputChange}
                      type={column.typeCol}
                      defaultValue={prevData[column.key]}
                    />
                  </FormControl>
                );
              })}
              <FormControl mt={2}>
                <FormLabel>Estado</FormLabel>
                <Select
                  name="estadoPuesto"
                  onChange={handleInputChange}
                  defaultValue={prevData.estadoPuesto}
                >
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </Select>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <ConfirmationButton
                buttonLabel="Actualizar puesto"
                confirmationLabel="actualizar este puesto"
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
