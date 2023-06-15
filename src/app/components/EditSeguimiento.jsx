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

const dataProp = {
  table: "seguimiento",
  tableCaptionText: "Lista de seguimiento de candidatos",
  headerText: "Editar seguimiento",
  tittleSuccess: "Seguimiento actualizado",
  tittleError: "Error al actualizar seguimiento",
};

export default function EditSeguimiento({ prevData }) {
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
              <FormControl mt={2}>
                <FormLabel>Candidato</FormLabel>
                <Input
                  name="candidatoId"
                  onChange={handleInputChange}
                  type="text"
                  bg="gray.200"
                  defaultValue={
                    prevData.candidatos.nombres +
                    " " +
                    prevData.candidatos.apellidos
                  }
                  isReadOnly
                />
              </FormControl>
              <FormControl mt={2}>
                <FormLabel>Puesto</FormLabel>
                <Input
                  name="puestoId"
                  onChange={handleInputChange}
                  type="text"
                  bg="gray.200"
                  defaultValue={prevData.puestostrabajo.nombrePuesto}
                  isReadOnly
                />
              </FormControl>
              <FormControl mt={2}>
                <FormLabel>Etapa</FormLabel>
                <Select
                  name="etapa"
                  onChange={handleInputChange}
                  defaultValue={prevData.etapa}
                  disabled={prevData.aprobacion != null ? true : false}
                >
                  <option value="En espera">En espera</option>
                  <option value="Entrevista">Entrevista</option>
                  <option value="Prueba tecnica">Prueba tecnica</option>
                  <option value="Prueba de conocimiento">
                    Prueba de conocimiento
                  </option>
                  <option value="Prueba de aptitud">Prueba de aptitud</option>
                  <option value="Proceso de seleccion">
                    Poceso de seleccion
                  </option>
                </Select>
              </FormControl>
              <FormControl mt={2}>
                <FormLabel>Aprobado</FormLabel>
                <Select
                  name="aprobacion"
                  onChange={handleInputChange}
                  defaultValue={
                    prevData.aprobacion != null ? prevData.aprobacion : null
                  }
                  disabled={prevData.aprobacion != null ? true : false}
                >
                  <option value={null}>No definido</option>
                  <option value={true}>Aprobado</option>
                  <option value={false}>Rechazado</option>
                </Select>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <ConfirmationButton
                buttonLabel="Actualizar seguimiento"
                confirmationLabel="actualizar este seguimiento"
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
