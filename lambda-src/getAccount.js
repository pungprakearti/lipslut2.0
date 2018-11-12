require('dotenv').config({ path: '.env.development' })
const axios = require('axios')
const statusCode = 200
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
}
const shopifyConfig = {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token':
    process.env.GATSBY_SHOPIFY_STOREFRONT_KEY,
}
exports.handler = async function(event, context, callback) {
  // TEST for POST request
  if (event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode,
      headers,
      body: '',
    })
  }
  if (event.body[0] == '{') {
    let data = JSON.parse(event.body)
    data = JSON.parse(data.body)

    const payload1 = {
      query: `mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          userErrors {
            field
            message
          }
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
          }
        }
      }
      `,
      variables: {
        input: {
          email: data.email,
          password: data.password,
        },
      },
    }
    let token
    try {
      token = await axios({
        url: 'https://lipslut2-0.myshopify.com/api/graphql',
        method: 'POST',
        headers: shopifyConfig,
        data: JSON.stringify(payload1),
      })
      token =
        token.data.data.customerAccessTokenCreate.customerAccessToken
          .accessToken
    } catch (err) {
      console.log(err)
      let response = {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: err.message,
        }),
      }
      callback(null, response)
    }
    const payload2 = {
      query: `query customerQuery($customerAccessToken: String!){
        customer(customerAccessToken: $customerAccessToken) {
          firstName
          email
          orders{
            edges{
              node{
                orderNumber
                totalPrice
                lineItems{
                  edges{
                    node{
                      quantity
                      title
                      variant{
                        title
                        price
                        image{
                          originalSrc
                        }
                      }
                    }
                  }
                }
                
              }
            }
          }
        }
      }`,
      variables: {
        customerAccessToken: token,
      },
    }
    try {
      let customer = await axios({
        url: 'https://lipslut2-0.myshopify.com/api/graphql',
        method: 'POST',
        headers: shopifyConfig,
        data: JSON.stringify(payload2),
      })
      customer = customer.data.data.customer
      console.log(customer)
      let response = {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          customer,
        }),
      }
      callback(null, response)
    } catch (err) {
      console.log(err)
      let response = {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: err.message,
        }),
      }
      callback(null, response)
    }
  }
}