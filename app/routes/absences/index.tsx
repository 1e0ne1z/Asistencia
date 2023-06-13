import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import getHistoricalReport from "~/functions/getHistoricReports";
import getLeaders from "~/functions/getLeaders";


export const loader: LoaderFunction = async ({ request }) => {
  type reportesType = {
    [key: string]: any;
  }
  const url = new URL(request.url);
  
  const start_date: string = url.searchParams.get("start-date") || "";
  const end_date: string = url.searchParams.get("end-date") || "";
  const threshold: number = parseInt(url.searchParams.get("threshold") || "10");

  var reportes: reportesType = {};
  let leaders = await getLeaders();
  // let services = await getServices();
  if(start_date.length > 0 && end_date.length > 0){
    let grupos: string[] = (process.env.GRUPOS)?.split(",")!;
    for await (const grupo of grupos){
      let reporte = await getHistoricalReport(grupo, start_date, end_date, 20);
      reportes[`${grupo}`] = reporte;
    }
  }

  return await {reportes, leaders, start_date, end_date, threshold};
}

export const action: ActionFunction = async ({ request }) => {
  
}

export default function IndexAbsences() {
  
  let {reportes, leaders, start_date, end_date, threshold} = useLoaderData();
  let grupos: any = {};

  return (
    <div className="container mx-auto rounded-lg mt-10">
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
        <h1 className="text-2xl">Reporte de Inasistencias</h1>
        <br />
        <Form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" method="get" >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" >
              Fecha inicial
            </label>
            <input className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="start-date" type="date"  />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" >
              Fecha final
            </label>
            <input className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="end-date" type="date"  />
          </div>
          <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" >
              Porcentaje Mínimo(%)
            </label>
            <input className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" name="threshold" type="number" min="0" max="100" />
          </div>
          <br></br>
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
          <h1 className="text-2xl">Reporte de Inasistencias de {start_date} a {end_date}</h1>
          <h2 className="text-xl"><span className="font-bold">Ayudas:</span> {leaders['Ayuda1']}, {leaders['Ayuda2']}</h2>
          <h2 className="text-xl"><span className="font-bold">Encargados:</span> {leaders['Encargado1']}, {leaders['Encargado2']}</h2>
          <h2 className="text-xl"><span className="font-bold">Porcentaje mínimo de asistencia: </span> {threshold}%</h2>
          <br />
          {Object.keys(reportes).map((grupoID, indx) => (
            <div key={grupoID}>
              <h2 className="text-xl">Grupo {grupoID}</h2>
              <h3>Coordinador: {leaders[`${grupoID}`]}</h3>
              <table className="text-center mb-5 mt-2">
                  <thead className="border-b bg-zinc-600 text-white">
                    <tr>
                      <th className="w-20">#</th>
                      <th className="border border-gray-300 text-theme-1 font-semibold text-md my-5 w-40">Siervo</th>
                      <th className="border border-gray-300 text-theme-1 font-semibold text-md my-5 w-40">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(reportes[`${grupoID}`]).filter((m: any) => reportes[`${grupoID}`][m] <= threshold).map((k, index) => (
                          <>
                            <tr key={`${k}${index}`} id={`${k}${index}`} >
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-10">{index + 1}</td>
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-60">{k}</td>
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-40">{reportes[`${grupoID}`][k]}%</td>
                            </tr>
                          </>
                        ))}
                  </tbody>
              </table>
              <br />
            </div>
          ))}
        </div>
      }
      
    </div>

  );
}
