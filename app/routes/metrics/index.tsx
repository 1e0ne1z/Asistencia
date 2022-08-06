import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { VictoryPie } from "victory";
import getLeaders from "~/functions/getLeaders";
import getReport from "~/functions/getReport";


export const loader: LoaderFunction = async ({ request }) => {
  type reportesType = {
    [key: string]: any;
  }
  const url = new URL(request.url);
  
  const date: string = url.searchParams.get("date") || "";
  const service: string = url.searchParams.get("service") || "";
  var reportes: reportesType = {};
  let leaders = await getLeaders();
  if(date.length > 0){
    let grupos: string[] = (process.env.GRUPOS)?.split(",")!;
    for await (const grupo of grupos){
      let reporte = await getReport(grupo, date, service);
      reportes[`${grupo}`] = reporte;
    }
  } 
  return await {reportes, leaders, date};
}

export const action: ActionFunction = async ({ request }) => {
  
}

export default function IndexMetrics() {
  type pie_type = {
    x: string,
    y: number
  }
  let {reportes, leaders, date} = useLoaderData();
  let totalSiervos=0;
  let asistencia=0;
  let faltas: any = {};
  let faltas_pie: pie_type[] = []
  if(Object.keys(reportes).length > 0){
    Object.keys(reportes).map(gk => {
      totalSiervos = totalSiervos + Object.keys(reportes[`${gk}`]).filter(k => (k !== 'Ubicación' && k !== 'Conteo Pueblo' && k !== 'Fecha')).length;
      Object.keys(reportes[`${gk}`]).filter(k => (k !== 'Ubicación' && k !== 'Conteo Pueblo' && k !== 'Fecha')).map(sk => {
        if(reportes[`${gk}`][sk] === 'Asistió'){
          asistencia = asistencia + 1;
        }
        if(reportes[`${gk}`][sk] !== 'Asistió'){
          if((reportes[`${gk}`][sk] in faltas)){
            faltas[reportes[`${gk}`][sk]] += 1;
          } else {
            faltas[reportes[`${gk}`][sk]] = 1;
          }
        }
      })
    });

    Object.keys(faltas).map((fk, index) => {
      faltas_pie.push({ x: `${ index + 1 }`, y: faltas[fk] })
    });
    console.log(faltas)
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
          <div className="md:flex md:justify-center">
            <div className="border border-gray-300 rounded lg:w-1/2 m-5 sm:w-auto">
                <p className="border border-gray-300 text-center m-10"> 1: Asistencia ({asistencia}), 2: Ausencia ({totalSiervos-asistencia})</p>
              
              <VictoryPie
                colorScale={["tomato", "navy" ]}
                data={[
                  { x: "1", y: asistencia },
                  { x: "2", y: (totalSiervos-asistencia) },
                ]}
              />
              <br />
            </div>

            <div className="border border-gray-300 rounded lg:w-1/2">
                <p className="border border-gray-300 text-center m-10">{Object.keys(faltas).map((fk, index) => <><span>{index + 1}. {fk}</span>, </>)}</p>
              
              <VictoryPie
                
                data={faltas_pie}
              />
              <br />
            </div>
          </div>
        </div>
      }
      
    </div>

  );
}
