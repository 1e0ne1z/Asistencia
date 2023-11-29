export default async function getHistoricalReport(
  groupID: string,
  startDate: string,
  endDate: string,
  threshold: number
) {
  const headers = {
    'Authorization': `Bearer ${process.env.API_KEY}`,
  }

  const group_response = await fetch(`${process.env.AIRTABLE_URL}/Grupo%20${groupID}?maxRecords=120&view=Grid%20view&sort%5B0%5D%5Bfield%5D=Fecha&sort%5B0%5D%5Bdirection%5D=desc`,{
    headers
  });

  const services = await group_response.json()
  
  type reportType = {
    [key: string]: {}
  }
  let report:reportType ={}
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  const filtered = services.records.filter((grupo: any) => Date.parse(grupo.fields.Fecha) <= end && Date.parse(grupo.fields.Fecha) >= start);
  let membersRaw = Object.keys(services.records[services.records.length - 1].fields).filter((e: string) => !['Fecha', 'Ubicación', 'Servicio', 'Conteo Pueblo'].includes(e));
  let members: any = {}
  let members_assistance: any = {}
  membersRaw.forEach((e: string) => members[e] = 0);
  membersRaw.forEach((e: string) => members_assistance[e] = 0);

  if(filtered.length > 0){
   filtered.map((r: any) => {
    membersRaw.forEach((member: string) => r.fields[member] == "Asistió" ? members[member] += 1 : 0)
    membersRaw.forEach((member: string) => r.fields[member] == "Asistió" ? members_assistance[member] += 1 : 0)
   })
  }
  membersRaw.forEach((member: string) => members[member] = Math.round((members[member]/filtered.length)*100));
  // console.log(members);

  return [members, members_assistance, filtered.length];
}