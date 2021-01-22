import {post} from "../utils/api";
import {setAuthenticationToken} from "../utils/authentication";

export async function registerMobile(num) {
  const body = {
    "customer": {
      "firstname": "first"
    },
    "mobileNumber": num
  };
  try {
    let response = await post("customers/mobileRegister", body, true);
    return {otp_code: response.otp_code, error: ''};
  } catch (e) {
    return {otp_code: 0, error: e.message};
  }
}

export async function loginUser(num) {
  const body = {
    "username": num + "-customer@intellogic.lk",
    "password": num + ""
  };
  console.log(body.username + ' ' + body.password);
  try {
    let response = await post("integration/customer/token", body, true);
    if (typeof  response === 'string'){
      setAuthenticationToken(response);
      return {token: response, error: ''};
    }else{
      return {token: '', error: ''};
    }
  } catch (e) {
    return {token: '', error: e.message};
  }
}

export function validateEmail(candidateEmail){
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegEx.test(candidateEmail)
}
