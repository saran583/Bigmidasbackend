import Orders from "../../models/orders/orders.model";
import bulkMessage from "../../models/messages/notification.model";
const axios = require("axios");
import customernotification from "../../models/messages/customernotification";
import Vendornotifications from "../../models/messages/Vendormessages.model";


function sendnotificationonbooking(vendid,msg) {
  console.log("notification",vendid);
  bulkMessage.find({ uid: vendid}, function (err, docs) {
    if (err){
        console.log(err);
    }
    else{
      console.log(docs);
      try{  
      console.log("Second function call : ", docs[0].firebase_token);
        axios({
              method: 'post',
              headers:{
                "Content-Type":"application/json",
                "Authorization":"key=AAAAZAr6u2A:APA91bFv992Wos4HwN0-dyQlMPSHDOJ7BnAeFRfsFLS8FjDs8gwy7Om-cx6ZG9dgG1sI09cqo4ATQlG5lhXXdInxkZLB6zp1dtJeSCv8aNT1BZoBn6CHQQ--Qsh8i4zLXOIAlEwlfyMU",
                // "Authorization":"key=AAAAxIkn9nY:APA91bHo0OdhbBNNCy8_GN7DsUwGpGFNiu2B0hzIVWKa5G2UJxiJQRiG7FX0VR8JBDYT0ydbmBYWhWx9JuGjPURvcQlzItXhVf-coJ5F3mwLXKq8sWOFRTnvI1Xm3xE_GxD97tFiEXX4",
              },
              url: 'https://fcm.googleapis.com/fcm/send',
              data: {
                      "to" : docs[0].firebase_token,
                      "notification" : {
                          "body" : msg,
                          "title": "Big Midas"
                      },
                    }
            }).then(response =>{
              addmessages(vendid,msg);
              console.log(response);
            });  
    }
    catch(err){
      console.log(err);
    }
  }
});
  
}

function addmessages(vendid,msg){

  const notification = new Vendornotifications({
    vendorid: vendid,
    message: msg,
  });
  Vendornotifications.create(notification)
  .then((res) => { console.log(res)})
  .catch((err) =>{ console.log(err)});
}


function sendnotificationtocustomer(requid,msg){
  console.log("requid",requid);
  console.log(msg);
  customernotification.find({ uid: requid}, function (err, docs) {
    if (err){
        console.log(err);
    }
    else{
      try{  
      console.log("Second function call : ", docs[0].firebase_token);
        axios({
              method: 'post',
              headers:{
                "Content-Type":"application/json",
                "Authorization":"key=AAAAxIkn9nY:APA91bHo0OdhbBNNCy8_GN7DsUwGpGFNiu2B0hzIVWKa5G2UJxiJQRiG7FX0VR8JBDYT0ydbmBYWhWx9JuGjPURvcQlzItXhVf-coJ5F3mwLXKq8sWOFRTnvI1Xm3xE_GxD97tFiEXX4",
                // "Authorization":"key=AAAAZAr6u2A:APA91bFv992Wos4HwN0-dyQlMPSHDOJ7BnAeFRfsFLS8FjDs8gwy7Om-cx6ZG9dgG1sI09cqo4ATQlG5lhXXdInxkZLB6zp1dtJeSCv8aNT1BZoBn6CHQQ--Qsh8i4zLXOIAlEwlfyMU",

              },
              url: 'https://fcm.googleapis.com/fcm/send',
              data: {
                      "to" : docs[0].firebase_token,
                      "notification" : {
                          "body" : msg,
                          "title": "Big Midas"
                      },
                    }
            }).then((response) =>{
              console.log(response);
              // res.send(response.data)
            })
            .catch((err) => {
              console.log(err);
              // res.send({ msg: "Invalid customerid" });
            });
          } catch(er){
            console.log(er);
            // res.send({msg: "Customer Id not found",er})
          }
      
    }
});
  
}



export default {
  async addorder(req, res) {
    const order = new Orders({
      productid: req.body.productid,
      customerid: req.body.customerid,
      quantity: req.body.quantity,
      address: req.body.address,
      vendorid: req.body.vendorid,
      status: req.body.status,
      amount:req.body.amount,
      order_note:req.body.order_note,
      orederid:1000
    });
    Orders.find({})
    .sort({ _id: -1})
    .limit(1)
    .then((result)=>{
      sendnotificationonbooking(req.body.vendorid,"You have a new order for your store");
      var value = parseInt(result[0].orederid)+1
      order.orederid = value.toString();
      Orders.create(order)
            .then((Users) => res.json(Users))
            .catch((err) => res.status(500).json(err));
    }) 
  },


  async addmultipleorder(req, res) {
    var resp = [];
    var value = 0;
    var counter=1;
    console.log(req.body);
    for(var i=0;i<req.body.productid.length;i++){
    const order = new Orders({
      productid: req.body.productid[i],
      customerid: req.body.customerid,
      quantity: req.body.quantity[i],
      address: req.body.address,
      vendorid: req.body.vendorid,
      status: req.body.status,
      amount:req.body.amount[i],
      delivery_charges: req.body.delivery_charges,
      order_note:req.body.order_note,
      orederid:1000
    });
    Orders.find({})
    .sort({ _id: -1})
    .limit(1)
    .then((result)=>{
      if(value<1){
        console.log(value);
        value = parseInt(result[0].orederid)+1
      }
      console.log("this is i",i);
      console.log("this is value",value);
      order.orederid = value.toString();
      order.orederid = order.orederid+"-"+counter;
      counter=counter+1;
      Orders.create(order)
      .then((users)=>{
        sendnotificationonbooking(req.body.vendorid,"You have a new order for your store");
        console.log(users);
      })
      .catch((err)=>{console.log(err); resp.push(err)});
    });
  }
    res.json({result: counter}); 
  },


  async ordersByVendor(req, res) {
    let { vendorid } = req.params;
    let splitted = vendorid.split("&&");
    let vend = splitted[0];
    // let vend = "60cddaca37fd341aeba02149";
    let stat = splitted[1];
    console.log(vend , stat);
    if (stat == undefined || stat == "0") {
      Orders.aggregate([
        {
          $addFields: {
            getvendorid: { $toString: vend },
            convertedvendorid: { $toObjectId: vend },
          },
        },
        {
          $lookup: {
            from: "vendor-details",
            localField: "convertedvendorid",
            foreignField: "_id",
            as: "get_vendor",
          },
        },

        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$vendorid", "$getvendorid"] }],
            },
          },
        },
        {
          $project: {
            productid: "$productid",
            quantity: "$quantity",
            status: "$status",
            orederid: "$orederid",
            address: "$address",
            deliverycharges:"$delivery_charges",
            ordernote: "$order_note",
            timeoforder: "$createdAt",
            customerid: "$customerid",
          },
        },

        {
          $addFields: {
            convertedId1: { $toObjectId: "$productid" },
            cus_id: { $toObjectId: "$customerid" },
            note: {$toString: "$ordernote"},
            addr: {$toString: "$address"},
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "convertedId1",
            foreignField: "_id",
            as: "get_products",
          },
        },
        // {
        //   $project: {
        //     deliverycharges: "$get_vendor.delivery_charges",
        //     freedeliveryabove: "$get_vendor.free_delivery",
        //   },
        // },
        {
          $lookup: {
            from: "customer-details",
            localField: "cus_id",
            foreignField: "_id",
            as: "get_customer_details",
          },
        },
        {
          $project: {
            productname: "$get_products.productname",
            prodctcost: "$get_products.prodctcost",
            customername: "$get_customer_details.name",
            customerid: "$get_customer_details._id",
            customerphone: "$get_customer_details.phoneno",
            discountedprodprice: "$get_products.discountedprodprice",
            quantity: "$quantity",
            deliverycharges:"$deliverycharges",
            // freedeliveryabove:"$get_vendor.free_delivery",
            ordernote: "$note",
            address: "$addr",
            status: "$status",
            orederid: "$orederid",
            ordertime: "$timeoforder",
            totalprice: null,
            customfield: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", 1] }, then: "pending" },
                  { case: { $eq: ["$status", 2] }, then: "confirm" },
                ],
                default: "delivered",
              },
            },
          },
        },
        { $unwind: "$customername" },
        { $unwind: "$customerphone" },
        { $unwind: "$productname" },
        { $unwind: "$customerid" },
        // // { $unwind: "$ordernote" },
        { $unwind: "$prodctcost" },
        { $unwind: "$discountedprodprice" },
      ])
        .then((result) => {
          console.log(result);
          res.send({ products: result });
        })
        .catch((err) => {
          res.send({ msg: "Invalid vendorid" });
        });

    } else {
      Orders.aggregate([
        {
          $addFields: {
            getvendorid: { $toString: vend },
            getstatus: { $toInt: stat },
          },
        },

        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$vendorid", "$getvendorid"] },
                { $eq: ["$status", "$getstatus"] },
              ],
            },
          },
        },

        {
          $project: {
            productid: "$productid",
            quantity: "$quantity",
            deliverycharges:"$delivery_charges",
            status: "$status",
            address: "$address",
            orederid: "$orederid",
            timeoforder: "$createdAt",
            customerid: "$customerid",
          },
        },

        {
          $addFields: {
            convertedId1: { $toObjectId: "$productid" },
            cus_id: { $toObjectId: "$customerid" },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "convertedId1",
            foreignField: "_id",
            as: "get_products",
          },
        },
        {
          $lookup: {
            from: "customer-details",
            localField: "cus_id",
            foreignField: "_id",
            as: "get_customer_details",
          },
        },
        {
          $project: {
            productname: "$get_products.productname",
            prodctcost: "$get_products.prodctcost",
            customername: "$get_customer_details.name",
            customerid: "$get_customer_details._id",
            customerphone: "$get_customer_details.phoneno",
            discountedprodprice: "$get_products.discountedprodprice",
            quantity: "$quantity",
            address: "$address",
            deliverycharges:"$deliverycharges",
            status: "$status",
            orederid: "$orederid",
            ordertime: "$timeoforder",
            customfield: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", 1] }, then: "pending" },
                  { case: { $eq: ["$status", 2] }, then: "confirm" },
                ],
                default: "delivered",
              },
            },
          },
        },
        { $unwind: "$customername" },
        { $unwind: "$productname" },
        { $unwind: "$customerid" },
        { $unwind: "$customerphone"},
        { $unwind: "$prodctcost" },
        { $unwind: "$discountedprodprice" },
      ])
        .then((result) => {
          console.log(result)
          res.send({ products: result });
        })
        .catch((err) => {
          console.log(err)
          res.send({ msg: "Invalid vendorid" });
        });
    }
  },

  async updatestatus(req,res){
    // console.log(req.params);
    // let { vendorid } = req.params;
    // let splitted = vendorid.split("&&");
    let vend = req.body.orderid;
    let stat = req.body.stat;
    let custid = req.body.cust;
    let msg = req.body.message;
    Orders
    .aggregate([
    {
      $addFields:{
       convertedId: {$toObject: vend}
      }
    }
  ]);
    Orders.updateOne({_id: vend}, 
      {status: stat}
      ).then((result)=>{
        sendnotificationtocustomer(custid,msg);
        console.log(result);
      }).catch((err) => {
        console.log(err);
      });
  },

  async ordersByCustomer(req, res) {
    let { id } = req.params;
    console.log(id);
    let splitted = id.split("&&");
    let vend = splitted[0];
    let stat = splitted[1];
    console.log(vend, stat);
    if (stat == undefined || stat == "0") {
      Orders.aggregate([
        {
          $addFields: {
            getvendorid: { $toString: vend },
            // vendorid: { $toObjectId: vend},
          },
        },

        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$customerid", "$getvendorid"] }],
            },
          },
        },

        {
          $project: {
            productid: "$productid",
            quantity: "$quantity",
            status: "$status",
            orederid: "$orederid",
            timeoforder: "$createdAt",
            customerid: "$customerid",
            vendor:"$vendorid",
          },
        },

        {
          $addFields: {
            convertedId1: { $toObjectId: "$productid" },
            cus_id: { $toObjectId: "$customerid" },
            vend_id: { $toObjectId: "$vendor" },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "convertedId1",
            foreignField: "_id",
            as: "get_products",
          },
        },
        {
          $lookup: {
            from: "vendor-details",
            localField: "vend_id",
            foreignField: "_id",
            as: "get_vendor",
          },
        },
        {
          $lookup: {
            from: "customer-details",
            localField: "cus_id",
            foreignField: "_id",
            as: "get_customer_details",
          },
        },
        {
          $project: {
            productname: "$get_products.productname",
            prodctcost: "$get_products.prodctcost",
            customername: "$get_customer_details.name",
            discountedprodprice: "$get_products.discountedprodprice",
            prodphotos:"$get_products.prodphoto",
            quantity: "$quantity",
            vendorphone: "$get_vendor.phonenumber",
            // delivery_charges: "$get_customer_details.delivery_charges",
            // free_delivery_above: "$get_customer_details.free_delivery_above",
            //status: "$status",
            orederid: "$orederid",
            ordertime: "$timeoforder",
            customfield: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", 1] }, then: "pending" },
                  { case: { $eq: ["$status", 2] }, then: "confirm" },
                ],
                default: "delivered",
              },
            },
          },
        },
        { $unwind: "$customername" },
        { $unwind: "$productname" },
        {$unwind: "$prodphotos"},
        // { $unwind: "$delivery_charges" },
        // { $unwind: "$free_delivery_above"},
        { $unwind: "$prodctcost" },
        { $unwind: "$discountedprodprice" },
      ])
        .then((result) => {
          console.log(result);
          res.send({ products: result });
        })
        .catch((err) => {
          console.log(err)
          res.send({ msg: "Invalid vendorid" });
        });
    } else {
      Orders.aggregate([
        {
          $addFields: {
            getvendorid: { $toString: vend },
            getstatus: { $toInt: stat },
          },
        },

        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$customerid", "$getvendorid"] },
                { $eq: ["$status", "$getstatus"] },
              ],
            },
          },
        },

        {
          $project: {
            productid: "$productid",
            quantity: "$quantity",
            status: "$status",
            orederid: "$orederid",
            timeoforder: "$createdAt",
            customerid: "$customerid",
            vendor:"$vendorid",
          },
        },

        {
          $addFields: {
            convertedId1: { $toObjectId: "$productid" },
            cus_id: { $toObjectId: "$customerid" },
            vend_id: { $toObjectId: "$vendor" },
          },
        },
        {
          $lookup: {
            from: "vendor-details",
            localField: "vend_id",
            foreignField: "_id",
            as: "get_vendor",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "convertedId1",
            foreignField: "_id",
            as: "get_products",
          },
        },
        {
          $lookup: {
            from: "customer-details",
            localField: "cus_id",
            foreignField: "_id",
            as: "get_customer_details",
          },
        },
        {
          $project: {
            productname: "$get_products.productname",
            prodctcost: "$get_products.prodctcost",
            customername: "$get_customer_details.name",
            discountedprodprice: "$get_products.discountedprodprice",
            quantity: "$quantity",
            vendorphone: "$get_vendor.phonenumber",
            //status: "$status",
            orederid: "$orederid",
            ordertime: "$timeoforder",
            customfield: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", 1] }, then: "pending" },
                  { case: { $eq: ["$status", 2] }, then: "confirm" },
                ],
                default: "delivered",
              },
            },
          },
        },
        { $unwind: "$customername" },
        { $unwind: "$productname" },
        { $unwind: "$prodctcost" },
        { $unwind: "$discountedprodprice" },
      ])
        .then((result) => {
          res.send({ products: result });
        })
        .catch((err) => {
          console.log(err)
          res.send({ msg: "Invalid vendorid" });
        });
    }
  },
//changed $toObject to $toString in lines 381,382,383

  async allOrders(req, res) {
    Orders.aggregate([
      {
        $addFields: {
          convertedId1: { $toObjectId: "$vendorid" },
          convertedId2: { $toObjectId: "$customerid" },
          convertedId3: { $toObjectId: "$productid" },
          datecreated: {$toString: "$createdAt"},
        },
      },

      {
        $lookup: {
          from: "vendor-details",
          localField: "convertedId1",
          foreignField: "_id",
          as: "get_vendors",
        },
      },
      {
        $lookup: {
          from: "customer-details",
          localField: "convertedId2",
          foreignField: "_id",
          as: "get_customers",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "convertedId3",
          foreignField: "_id",
          as: "get_products",
        },
      },

      {
        $project: {
          vendors: "$get_vendors.name",
          customers: "$get_customers.name",
          productname: "$get_products.productname",
          price: "$price",

          address: "$address",

          quantity: "$quantity",

          distance: "$distance",

          status: "$status",

          orederid: "$orederid",

          date: "$datecreated",
        },
      },
      //{ $unwind: "vendors" },
      //{ $unwind: "customers" },
      //{ $unwind: "productname" },
    ])
      .then((result) => {
        result.reverse();
        console.log(result)
        res.send({ products: result });
      })
      .catch((err) => {
        console.log(err)
        res.send({ msg: err });
      });
  },
};
