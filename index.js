var express =  require("express");
var http = require("http");
var app = express();
var async = require("async");
var fs = require("fs")
var path  = require("path");
var bodyParser = require('body-parser');
var request = require('request');
var nunjucks = require('nunjucks');
var flash = require('express-flash');
var _ = require('underscore');
var session = require('express-session')
nunjucks.configure('templates', {
    autoescape: true,
    express: app,
    watch:true
});

app.use(session({
    secret: 'haaaassao',
    cookie: { secure: false },
    saveUninitialized:false,
    resave:true
}));
app.use("/public" ,express.static(path.join(__dirname , "/public")));
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var baseUrlGo = "http://localhost:9000/";

app.get("/" , function(req, res){
    res.render("admin/frontPage.html");
});
app.get("/admin" , function(req, res){
    res.render("admin/registerAdmin.html");
});
app.get("/branch" , function(req, res){
    res.render("branch/create.html");
});
//-------- Create Admin User
app.post("/adminCreate" , function(req , res){
    request.post(baseUrlGo + "user/create" , {
        json:true,
        body:{
            name:req.body.name,
            email:req.body.email,
            password:req.body.password
        }
    },function(err , response , body){
        if (body.status == "Success"){
            res.redirect("/")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});

//--------Login
app.post("/login" , function(req , res){
    request.post(baseUrlGo + "user/login" , {
        json:true,
        body:{
            email:req.body.email,
            password:req.body.password
        }
    },function(err , response , body){
        if (body.status == "Success"){
            req.session.user = body.body
            user = req.session.user;
            res.redirect("/list")
        }else {

            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});

//-------- Update Admin User
app.post("/user/update/:id" , function(req , res){
    request.post(baseUrlGo + "user/update/"+ req.params.id, {
        json:true,
        body:{
            name:req.body.name,
            email:req.body.email,
            password:req.body.password
        }
    },function(err , response , body){
        if (body.status == "Success"){
            res.redirect("/adminList")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//--------Delete Admin User
app.post("/delete/:id" , function(req , res){
    request.post(baseUrlGo + "user/delete/"+ req.params.id , {
        json:true
    },function(err , response , body){
        if (body.status == "Success"){
            res.redirect("back")
        }else {

            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- List Admin Users
app.get("/adminList" , function(req , res){
    request.get(baseUrlGo + "user/findAll" , {
        json:true
    },function(err , response , body){
        if (body.status == "Success"){
                res.render("admin/adminList.html" , {
                Admins:body.body
            })
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});

//--------Get Admin to Edit
app.get("/user/find/:id" , function(req , res){
    request.get(baseUrlGo + "user/find/" + req.params.id , {
        json:true
    },function(err , response , body){
        if (body.status == "Success"){
            res.render("admin/adminEdit.html" , {
                admin:body.body
            })
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Create Customer
app.post("/customerCreate" , function(req , res){
    request.post(baseUrlGo + "customer/create" , {
        json:true,
        body:{
            email:req.body.email,
            password:req.body.password,
            name:req.body.name,
            accNo:req.body.account,
            address:req.body.address
        }
    },function(err , response , body){

        if (body.status == "Success"){
            res.redirect("/list")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Find one  Customer to make Edit
app.get("/customer/:id" , function(req , res){
    request.get(baseUrlGo + "customer/"+req.params.id , {
        json:true
    },function(err , response , body){
        //return res.json(body);
        if (body.status == "Success"){
            res.render("customer/customerEdit.html" , {
                customer:body.body
            })
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Update Customer
app.post("/customer/update/:id" , function(req , res){
    //return res.json(req.body);
    request.post(baseUrlGo + "customer/update/" +req.params.id, {
        json:true,
        body:{
            email:req.body.email,
            password:req.body.password,
            name:req.body.name,
            accNo:req.body.account,
            address:req.body.address
        }
    },function(err , response , body){

        if (body.status == "Success"){
            res.redirect("/list")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Delete Customer
app.get("/customer/delete/:id" , function(req , res){
    //return res.json(req.body);
    request.get(baseUrlGo + "customer/delete/" + req.params.id , {
        json:true
    },function(err , response , body){
        if (body.status == "Success"){
            res.redirect("/list")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});

//-------- List Customers
app.get("/list" , function(req , res){
    request.get(baseUrlGo + "customer" , {
        json:true
    },function(err , response , body){
        if (body.status == "Success"){
            res.render("customer/list.html" , {
                customers:body.body
            })
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});

//-------- Find Customer Info to Use in Transaction
app.get("/transaction/:id" , function(req , res){
    async.parallel([
        function(next) {
            request.get(baseUrlGo + "customer/" + req.params.id, {
                json: true
            }, function (err, customer) {
               var customers = customer.body.body
                next(err , customers)
            })

        }, function(next) {
            request.get(baseUrlGo + "branch" , {
                json:true
            },function(err , branch){
                var branches = branch.body.body

            next(err , branches)
            })
        }],function(err ,result){
        res.render("customer/createTransaction.html" , {
            customers: _.first(result),
            branches: _.last(result)
        })
         //return res.json(result);
    })
});

//-------- Create Transaction
app.post("/transaction" , function(req , res){
    //return res.json(req.body)
    request.post(baseUrlGo + "transaction/create" , {
        json:true,
        body:{
            accNo:req.body.accNo,
            debit:parseInt(req.body.debit),
            credit:parseInt(req.body.credit),
            branchName:req.body.branchName
        }
    },function(err , response , body){
        //return res.json(body);
        if (body.status == "Success"){
            res.redirect("/list")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Find Customer Transaction
app.get("/transaction/user/:id" , function(req , res){
    //return res.json(req.body);
    request.get(baseUrlGo + "transaction/user/" + req.params.id , {
        json:true
    },function(err , response , body){
        //return res.json(body);
        if (body.status == "Success"){
            res.render("customer/listTransaction.html" , {
                transactions:body.body
            })
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Delete Customer Transaction
app.post("/transaction/delete/:id" , function(req , res){
    //return res.json(req.body);
    request.post(baseUrlGo + "transaction/delete/" + req.params.id , {
        json:true
    },function(err , response , body){
        //return res.json(body);
        if (body.status == "Success"){
            res.redirect("back")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Create Branch
app.post("/branchCrate" , function(req , res){
    //return res.json(req.body)
    request.post(baseUrlGo + "branch/create" , {
        json:true,
        body:{
            branchName:req.body.branchName,
            adminName:req.body.adminName

        }
    },function(err , response , body){
        if (body.status == "Success"){
            res.redirect("/list")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- List Branches
app.get("/branchList" , function(req , res){
    request.get(baseUrlGo + "branch" , {
        json:true
    },function(err , response , body){
        if (body.status == "Success"){
            res.render("branch/list.html" , {
                branches:body.body
            })
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Find Branche
app.get("/branch/:id" , function(req , res){
    request.get(baseUrlGo + "branch/"+ req.params.id , {
        json:true
    },function(err , response , body){
        if (body.status == "Success"){
            res.render("branch/branchEdit.html" , {
                branch:body.body
            })
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Update Branch
app.post("/branch/update/:id" , function(req , res){
    //return res.json(req.body);
    request.post(baseUrlGo + "branch/update/" + req.params.id , {
        json:true
    },function(err , response , body){
        //return res.json(body);
        if (body.status == "Success"){
            res.redirect("/branchLis")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});
//-------- Delete Branch
app.post("/branch/delete/:id" , function(req , res){
    //return res.json(req.body);
    request.post(baseUrlGo + "branch/delete/" + req.params.id , {
        json:true
    },function(err , response , body){
        //return res.json(body);
        if (body.status == "Success"){
            res.redirect("back")
        }else {
            req.flash("error" ,body.body )
            res.redirect("back")
        }
    })
});


app.listen(90);