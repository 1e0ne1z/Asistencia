import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import getLeaders from "~/functions/getLeaders";
import getReport from "~/functions/getReport";


export const loader: LoaderFunction = async ({ request }) => {
  type reportesType = {
    [key: string]: any;
  }
  const url = new URL(request.url);
  
  const date: string = url.searchParams.get("date") || "";
  var reportes: reportesType = {};
  let leaders = await getLeaders();
  if(date.length > 0){
    let grupos: string[] = (process.env.GRUPOS)?.split(",")!;
    for await (const grupo of grupos){
      let reporte = await getReport(grupo, date);
      reportes[`${grupo}`] = reporte;
    }
  } 
  return await {reportes, leaders, date};
}

export const action: ActionFunction = async ({ request }) => {
  
}

export default function IndexReports() {
  
  let {reportes, leaders, date} = useLoaderData();
  
  return (
    <div className="container mx-auto rounded-lg mt-10">
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
        <h1 className="text-2xl">Reporte de Privilegios</h1>
        <br />
        <Form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" method="get" >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" >
              Fecha de reporte
            </label>
            <input className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="date" type="date"  />
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
              Generar
            </button>
            <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="/">
              Cancelar
            </a>
          </div>
        </Form>
      </div>
      {Object.keys(reportes).length > 0 && 
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h1 className="text-2xl">Detalle de reporte de fecha {date}</h1>
          <h2 className="text-xl"><span className="bold">Encargados:</span> {leaders['Encargado1']}, {leaders['Encargado2']}</h2>
          <br />
          {Object.keys(reportes).map(grupoID => (
            <div key={grupoID}>
              <h2 className="text-xl">Grupo {grupoID}</h2>
              <h3>Coordinador: {leaders[`${grupoID}`]}</h3>
              <h3>Ubicacion: {Object.keys(reportes[`${grupoID}`]).includes("Ubicación") ? reportes[`${grupoID}`]["Ubicación"] : 'NA'}</h3>
              <table className="text-center mb-5 mt-2">
                  <thead className="border-b bg-zinc-600 text-white">
                    <tr>
                      <th className="w-20">#</th>
                      <th className="border border-gray-300 text-theme-1 font-semibold text-md my-5 w-40">Siervo</th>
                      <th className="border border-gray-300 text-theme-1 font-semibold text-md my-5 w-40">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(reportes[`${grupoID}`]).map((k, index) => {
                      if(k !== 'Ubicación' && k !== 'Conteo Pueblo' && k !== 'Fecha'){
                        return (
                          <>
                            <tr key={k} className={reportes[`${grupoID}`][k] !== 'Asistió' ? `bg-red-100` : 'bg-green-100'}>
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-10">{index+1}</td>
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-60">{k}</td>
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-40">{reportes[`${grupoID}`][k]}</td>
                            </tr>
                          </>
                        )
                      }
                    })}
                  </tbody>
              </table>
            </div>
          ))}
        </div>
      }
      
    </div>

  );
}
