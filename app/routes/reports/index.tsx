import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import getLeaders from "~/functions/getLeaders";
import getReport from "~/functions/getReport";
import getServices from "~/functions/getServices";


export const loader: LoaderFunction = async ({ request }) => {
  type reportesType = {
    [key: string]: any;
  }
  const url = new URL(request.url);
  
  const date: string = url.searchParams.get("date") || "";
  const service: string = url.searchParams.get("servicio") || "";
  var reportes: reportesType = {};
  let leaders = await getLeaders();
  let services = await getServices();
  if(date.length > 0){
    let grupos: string[] = (process.env.GRUPOS)?.split(",")!;
    for await (const grupo of grupos){
      let reporte = await getReport(grupo, date, service);
      reportes[`${grupo}`] = reporte;
    }
  } 
  return await {reportes, leaders, date, services};
}

export const action: ActionFunction = async ({ request }) => {
  
}

export default function IndexReports() {
  
  let {reportes, leaders, date, services} = useLoaderData();
  let totalSiervos=0;
  let asistencia=0;
  let tempTotal=0;
  let asistenciaPueblo: number = 0;
  let tempAsistencia=0;
  let grupos: any = {};

  let [service, setService] = useState('');

  const handleChange = (e: any) => {
    // console.log(e.target.value);
    setService(e.target.value);
  }

  if(Object.keys(reportes).length > 0){
    Object.keys(reportes).map(gk => {
      tempAsistencia = 0;
      totalSiervos = totalSiervos + Object.keys(reportes[`${gk}`]).filter(k => (k !== 'Ubicación' && k !== 'Conteo Pueblo' && k !== 'Fecha' && k !== 'Servicio')).length;
      Object.keys(reportes[`${gk}`]).filter(k => (k !== 'Ubicación' && k !== 'Conteo Pueblo' && k !== 'Fecha' && k !== 'Servicio')).map(sk => {
        if(reportes[`${gk}`][sk] === 'Asistió'){
          asistencia = asistencia + 1;
          tempAsistencia = tempAsistencia + 1;
        }
      });
      tempTotal = Object.keys(reportes[`${gk}`]).filter(k => (k !== 'Ubicación' && k !== 'Conteo Pueblo' && k !== 'Fecha' && k !== 'Servicio')).length;
      if(reportes[`${gk}`]['Conteo Pueblo'] !== undefined) {
        asistenciaPueblo = asistenciaPueblo + parseInt(reportes[`${gk}`]['Conteo Pueblo']);
      }
      grupos[gk] = {
        siervos: tempTotal,
        asistencia: tempAsistencia,
        porcentaje: Math.floor((tempAsistencia/tempTotal)*100)
      };
    });
    
    let coordinadores=Object.keys(reportes).length;
    totalSiervos = totalSiervos + coordinadores;
    asistencia = asistencia + coordinadores;
  }
  
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
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" >
              Servicio
            </label>
            <select onChange={handleChange} name="servicio" value={service}>
              {services.map((s: any, index: number) =>
              <option key={index} value={s}>
                {s}
              </option>
              )}
            </select>
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
          <h1 className="text-2xl">Reporte de privilegio de fecha {date}</h1>
          <h2 className="text-xl"><span className="font-bold">Ayudas:</span> {leaders['Ayuda1']}, {leaders['Ayuda2']}</h2>
          <h2 className="text-xl"><span className="font-bold">Encargados:</span> {leaders['Encargado1']}, {leaders['Encargado2']}</h2>
          <h2 className="text-xl"><span className="font-bold">Asistencia de pueblo: </span> {asistenciaPueblo}</h2>
          <h2 className="text-xl"><span className="font-bold">Total de siervos: </span> {totalSiervos}</h2>
          <h2 className="text-xl"><span className="font-bold">Siervos que asistieron: </span> {asistencia} ({Math.floor((asistencia/totalSiervos)*100)}%)</h2>
          <br />
          {Object.keys(reportes).map((grupoID, indx) => (
            <div key={grupoID}>
              <h2 className="text-xl">Grupo {grupoID}</h2>
              <h3>Coordinador: {leaders[`${grupoID}`]}</h3>
              <h3>Ubicacion: {Object.keys(reportes[`${grupoID}`]).includes("Ubicación") ? reportes[`${grupoID}`]["Ubicación"] : 'NA'}</h3>
              <h3>Pueblo: {Object.keys(reportes[`${grupoID}`]).includes("Conteo Pueblo") ? reportes[`${grupoID}`]["Conteo Pueblo"] : '0'}</h3>
              <h3>Asistencia: {grupos[`${grupoID}`].asistencia} ({grupos[`${grupoID}`].porcentaje}%)</h3>
              <table key={grupoID} className="text-center mb-5 mt-2">
                  <thead className="border-b bg-zinc-600 text-white">
                    <tr>
                      <th className="w-20">#</th>
                      <th className="border border-gray-300 text-theme-1 font-semibold text-md my-5 w-40">Siervo</th>
                      <th className="border border-gray-300 text-theme-1 font-semibold text-md my-5 w-40">Telefono</th>
                      <th className="border border-gray-300 text-theme-1 font-semibold text-md my-5 w-40">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(reportes[`${grupoID}`]).filter(k => (k !== 'Ubicación' && k !== 'Conteo Pueblo' && k !== 'Fecha' && k !== 'Servicio')).map((k, index) => (
                          <>
                            <tr key={`${grupoID}-${index}`} id={`${grupoID}-${index}`} className={reportes[`${grupoID}`][k] !== 'Asistió' ? `bg-red-100 text-red-800` : 'bg-green-100 text-green-800'}>
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-10">{index + 1}</td>
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-60">{k.split(",")[0]}</td>
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-60">{k.split(",")[1]}</td>
                              <td className="border border-gray-300 py-2 my-4 mx-6 w-40">{reportes[`${grupoID}`][k]}</td>
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
