export default async function getReport(
  groupID: string, 
  date: string,
  service: string
) {
  const headers = {
    'Authorization': `Bearer ${process.env.API_KEY}`,
  }

  // console.log(service);
  // console.log(`${process.env.AIRTABLE_URL}${groupID}?maxRecords=120&view=Grid%20view`);
  // console.log(`HEADERS: ${JSON.stringify(headers)}`);
  const group_response = await fetch(`${process.env.AIRTABLE_URL}/Grupo%20${groupID}?maxRecords=100&view=Grid%20view&sort%5B0%5D%5Bfield%5D=Fecha&sort%5B0%5D%5Bdirection%5D=desc`,{
    headers
  });

  const group = await group_response.json()
  // console.log(group);
  
  type reportType = {
    [key: string]: {}
  }
  let report:reportType ={}
  // console.log(`GRUPO${groupID}`);
  const filtered = group.records.filter((grupo: any) => grupo.fields.Fecha === date && grupo.fields.Servicio === service);
  if(filtered.length > 0){
    report = filtered[0].fields;
  }
  // console.log(Object.keys(report));

  let final_report: reportType = {}

  Object.keys(report).map((k: any) => {
    if(report[k] == "Asistió"){
      final_report[k] = report[k];
    }
  });

  Object.keys(report).map((k: any) => {
    if(report[k] != "Asistió"){
      final_report[k] = report[k];
    }
  });

  // console.log(final_report);

  return final_report;
}