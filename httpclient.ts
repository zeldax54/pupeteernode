import axios from "axios";
import process from "process";
import https from 'https'

export class HttpClient{

    constructor(){
        if (process.env.NODE_ENV === 'development') {
            const httpsAgent = new https.Agent({
              rejectUnauthorized: false,
            })
            axios.defaults.httpsAgent = httpsAgent
            // eslint-disable-next-line no-console
            console.log(process.env.NODE_ENV, `RejectUnauthorized is disabled.`)
        }
    }

  async addUpdateNumber(number:string,container:string,token:string,userId:string){
  
    const url = `${process.env.SCRAPPERURL}Whatsapp/addNumber`;
    const headers = {
        "Authorization": token,
        "x-nameidentifier":userId
      };
    const request = {
        number:number,
        container:container
    };

    axios
    .post(url!, request!,{ headers: headers })
    .then((response) => {     
      console.log(response.data);
    })
    .catch((error) => {      
      console.error(error);
    });   
  }
}