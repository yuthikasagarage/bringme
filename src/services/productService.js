import {get} from "../utils/api";
export async function getProductsInCategory(categoryId) {
  try {
    const urlPart = "products?fields=items[id,short_description,sku,price,name,weight,status,visibility,image_url,final_price,configurable_options,serving,display_position,warehouse_stock_qty,show_out_of_stock]&searchCriteria[filterGroups][0][filters][0][field]=category_id&%20searchCriteria[filterGroups][0][filters][0][value]=" + categoryId;
    let response = await get(urlPart, true);
    response.items.forEach((item)=>{
      item.categoryId = categoryId;
      if(!item.display_position){
        item.display_position = 9999;
      }
    });
    response.items = response.items.sort((item1, item2)=>{
      let displayPositionComparison = item1.display_position - item2.display_position;
      if(displayPositionComparison == 0){
        return item1.sku - item2.sku;
      }else{
        return item1.display_position - item2.display_position;
      }
    });
    return {id: categoryId, data: response.items, error: ''};
  } catch (e) {
    console.log(e.message + ' - when loading category ' + categoryId)
    return {id: categoryId, data: null, error: e.message};
  }
}

export async function getProductsBySkus(skuArray) {
  try {
    const urlPart =`products?fields=items[id,short_description,sku,price,name,weight,status,visibility,image_url,final_price,configurable_options,serving,display_position,warehouse_stock_qty,show_out_of_stock]`
    
    for (var i = skuArray.length - 1; i >= 0; i--) {
      let sku = skuArray[i];
      urlPart += `&searchCriteria[filterGroups][0][filters][${i}][field]=sku&%20searchCriteria[filterGroups][0][filters][${i}][value]=${sku}`;
    }  
      
    let response = await get(urlPart, true);
    if(!response.items){
      return {data: response.items, error: 'Some items are now unavailable'};
    }
    response.items.forEach((item)=>{
      if(!item.display_position){
        item.display_position = 9999;
      }
    });
    response.items = response.items.sort((item1, item2)=>{
      let displayPositionComparison = item1.display_position - item2.display_position;
      if(displayPositionComparison == 0){
        return item1.sku - item2.sku;
      }else{
        return item1.display_position - item2.display_position;
      }
    });
    return {data: response.items, error: ''};
  } catch (e) {
    console.log(e.message + ' - when loading products by sku')
    return {data: null, error: e.message};
  }
}

export async function searchProduct(query) {
  try {
    if (!query.cat){
        const urlPart = "products?fields=search_criteria,items[id,short_description,has_parents,sku,price,name,weight,status,visibility,image_url,final_price,serving,warehouse_stock_qty,show_out_of_stock,configurable_options[id,short_description,price,image_url,name,sku,weight,status,visibility,final_price,serving,warehouse_stock_qty,show_out_of_stock]]&searchCriteria[filterGroups][0][filters][0][field]=name&searchCriteria[filterGroups][0][filters][0][value]=%25" + encodeURIComponent(query.query) + "%25&searchCriteria[filterGroups][0][filters][0][condition_type]=like";
        let response = await get(urlPart, true);
        response.items = response.items || [];
        response.items.forEach((item)=>{
          if(!item.configurable_options){
            item.configurable_options = [];
          }
        })
        return {response, error: ''};
    }else{
        const urlPart = "products?fields=search_criteria,items[id,short_description,has_parents,sku,price,name,weight,status,visibility,image_url,final_price,serving,warehouse_stock_qty,show_out_of_stock,configurable_options[id,short_description,price,image_url,name,sku,weight,status,visibility,final_price,serving,warehouse_stock_qty,show_out_of_stock]]&searchCriteria[filterGroups][0][filters][0][field]=name&searchCriteria[filterGroups][0][filters][0][value]=%25" + encodeURIComponent(query.query) + "%25&searchCriteria[filterGroups][0][filters][0][condition_type]=like"+
       "&searchCriteria[filterGroups][0][filters][1][field]=category_id&searchCriteria[filterGroups][0][filters][1][value]=" + query.cat + "&searchCriteria[filterGroups][0][filters][1][condition_type]=eq";
        let response = await get(urlPart, true);
        response.items = response.items || [];
        response.items.forEach((item)=>{
          if(!item.configurable_options){
            item.configurable_options = [];
          }
        })
        return {response, error: ''};
    }

  } catch (e) {
    return {data: [], error: e.message};
  }
}

export function getCartTotal(items, isWishList) {
  let dataArray = items.toIndexedSeq().toArray();
  if (dataArray.length > 0) {
    let total = 0;
    for (i = 0; i < dataArray.length; i++) {
      if(!dataArray[i]){
        continue;
      }
      let item = dataArray[i].toJS();
      let {price, configurable_options, lit, final_price} = item;
      if(isWishList && !item.lit){
        continue;
      }

      if(final_price){
        price = final_price;
      }else if(price === 0) {
        if (configurable_options && configurable_options[0]) {
          price = configurable_options[0].price;
        }
      }
      total += price * item.qty;
    }
    return Math.round(total * 100) / 100;
  }
  else {
    return 0;
  }
}

export function getCartCount(items) {
  let dataArray = items.toIndexedSeq().toArray();
  if (dataArray.length > 0) {
    let total = 0;
    for (i = 0; i < dataArray.length; i++) {
      let item = dataArray[i].toJS();
      if (item.qty > 0)
        total++;
    }
    return total;
  }
  else {
    return 0;
  }
}
