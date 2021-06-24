import Joi from "joi";
import Shoplisitng from "../../models/listings/soplisting.model";
import HttpStatus from "http-status-codes";
import ShopReviews from "../../models/reviews/reviewshop.model";

import multer from "multer";

export default {
  async createshopcat(req, res) {
    let imgarr=[];
    //Validate the Request
    console.log('dd',req.files)
    console.log('dd',req.files['pan_adhaar'])
    let schema = new Shoplisitng({
      shop_name: req.body.shop_name,
      location_map: req.body.location_map,
      area: req.body.area, 
      city: req.body.city,
      state:req.body.state,
      pan_adhaar: req.files['pan_adhaar'][0].path,
      trade_licence: req.files['trade_licence'][0].path,
      fssai_licence: req.files['fssai_licence'][0].path,
      images:req.files['images'],
      active:"true",
      address: req.body.address,
      category: req.body.category,
      sub_cat : req.body.sub_cat,
      vendorid: req.body.vendorid,
      //subscription: req.body.subscription,
    });
    for(let i=0;i<req.files['images'].length;i++){
      console.log("hello");
      imgarr.push(req.files['images'][i].path);
    }
    schema.images = imgarr;
  
    Shoplisitng.find({ shop_name: req.body.shop_name }, function (err, user) {
      if (user.length != 0) {
        console.log("Shop already exists");
        return res.json({ message: "Shop already exists " });
      } else {
        Shoplisitng.create(schema)
          .then((Users) => res.json(Users))
          .catch((err) => res.status(500).json(err));
      }
    });
  },

  findAll1(req, res, next) {
    var s = req.protocol + "://" + req.get("host");
    let { id } = req.params;
    Shoplisitng.aggregate([
      {
        $addFields: {
          // convertedId2: s,
          convertedId1: { $toObjectId: "$category" },
          convertedId5: { $toString: id },
          convertedId2: { $toObjectId: "$vendorid" },
          convertedId6: { $toObjectId: "$subscription" },
        },
      },
      {
        $match: { vendorid: { $eq: id } },
      },
      {
        $lookup: {
          from: "shoplisting-cats",
          localField: "convertedId1",
          foreignField: "_id",
          as: "get_cateogires",
        },
      },
      {
        $lookup: {
          from: "vendor-details",
          localField: "convertedId2",
          foreignField: "_id",
          as: "vendor_details",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "convertedId6",
          foreignField: "_id",
          as: "get_subscription",
        },
      },
      {
        $project: {
          shop_name: "$shop_name",
          city: "$city",
          area: "$area",
          address: "$address",
          cat_name: "$get_cateogires.cat_name",
          createddate: "$createddate",
          pan_adhaar: "$pan_adhaar",
          trade_licence: "$trade_licence",
          fssai_licence: "$fssai_licence",
          vendor: "$vendor_details.name",
          images:"$images",
          phonenumber: "$vendor_details.phonenumber",
          subscriptiondays: "$get_subscription.days",
          subscriptionamount: "$get_subscription.cost",
        },
      },
      {
        $unwind: "$cat_name",
      },
      {
        $unwind: "$vendor",
      },
    ]).then((vechicle) => {console.log(vechicle); res.json(vechicle)});
  },

  findAll(req, res, next) {
    var s = req.protocol + "://" + req.get("host");

    Shoplisitng.aggregate([
      {
        $addFields: {
          convertedId2: s,
          convertedId1: { $toObjectId: "$category" },
          convertedId2: { $toObjectId: "$vendorid" },
          convertedId5: { $toString: "$_id" },
          // nameFilter: {
          //   $concat: [s,'/',"$doc"],
          // },
        },
      },
      {
        $lookup: {
          from: "shoplisting-cats",
          localField: "convertedId1",
          foreignField: "_id",
          as: "get_cateogires",
        },
      },
      {
        $lookup: {
          from: "vendor-details",
          localField: "convertedId2",
          foreignField: "_id",
          as: "vendor_details",
        },
      },
      {
        $lookup: {
          from: "shop-reviews",
          localField: "convertedId5",
          foreignField: "shop_id",
          as: "get_review",
        },
      },
      {
        $project: {
          shop_name: "$shop_name",
          city: "$city",
          area: "$area",
          address: "$address",
          cat_name: "$get_cateogires.cat_name",
          createddate: "$createddate",
          pan_adhaar: "$pan_adhaar",
          trade_licence: "$trade_licence",
          fssai_licence: "$fssai_licence",
          vendor: "$vendor_details.name",
          review: "$get_review.review",
        },
      },
    //   {
    //     $unwind: "$cat_name",
    //   },
    //   {
    //     $unwind: "$vendor",
    //   },
    //   {
    //     $unwind: "$review",
    //   },
    ]).then((vechicle) =>{console.log(vechicle);   res.json(vechicle.reverse())});
  },
  Updatecat(req, res) {
    let { id } = req.params;
    Shoplisitng.findByIdAndUpdate(
      { _id: id },
      {
        shop_name: req.body.shop_name,
        location_map: req.body.location_map,
        area: req.body.area,
        city: req.body.city,
        pan_adhaar: req.files['pan_adhaar'][0].path,
        trade_licence: req.files['trade_licence'][0].path,
        fssai_licence: req.files['fssai_licence'][0].path,
        images:req.files['images'],
        address: req.body.address,
        category: req.body.category,
        //doc: req.file.path,
        vendorid: req.body.vendorid,
      },
      { new: true }
    )
      .then((updated) => {
        res.send({ msg: updated });
      })
      .catch((err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err));

    // let schema = new Shoplisitng({
    //   shop_name: req.body.shop_name,
    //   location_map: req.body.location_map,
    //   area: req.body.area,
    //   city: req.body.city,
    //   pan_adhaar: req.body.pan_adhaar,
    //   trade_licence: req.body.trade_licence,
    //   fssai_licence: req.body.fssai_licence,
    //   address: req.body.address,
    //   category: req.body.category,
    //   //doc: req.file.path,
    //   vendorid: req.body.vendorid,
    // });

    // Shoplisitng.updateOne({ _id: id }, schema, { multi: true })

    //   .then((client) => res.json(client))

    //   .catch((err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err));
  },
  Delete(req, res) {
    let { id } = req.params;
    Shoplisitng.findByIdAndRemove(id)
      .then((client) => {
        if (!client) {
          return res
            .status(HttpStatus.NOT_FOUND)
            .json({ err: "Could not delete any Invoice " });
        }
        return res.json(client);
      })
      .catch((err) => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err));
  },


  async getshopimage(req,res){
    let { id } = req.params;
    let { path } = req.params;
    console.log(id, path);
    Shoplisitng.findOneAndUpdate(
      {vendorid: id },
      { $pull: { images: "uploads/"+path } },
    ).then((result)=>{console.log(result); res.send(result)})

  },

  async addshopimages(req,res){
    let imgpath=[];
    console.log(req);
    for(let i=0;i<req.files['images'].length;i++){
      imgpath.push(req.files['images'][i].path);
    }
    Shoplisitng.findOneAndUpdate(
      {vendorid: req.body.vendorid },
      { $push: { images: imgpath } },
    ).then((result)=>{console.log(result); res.send({msg:"done"})})
  },




  findreviews(req, res, next) {
    let { id } = req.params;

    var s = req.protocol + "://" + req.get("host");

    // Shoplisitng.aggregate([
    //   {
    //     $addFields: {
    //       convertedId1: { $toString: "$_id" },
    //       convertedId3: { $toString: id },
    //     },
    //   },
    //   {
    //     $match: { $expr: { $and: [{ $eq: ["$vendorid", "$convertedId3"] }] } },
    //   },
    //   {
    //     $lookup: {
    //       from: "shop-reviews",
    //       localField: "convertedId1",
    //       foreignField: "shop_id",
    //       as: "get_reviews",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       customerid: "$get_reviews.customer_id",
    //     },
    //   },
    //   {
    //     $unwind: "$customerid",
    //   },
    //   {
    //     $addFields: {
    //       customerid: { $toObjectId: "$customerid" },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "customer-details",
    //       localField: "customerid",
    //       foreignField: "_id",
    //       as: "get_customer",
    //     },
    //   },
    //   {
    //     $addFields: {
    //       customerpic: "$get_customer.customerpic",
    //     },
    //   },
    //   { $unwind: "$customerpic" },
    //   {
    //     $addFields: {
    //       customerpic: {
    //         $concat: [s, "/", "$customerpic"],
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       rating: "$get_reviews.rating",
    //       review: "$get_reviews.review",
    //       createdat: "$get_reviews.createdat",
    //       customer: "$get_customer.name",
    //       customerpic: "$customerpic",
    //     },
    //   },
    //   { $unwind: "$rating" },
    //   { $unwind: "$review" },
    //   { $unwind: "$createdat" },
    //   { $unwind: "$customer" },
    //   { $unwind: "$customerpic" },
    // ])
    ShopReviews.aggregate([
      {
        $addFields:{
          conver1: {$toString: id},
        }
      },
      {
        $match: { $expr: { $and: [{ $eq: ["$shop_id", "$conver1"] }] } },
      },
      {
        $addFields:{
          conver2:{$toObjectId: "$customer_id"}
        }
      },
      {
        $lookup:{
          from:"customer-details",
          localField:"conver2",
          foreignField:"_id",
          as:"getcustomerdetails"
        }
      },
      {
        $project:{
          review:"$review",
          rating:"$rating",
          customerid: "$customer_id",
          customername: "$getcustomerdetails.name",
          customerimage: "$getcustomerdetails.customerpic",
          createdat: "$createdat"
        }
      }
    ])
    .then((vechicle) => { console.log(vechicle);res.json(vechicle)});
  },


  async editactive(req, res) {
    let { id } = req.params;
    let vid = id.split("&&")[0];
    let val = id.split("&&")[1];

    Shoplisitng.findOneAndUpdate(
      { vendorid: vid },
      {
        active: val,
      },
      { new: true }
    )
      .then((result) => {
        res.send({ msg: result });
      })
      .catch((err) => {
        res.send({ msg: err });
      });
  },


  async getactive(req,res){
    let { id } = req.params;
    Shoplisitng.find({vendorid:id}).then((result)=>{
      console.log(result);
      res.send({status: result[0].active});
    });
  },


  findvendordbycat(req, res, next) {
    let {id} = req.params;
 
    Shoplisitng.aggregate([
       {
         $addFields: {
           convertedId2: { $toObjectId: "$vendorid" },
           convertedId5: { $toString: "$_id" },
         },
       },
       {
         $match: { category: { $eq: id } },
       },
       {
         $lookup: {
           from: "vendor-details",
           localField: "convertedId2",
           foreignField: "_id",
           as: "vendor_details",
         },
       },
      {
        $project:{
         vendor_id:"$vendor_details._id",
         serviceprovidername:"$vendor_details.name",
         call:"$vendor_details.phonenumber",
         active:"$active",
         address:"$address",
         location:"$location_map",
         km_serving:"$vendor_details.km_serving",
         image: '$images',
         shop_name:"$shop_name"
        }
      }
     
     ]).then((vechicle) =>{console.log(vechicle); res.json(vechicle)});
   }, 


};
