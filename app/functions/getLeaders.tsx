export default async function getLeaders() {
  const headers = {
    'Authorization': `Bearer ${process.env.API_KEY}`,
  }

  // console.log(`${process.env.AIRTABLE_URL}${groupID}?maxRecords=10&view=Grid%20view`);
  // console.log(`HEADERS: ${JSON.stringify(headers)}`);
  const group_response = await fetch(`${process.env.AIRTABLE_URL}/Grupos?maxRecords=10&view=Grid%20view`,{
    headers
  });

  const group = await group_response.json()
  
  // console.log('coordinadores');
  // console.log(group.records[0].fields);
  // console.log(report);
  const leaders = group.records[0].fields;
  return leaders;
}