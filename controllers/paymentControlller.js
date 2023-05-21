const axios = require('axios');
const crypto = require('crypto');
const { URLSearchParams } = require('url');

exports.initiateCredit = async (req,res)=>{
  try {
    const token = await getToken();
    const order = await createOrder(token);
    const paymentToken = await getPaymentToken(order, token);
    const redirectUrl = `https://portal.weaccept.co/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

    console.log("\n" + redirectUrl)

    res.end(redirectUrl); //res.json

  }catch(error){
    console.log(error)
  }
}

exports.initiateWallet =  async (req, res)=> {
  try {
    const token = await getToken();
    const order = await createOrder(token);
    const paymentToken = await getPaymentToken(order.id, token);
    const payWalletData = await payWallet(paymentToken)
    console.log(payWalletData)
  } catch (error) {
    console.log(error);
  }
}

const getToken = async ()=>{

    dataBody = { "api_key":process.env.PAYMOB_API_KEY }
    
    try{

      const result = await axios.post('https://accept.paymob.com/api/auth/tokens', dataBody ,{
      headers: {
        'Content-Type': 'application/json'
      }})

      return result.data.token 

    }catch(error){
      if (error.response) { // the server returned an error status code
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
      } else if (error.request) { // request was sent but no response was received
          console.log(error.request);
      } else {
          console.log('Error', error.message);
      }
          console.log(error.config);
    }     
}

const createOrder = async (token)=>{
  console.log("IncreateOrder " + token)
  
  const data = {
    "auth_token": token,
    "delivery_needed": "false",
    "amount_cents": "100",
    "currency": "EGP",
    "items": [
      {
          "name": "ASC1515",
          "amount_cents": "500000",
          "description": "Smart Watch",
          "quantity": "1"
      },
      { 
          "name": "ERT6565",
          "amount_cents": "200000",
          "description": "Power Bank",
          "quantity": "1"
      }
      ],
    "shipping_data": {
      "apartment": "803", 
      "email": "claudette09@exa.com", 
      "floor": "42", 
      "first_name": "Clifford", 
      "street": "Ethan Land", 
      "building": "8028", 
      "phone_number": "+86(8)9135210487", 
      "postal_code": "01898", 
      "extra_description": "8 Ram , 128 Giga",
      "city": "Jaskolskiburgh", 
      "country": "CR", 
      "last_name": "Nicolas", 
      "state": "Utah"
    },
      "shipping_details": {
          "notes" : " test",
          "number_of_packages": 1,
          "weight" : 1,
          "weight_unit" : "Kilogram",
          "length" : 1,
          "width" :1,
          "height" :1,
          "contents" : "product of some sorts"
      }
  }

  try{

    const result = await axios.post('https://accept.paymob.com/api/ecommerce/orders', data ,{
    headers: {
      'Content-Type': 'application/json',
    }})
    console.log("\n" + result.data.id )
    return result.data.id

  }catch(error){
    if (error.response) { // the server returned an error status code
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) { // request was sent but no response was received
        console.log(error.request);
    } else {
        console.log('Error', error.message);
    }
        console.log(error.config);
  }
}

const getPaymentToken = async (order, token)=> {
  const data = {
    "auth_token": token,
    "amount_cents": "100", 
    "expiration": 3600, 
    "order_id": order,
    "billing_data": {
      "apartment": "803", 
      "email": "claudette09@exa.com", 
      "floor": "42", 
      "first_name": "Clifford", 
      "street": "Ethan Land", 
      "building": "8028", 
      "phone_number": "+86(8)9135210487", 
      "shipping_method": "PKG", 
      "postal_code": "01898", 
      "city": "Jaskolskiburgh", 
      "country": "CR", 
      "last_name": "Nicolas", 
      "state": "Utah"
    }, 
    "currency": "EGP", 
    "integration_id": process.env.PAYMOB_INTEGRATION_ID ,
    "lock_order_when_paid": "false"
  }

  try{

    const result = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', data ,{
    headers: {
      'Content-Type': 'application/json',
    }})

    console.log("\n" + result.data.token)
    return result.data.token

  }catch(error){
    if (error.response) { // the server returned an error status code
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) { // request was sent but no response was received
        console.log(error.request);
    } else {
        console.log('Error', error.message);
    }
        console.log(error.config);
  }
}


const payWallet = async ( getPaymentToken)=>{

  dataBody = {
    "source": {
      "identifier": "wallet mobile number", 
      "subtype": "WALLET"
    },
    "payment_token": getPaymentToken  // token obtained in step 3
  }
  
  try{

    const result = await axios.post(' https://accept.paymob.com/api/acceptance/payments/pay', dataBody ,{
    headers: {
      'Content-Type': 'application/json'
    }})

    return result

  }catch(error){
    if (error.response) { // the server returned an error status code
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) { // request was sent but no response was received
        console.log(error.request);
    } else {
        console.log('Error', error.message);
    }
        console.log(error.config);
  }     
}

// when press pay send to paymob and return with data 
exports.callback = async (request, response)=> {

  //const data = request.body;  
  const data = {"id": 106946071, "pending": false, "amount_cents": 100, "success": false, "is_auth": false, "is_capture": false, "is_standalone_payment": true, "is_voided": false, "is_refunded": false, "is_3d_secure": false, "integration_id": 3823371, "profile_id": 791483, "has_parent_transaction": false, "order": {"id": 123233438, "created_at": "2023-05-21T00:32:54.301199", "delivery_needed": false, "merchant": {"id": 791483, "created_at": "2023-05-18T13:09:45.984324", "phones": ["+201126909842"], "company_emails": ["SohilaWahed@gmail.com"], "company_name": "Sohila Wahed", "state": "", "country": "EGY", "city": "Cairo", "postal_code": "", "street": ""}, "collector": null, "amount_cents": 100, "shipping_data": {"id": 60498703, "first_name": "Clifford", "last_name": "Nicolas", "street": "Ethan Land", "building": "8028", "floor": "42", "apartment": "803", "city": "Jaskolskiburgh", "state": "Utah", "country": "CR", "email": "claudette09@exa.com", "phone_number": "+86(8)9135210487", "postal_code": "01898", "extra_description": "8 Ram , 128 Giga", "shipping_method": "UNK", "order_id": 123233438, "order": 123233438}, "currency": "EGP", "is_payment_locked": true, "is_return": false, "is_cancel": false, "is_returned": false, "is_canceled": false, "merchant_order_id": null, "wallet_notification": null, "paid_amount_cents": 0, "notify_user_with_email": false, "items": [{"name": "ASC1515", "description": "Smart Watch", "amount_cents": 500000, "quantity": 1}, {"name": "ERT6565", "description": "Power Bank", "amount_cents": 200000, "quantity": 1}], "order_url": "https://accept.paymob.com/standalone/?ref=i_LRR2OUdLenZEYjZuN1ZGNHVDbzkwenMxZz09XzAyU2lrOEI3L1lnNFpReGhLVGpncFE9PQ", "commission_fees": 0, "delivery_fees_cents": 0, "delivery_vat_cents": 0, "payment_method": "tbc", "merchant_staff_tag": null, "api_source": "OTHER", "data": {}}, "created_at": "2023-05-21T00:33:51.893414", "transaction_processed_callback_responses": [], "currency": "EGP", "source_data": {"type": "card", "pan": "2346", "sub_type": "MasterCard", "tenure": null}, "api_source": "IFRAME", "terminal_id": null, "merchant_commission": 0, "installment": null, "discount_details": [], "is_void": false, "is_refund": false, "data": {}, "is_hidden": false, "payment_key_claims": {"user_id": 1370514, "amount_cents": 100, "currency": "EGP", "integration_id": 3823371, "order_id": 123233438, "billing_data": {"first_name": "Clifford", "last_name": "Nicolas", "street": "Ethan Land", "building": "8028", "floor": "42", "apartment": "803", "city": "Jaskolskiburgh", "state": "Utah", "country": "CR", "email": "claudette09@exa.com", "phone_number": "+86(8)9135210487", "postal_code": "01898", "extra_description": "NA"}, "lock_order_when_paid": false, "extra": {}, "single_payment_attempt": false, "exp": 1684621974, "pmk_ip": "156.223.170.160"}, "error_occured": false, "is_live": false, "other_endpoint_reference": null, "refunded_amount_cents": 0, "source_id": -1, "is_captured": false, "captured_amount": 0, "merchant_staff_tag": null, "updated_at": "2023-05-21T00:33:51.966730", "is_settled": false, "bill_balanced": false, "is_bill": false, "owner": 1370514, "parent_transaction": null}

  const hmac = data.hmac;

  const sortedArray = Object.entries(data).sort();

  const sortedData = Object.fromEntries(sortedArray);

  const array = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured',
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
    'order',
    'owner',
    'pending',
    'source_data_pan',
    'source_data_sub_type',
    'source_data_type',
    'success',
  ];

  let connectedString = '';

  Object.keys(sortedData).forEach(function(key) {
    if (array.includes(key)) {
      //console.log("The Key Is " + key)
      if(key == 'order'){
         connectedString += sortedData.order.id
      }else{
        connectedString += sortedData[key];
      } 
      //console.log(connectedString)  
    }
  })

  console.log(connectedString)

  const secret = process.env.PAYMOB_HMAC;

  const hashed = crypto.createHmac('sha512', secret).update(connectedString).digest('hex');
  
  if (hashed === hmac) {
 
    response.send('secure');

    return;
  }
  response.send('not secure');
}