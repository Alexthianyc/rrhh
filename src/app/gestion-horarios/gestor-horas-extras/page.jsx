"use client";
import AgregarHoras from "@app/components/AgregarHoras";
import HorasExtrasTable from "@app/components/HorasExtrasTable";

const dataProp = {
  columns: [
    { name: "Dui del empleado", key: "dui", typeCol: "text" },
    { name: "Fecha", key: "fecha", typeCol: "date" },
    { name: "Cantidad de horas", key: "cantidad", typeCol: "number" },
  ],
  table: "horasextras",
  headerText: "Agregar horas extras",
  tittleError: "Error al registrar las horas extras",
  tittleSuccess: "Horas extras registradas exitosamente",
};

export default function GestionHorasExtras() {
  return (
    <>
      <AgregarHoras dataProp={dataProp} />
      <HorasExtrasTable />
    </>
  );
}
