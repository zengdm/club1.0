import {Promise} from "../plugins/es6-promise";
const xapi={
   Promise 
}
const wxapi=wx;
const apinames=[
    'request'
]
apinames.forEach(fnname=>{
    xapi[fnname]=(obj={})=>{
        return new Promise((resolve, reject)=>{
            obj.success = function (res) {
                resolve(res)
            }
            obj.fail = function (err) {
                reject(err)
            }
            wxapi[fnname](obj)
        })
    }
})


xapi.xx = function (page){
  console.log('brand调用---------------------------------->xapi');
}

export default xapi;
