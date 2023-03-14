export default async function getServices() {
  const headers = {
    'Authorization': `Bearer ${process.env.API_KEY}`,
  }

  // console.log(`${process.env.AIRTABLE_URL}${groupID}?maxRecords=10&view=Grid%20view`);
  // console.log(`HEADERS: ${JSON.stringify(headers)}`);
  const services_response = await fetch(`${process.env.AIRTABLE_URL}/Servicios?maxRecords=100&view=Grid%20view`,{
    headers
  });

  const services = await services_response.json()
  let services_list = Object.keys(services.records[0].fields);
  // console.log(Object.keys(services.records[0].fields));
  console.log(services_list);
  // console.log(services_list);
  return services_list;
}