import { RequestManager, Client, HTTPTransport } from "@open-rpc/client-js";

const transport = new HTTPTransport("http://localhost:3330");
const requestManager = new RequestManager([transport]);
const client = new Client(requestManager);

const main = async () => {
  const result = await client.request({method: "addition", params: [2, 2]});
  console.log(result);
};

main().then(() => {
  console.log("DONE");
});
