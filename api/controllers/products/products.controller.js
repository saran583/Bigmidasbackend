import Product from "../../models/products/products.model";

export default {
  async createProduct(req, res) {
    const product = new Product({
      productname: req.body.productname,
      category: req.body.category,
      subcategory: req.body.subcategory,
      prodctcost: req.body.prodctcost,
      discountedprodprice: req.body.discountedprodprice,
      prodphoto: req.files,
      vendorid: req.body.vendorid,
      unit: req.body.unit,
      stock: req.body.stock,
      description: req.body.description,
    });
    // if(req.files){
    //   let path=''
    //   req.files.forEach(function(files,index, arr){
    //     path = path + files.path+'';
    //   })
    //   path = path.substring(0, path.lastIndexOf(","))
    //   product.prodphoto = path;
    // }
    Product.find({ productname: req.body.productname, vendorid: req.body.vendorid }, function (err, user) {
      if (user.length != 0) {
        console.log("product already exists");
        return res.json({ message: "product already exists " });
      } else {
        Product.create(product)
          .then((Users) =>{ console.log(req.files.length);res.json(Users)})
          .catch((err) => {console.log(err); res.status(500).json(err)});
      }
    });
  },

  async getallProducts(req, res) {
    var s = req.protocol + "://" + req.get("host");
    Product.aggregate([
      {
        $addFields: {
          convertedId1: { $toObjectId: "$category" },
          convertedId2: { $toObjectId: "$vendorid" },
          // photo: {
          //   $concat: [s, "/", "$prodphoto"],
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
          as: "get_vendors",
        },
      },
      {
        $project: {
          productname: "$productname",
          category: "$get_cateogires.cat_name",
          subcategory: "$subcategory",
          prodctcost: "$prodctcost",
          discountedprodprice: "$discountedprodprice",
          prodphoto: "$prodphoto.path",
          vendorid: "$get_vendors.name",
        },
      },
      { $unwind: "$category" },
      { $unwind: "$vendorid" },
    ])
      .then((result) => {
        res.send({ products: result });
      })
      .catch((err) => {
        res.send({ msg: err });
      });
  },

  async getProductsByCategory(req, res) {
    var s = req.protocol + "://" + req.get("host");
    let { category } = req.params;
    Product.aggregate([
      {
        $match: { category: { $eq: category } },
      },
      {
        $addFields: {
          convertedId1: { $toObjectId: "$category" },
          convertedId2: { $toObjectId: "$vendorid" },
          // photo: {
          //   $concat: [s, "/", "$prodphoto"],
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
          as: "get_vendors",
        },
      },
      {
        $project: {
          productname: "$productname",
          category: "$get_cateogires.cat_name",
          subcategory: "$subcategory",
          prodctcost: "$prodctcost",
          discountedprodprice: "$discountedprodprice",
          prodphoto: "$prodphoto.path",
          vendorid: "$get_vendors.name",
        },
      },
    //  { $unwind: "$category" },
    //  { $unwind: "$vendorid" },
    ])
      .then((result) => {
        res.send({ products: result });
      })
      .catch((err) => {
        res.send({ msg: "Invalid category" });
      });
  },
  async getproductvendorid(req, res) {
    var s = req.protocol + "://" + req.get("host");
    let { id } = req.params;
    Product.aggregate([
      {
        $addFields: {
          conver: { $toString: "$_id" },
        },
      },
      {
        $match: { conver: { $eq: id } },
      },
      {
        $project: {
          vendorid: "$vendorid",
        },
      },
    ])
      .then((result) => {
        res.send({ products: result });
      })
      .catch((err) => {
        res.send({ msg: "User Not Found" });
      });
  },
async getProductsByShop(req, res) {
    var s = req.protocol + "://" + req.get("host");
    let { shopid } = req.params;
    Product.aggregate([
      {
        $addFields: {
       
            convertedId3: { $toObjectId: shopid },
          // photo: {
          //   $concat: [s, "/", "$prodphoto"],
          // },
        },
      },
      {
   $lookup:
     {
       from:  "shop-details",
       let: { convertedId3: '$convertedId3', vendor:"$vendorid" },
       pipeline: [ { $match:
                 { $expr:
                    { $and:
                       [
                         { $eq: [ "$_id",  "$$convertedId3" ] },
                         { $eq: [ "$vendorid", "$$vendor" ] }
                       ]
                    }
                 }
              }, ],
       as:"get_shops"
} },
   {
        $addFields: {
          convertedId3: { $toObjectId: "$vendorid" },
          convertedId4: { $toObjectId: "$category" },
          convertedId9: { $toObjectId: "$subcategory" },
        },
      },
      {
        $lookup: {
          from: "vendor-details",
          localField: "convertedId3",
          foreignField: "_id",
          as: "get_vendors",
        },
      },

      {
        $lookup: {
          from: "shoplisting-cats",
          localField: "convertedId4",
          foreignField: "_id",
          as: "get_cateogires",
        },
      },
      {
        $lookup: {
          from: "shoplisting-sub-cats",
          localField: "convertedId9",
          foreignField: "_id",
          as: "get_cateogires_sub",
        },
      },

      {
        $project: {
           item:
               {
                 $cond: { if: { $ne: [ "$get_shops", [] ] }, then: [ {//ven:"$get_shops.vendorid",
                         //  vondorids:'$vendorid',
                           productname: "$productname",
                           category: "$get_cateogires.cat_name",
                           subcategory: "$get_cateogires_sub.sub_cat_name",
                           prodctcost: "$prodctcost",
                           unit:"$unit",
                           stock:"$stock",
                           description:"$description",
                           discountedprodprice: "$discountedprodprice",
                           prodphoto: "$prodphoto.path",
                           vendorid: "$get_vendors.name"}], else: 20 }
               },
         
        },
      },
     {
        $match: { item: { $ne: 20 } },
      },
      //  {
      //   $project: {
           
      //                      vondorids:'$item.vendorid',
      //                      productname: "$item.productname",
      //                      category: "$item.category",
      //                      subcategory: "$item.subcategory",
      //                      prodctcost: "$item.prodctcost",
      //                      discountedprodprice: "$item.discountedprodprice",
      //                      prodphoto: "$item.prodphoto.",
      //                      vendorid: "$item.vendorid",
         
      //   },
      // },

      //   { $unwind: "$ven" },
      // { $unwind: "$category" },
      // { $unwind: "$vendorid" },
      // {
      //   $addFields: {
      //     convertedId11: { $toObjectId: "$ven" },
      //     convertedId12: { $toObjectId: "$vondorids" },
      //   },
      // },
      // {
      //   $match: { convertedId11: { $eq: '$convertedId12' } },
      // },

      // {
      //   $project: {
      //   //  ven:"$get_shops.vendorid",
      //     //vondorids:'$vendorid',
      //     productname: "$productname",
      //     category: "$category",
      //     subcategory: "$subcategory",
      //     prodctcost: "$prodctcost",
      //     discountedprodprice: "$discountedprodprice",
      //     prodphoto: "$prodphoto.path",
      //     vendorid: "$vendorid",
      //   },
      // },
    ])
      .then((result) => {
        res.send({ products: result });
      })
      .catch((err) => {
        res.send({ msg: "User Not Found" });
      });
  },

  async getProductsByVendor(req, res) {
    var s = req.protocol + "://" + req.get("host");
    let { vendorid } = req.params;
    Product.aggregate([
      {
        $addFields: {
          getvendorid: { vendorid },
          // photo: {
          //   $concat: [s, "/", "$prodphoto"],
          // },
        },
      },

      {
        $match: { vendorid: { $eq: vendorid } },
      },
      {
        $addFields: {
          convertedId3: { $toObjectId: "$vendorid" },
          convertedId4: { $toObjectId: "$category" },
        },
      },
      {
        $lookup: {
          from: "vendor-details",
          localField: "convertedId3",
          foreignField: "_id",
          as: "get_vendors",
        },
      },

      {
        $lookup: {
          from: "shoplisting-cats",
          localField: "convertedId4",
          foreignField: "_id",
          as: "get_cateogires",
        },
      },

      {
        $project: {
          productname: "$productname",
          category: "$get_cateogires.cat_name",
          subcategory: "$subcategory",
          prodctcost: "$prodctcost",
          discountedprodprice: "$discountedprodprice",
          prodphoto: "$prodphoto.path",
          vendorid: "$get_vendors.name",
          unit:"$unit",
          stock:"$stock",
          description:"$description"
        },
      },
      { $unwind: "$category" },
      { $unwind: "$vendorid" },
    ])
      .then((result) => {
        res.send({ products: result });
      })
      .catch((err) => {
        res.send({ msg: "User Not Found" });
      });
  },

  async editProducts(req, res) {
    let { id } = req.params;

    Product.findByIdAndUpdate(
      { _id: id },
      {
        productname: req.body.productname,
        category: req.body.category,
        subcategory: req.body.subcategory,
        prodctcost: req.body.prodctcost,
        discountedprodprice: req.body.discountedprodprice,
        $push: {prodphoto: req.files},
        vendorid: req.body.vendorid,
        unit: req.body.unit,
        stock: req.body.stock,
        description: req.body.description,
      },
      { new: true }
    )
      .then(() => {
        res.send({ msg: "Updated Successfully" });
      })
      .catch((err) => {
        res.send({ msg: "Update Failed" });
      });
  },

  async deleteProducts(req, res) {
    let { id } = req.params;
    Product.findByIdAndDelete(id)
      .then((invoice) => {
        if (!invoice) {
          res.send({ msg: "Product Not found" });
        }
        res.send({ msg: "Product deleted" });
      })
      .catch((err) => {
        res.send({ msg: "Some error" });
      });
  },

};
