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
  Select,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@app/utils/supabaseClient";
import { MdOutlineModeEditOutline } from "react-icons/md";
import ConfirmationButton from "./ConfirmationButton";

const dataProp = {
  table: "trabajadores",
  tableCaptionText: "Lista de trabajadores",
  headerText: "Editar trabajador",
  tittleSuccess: "Trabajador actualizado",
  tittleError: "Error: Trabajador no actualizado",
  columns: [
    { name: "DUI", key: "dui", typeCol: "text", disabled: true },
    { name: "Telefono", key: "telefono", typeCol: "text" },
    { name: "Direccion", key: "direccion", typeCol: "text" },
  ],
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

  const [categorias, setCategorias] = useState(null);
  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        let { data: categoriascapital, error } = await supabase
          .from("categoriascapital")
          .select("id,nombre,salarioBase");
        if (error) return error;
        return categoriascapital;
      } catch (error) {
        return error;
      }
    };
    if (!categorias) {
      fetchCategoria().then((data) => {
        setCategorias(data || []);
      });
    }
  }, [categorias]);

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
    console.log(formData);
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
                return (
                  <FormControl key={col.name}>
                    <FormLabel>{col.name}</FormLabel>
                    <Input
                      name={col.key}
                      onChange={handleInputChange}
                      type={col.typeCol}
                      defaultValue={
                        prevData[col.key] != null ? prevData[col.key] : ""
                      }
                      disabled={col.disabled}
                    />
                  </FormControl>
                );
              })}
              <FormControl>
                <FormLabel>Salario</FormLabel>
                <Select
                  name="idCategoria"
                  placeholder="Seleccione una opcion"
                  onChange={handleInputChange}
                  defaultValue={
                    prevData.idCategoria != null && prevData.idCategoria
                  }
                >
                  {categorias != null &&
                    categorias.map((categoria) => {
                      return (
                        <option value={categoria.id} key={categoria.id}>
                          {categoria.nombre} - ${categoria.salarioBase}
                        </option>
                      );
                    })}
                </Select>
              </FormControl>

              <FormControl onChange={handleInputChange}>
                <FormLabel>Estado Civil</FormLabel>
                <Select
                  name="estadoCivil"
                  placeholder="Seleccione una opcion"
                  defaultValue={
                    prevData.estadoCivil != null && prevData.estadoCivil
                  }
                >
                  <option value="Soltero">Soltero</option>
                  <option value="Casado">Casado</option>
                  <option value="Divorciado">Divorciado</option>
                  <option value="Viudo">Viudo</option>
                </Select>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <ConfirmationButton
                buttonLabel="Actualizar trabajador"
                confirmationLabel="actualizar este trabajador"
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
