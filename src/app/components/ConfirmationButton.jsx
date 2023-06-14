import { useState, useRef } from "react";
import {
  Td,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

const ConfirmationButton = ({ buttonLabel, confirmationLabel, onConfirm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = useRef();

  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  return (
    <>
      <Td onClick={() => setIsOpen(true)}>
        {buttonLabel}
      </Td>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmación
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro de que deseas {confirmationLabel}?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleConfirm} ml={3}>
                Confirmar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ConfirmationButton;
