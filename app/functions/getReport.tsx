export default async function getReport(
  groupID: string, 
  date: string,
  service: string
) {
  const headers = {
    'Authorization': `Bearer ${process.env.API_KEY}`,
  }

  console.log(service);

  // console.log(`${process.env.AIRTABLE_URL}${groupID}?maxRecords=10&view=Grid%20view`);
  // console.log(`HEADERS: ${JSON.stringify(headers)}`);
  const group_response = await fetch(`${process.env.AIRTABLE_URL}/Grupo%20${groupID}?maxRecords=120&view=Grid%20view`,{
    headers
  });

  
  const group = await group_response.json()
  
  // console.log(group);
  console.log('----------------');

  type reportType = {
    [key: string]: {}
  }
  let report:reportType ={}
  // console.log(`GRUPO${groupID}`);
  const filtered = group.records.filter((grupo: any) => grupo.fields.Fecha === date && grupo.fields.Servicio === service);
  if(filtered.length > 0){
    report = filtered[0].fields;
  }
  // console.log(report);

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