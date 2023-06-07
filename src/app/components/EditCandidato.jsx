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
import { supabase } from "@app/supabaseClient";
import { MdOutlineModeEditOutline } from "react-icons/md";

export default function EditCandidatos({ dataProp, prevData }) {
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
    let res = editData(formData, "dui", prevData.dui);
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
                      isReadOnly={column.key == "dui" ? true : false}
                      bg={column.key == "dui" ? "gray.200" : "white"}
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
