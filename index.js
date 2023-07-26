const express = require('express');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const TestModels = require('./db/Test');
const cors = require('cors');
const app = express();
const upload = multer();

const dbConnect = require("./db/dbConnection");

dbConnect();

app.use(express.json());
app.use(cors());

//nothing more
// req is in {target: value}
app.get('/find', async (req, res) => {
    let req_query = req.query;
    let find_filter = {};
    if (req_query.type){find_filter.coralType = req_query.type;}
    if (req_query.pos){find_filter.coralPosition = req_query.pos;}
    if (req_query.belong){find_filter.coralBelong = req_query.belong;}
    if (req_query.showRemoved){find_filter.coralStatus = "removed";}
    else{find_filter.coralStatus = "inside";}
    let finding = await TestModels.find(find_filter);
    try {
        if (!finding.length){
            // console.log("none");
            res.json(finding);
        }
        else{res.json(finding);}
    } catch (error) {
        res.send(error);
    }
});

app.post('/add', async (req, res) => {
    let get_req = req.body;
    // console.log(get_req);
    let newCoralData = {}
    newCoralData.coralLabel = (await TestModels.find({})).length + 1;
    newCoralData.coralType = get_req.coralType;
    newCoralData.coralPosition = get_req.coralPosition;
    newCoralData.coralPutDate = new Date(get_req.coralPutDate);
    newCoralData.coralRecoveryDays = get_req.coralRecoveryDays;
    newCoralData.coralBelong = get_req.coralBelong;
    newCoralData.coralStatus = "inside";
    const addNewCoral = new TestModels(newCoralData);
    // console.log(addNewCoral);
    try {
        await addNewCoral.save();
        let report = `coral #: ${newCoralData.coralLabel}`;
        res.send(report);
        console.log(`coral #: ${newCoralData.coralLabel} is added`);   
        // console.log("add one coral in");
    } catch (error) {
        res.send("not found any matched data");
        // console.log("error occurred when trying to add new coral");
    }
});

app.post('/remove', async (req ,res) =>{
    let req_query = req.query;
    let remove_filter = {};
    if (req_query.pos != ""){remove_filter.coralPosition = req_query.pos;}
    else{remove_filter.coralPosition = "notfound";}
    remove_filter.coralStatus = "inside";
    // console.log(remove_filter);
    let removeCoral = await TestModels.findOneAndUpdate(
        remove_filter, {
            coralStatus: "removed",
            coralRemoveDate: Date.now(),
        });
    // console.log(removeCoral);
    if (removeCoral){res.send("coral removed");}
    else{res.send("no coral removed");}
});

app.post('/image', async (req, res) => {
    let req_body= req.body;
    let find_filter = {};
    find_filter.coralLabel = req_body.coralLabel;
    let addImage = await TestModels.findOne(find_filter);
    if (addImage){
        if (!addImage.coralImageUrl){
            addImage.coralImageUrl = [];
        }
        addImage.coralImageUrl.push("https://" + req_body.coralImageUrl);
        await addImage.save();
        res.send("coral image added");
    }
    else{res.send("coral image added failed");}
});
// app.get('/', async (req, res) => {
//     let data = {
//         coralLabel:2,
//         coralType:"finger",
//         coralPosition:"a5",
//         coralPutDate:Date.now(),
//         coralRecoveryDays:4,
//         coralBelong:"owen",
//         coralStatus:"inside",
//     };
//     let test = new TestModels(data);
//     await test.save();
//     res.send("added");

// });

app.listen(process.env.PORT || 3001, ()=>{
    console.log("server running on port 3001...");
});