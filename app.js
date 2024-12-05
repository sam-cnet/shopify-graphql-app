import { createGraphQLClient } from '@shopify/graphql-client';

//product name to query
let productName = '';
let consoleRows = [];
let errors = false;

//get product name from cmd line arguments
process.argv.forEach(function (val, index, array) {

    if (val == "-name") {

        try {
            if (array[index + 1].length) {

                productName = array[index + 1];
            }
        }
        catch (e) {

            console.log("No value for option -name");
            errors = true; 
        }
        
       
    }
    

});


if (!errors) {
    //graphql body 
    const productQuery = `query FetchProduct($query: String) {

    products(first:10, query: $query) {
      edges {
        node {
            id
            title
            handle
            variants (first: 100){
              edges {
                node {
                  title
                  price
                }
              }
            }
        }

      }

    }
  }`

    //execute graphql fetch 
    const client = createGraphQLClient({
        url: 'https://achievecustom.myshopify.com/admin/api/2024-10/graphql.json',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': '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',
        },
        retries: 1
    });

    const { data, errors, extensions } = await client.request(productQuery, {
        variables: {
            query: productName
        },
    });

    if (errors) {
        console.log(errors)
    }
    else {

        if (data.products.edges.length) {

            const product = data.products.edges[0].node;

            if (product.variants.edges.length) {


                let variants = product.variants.edges;


                variants.forEach(variant => {
                    let row = {
                        productTitle: product.title,
                        variantTitle: variant.node.title,
                        variantPrice: variant.node.price
                    }

                    consoleRows.push(row)
                })

            }

            let sortedByPrice = consoleRows.sort((a, b) => {
                if (a.price < b.price) {
                    return -1
                }
                else {
                    return 1
                }
            });

            sortedByPrice.forEach(row => {
                console.log(row.productTitle + " " + row.variantTitle + " " + row.variantPrice)
            })
        }
        else {
            console.log("No products Found!")
        }


    }

}
