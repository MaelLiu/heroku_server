const express = require('express');
const TestModels = require('./db/Test');
const UserModels = require('./db/User');
const cors = require('cors');
const app = express();

const dbConnect = require("./db/dbConnection");
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const encryption_key = "seamplecoraltech";

dbConnect();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

function format (date_data) {  
    if (!(date_data instanceof Date)) {
      throw new Error('Invalid "date" argument. You must pass a date instance')
    }
    const year = date_data.getFullYear()
    const month = String(date_data.getMonth() + 1).padStart(2, '0')
    const day = String(date_data.getDate()).padStart(2, '0')
    let join_date = `${year}-${month}-${day}`;
    console.log(`date fromat at ${join_date}`);
    return join_date
}

// req is in {target: value}
app.get('/find', async (req, res) => {
    let req_query = req.query;
    let find_filter = {};
    if (req_query.type){find_filter.coralType = req_query.type;}
    if (req_query.pos){find_filter.coralPosition = req_query.pos;}
    if (req_query.belong){find_filter.coralBelong = req_query.belong;}
    if (req_query.label){find_filter.coralLabel = Number(req_query.label);}
    if (req_query.showRemoved === "true"){find_filter.coralStatus = "removed";}
    else if (req_query.showRemoved === "all"){}
    else{find_filter.coralStatus = "inside";}
    // console.log(find_filter);
    let finding = await TestModels.find(find_filter);
    // console.log(finding);
    try {
        res.json(finding);
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
    newCoralData.coralPutDate = format(new Date());
    newCoralData.coralRecoveryDays = get_req.coralRecoveryDays;
    newCoralData.coralBelong = get_req.coralBelong;
    newCoralData.coralStatus = "inside";
    const addNewCoral = new TestModels(newCoralData);
    // console.log(addNewCoral);
    try {
        await addNewCoral.save();
        let report = `coral #: ${newCoralData.coralLabel}`;
        res.json(report);
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
    if (req_query.label){remove_filter.coralLabel = Number(req_query.label);}
    else{remove_filter.coralLabel = "notfound";}
    remove_filter.coralStatus = "inside";
    let coral_user = "";
    if (req_body.belong){
        let removeCoral = await TestModels.findOneAndUpdate(
            remove_filter, {
                coralStatus: "removed",
                coralRemoveDate: format(new Date()),
                coralBelong: req_body.belong
            });
    }
    else{
        let removeCoral = await TestModels.findOneAndUpdate(
            remove_filter, {
                coralStatus: "removed",
                coralRemoveDate: format(new Date()),
            });
    }
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
        if (req_body.coralBelong){addImage.coralBelong = req_body.coralBelong;}
        res.send("coral image added");
    }
    else{res.send("coral image added failed");}
});

app.post('/add_user', async (req ,res) => {
    let user_req = req.body;
    let user_data = {};
    user_data.user_name = user_req.user_name;
    user_data.user_password = user_req.user_password.toLowerCase();
    user_data.user_corals = user_req.user_corals;
    user_data.user_join = format(new Date());
    user_data.user_member = user_req.user_member;
    user_data.user_end_service = false;
    user_data.user_end_service_date = "";
    // console.log(user_data);
    
    const addNewUser = new UserModels(user_data);
    try {
        await addNewUser.save();
        let report = `user: ${user_data.user_name} added`;
        res.send(report);
        // console.log(`user: ${user_data.user_name} added`);   
        user_data.user_corals.map(async(coral, index) => {
            await TestModels.findOneAndUpdate({coralLabel: coral},{coralBelong: user_data.user_name});
            // console.log(`#${coral} is now belonged to ${user_data.user_name}`);
        });
    } catch (error) {
        res.send(error);
        // console.log("error occurred when trying to add new coral");
    }

});

app.get('/find_user', async (req, res) => {
    let req_query = req.query;
    let find_filter = {};

    if (req_query.name) {find_filter.user_name = req_query.name;}
    //asking user to type in YYYY MM DD in separate input box 
    if (req_query.joinDate) {find_filter.user_join = format(req_query.joinDate);}
    if (req_query.memberStatus) {find_filter.user_member = req_query.memberStatus;}
    find_filter.user_end_service = false;
    // if (req_query.corals) {find_filter.user_corals = { $in: req_query.corals.split(',') };}

    try {
        let users = await UserModels.find(find_filter);
        console.log(users);
        res.json(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/update_user', async (req, res) => {
    let req_body = req.body;
    console.log(req_body);
    let userData = {};
    if (req_body.user_end_service) {
        userData.user_name = req_body.new_user_name;
        userData.user_end_service = true;
        userData.user_end_service_date = format(new Date());
    }
    userData.user_corals = req_body.user_corals;
    try {
        await UserModels.findOneAndUpdate({user_name: req_body.user_name}, userData);
        res.send("User updated successfully");
    } catch (error) {
        res.status(500).send("Error updating user");
    }
});

app.post('/login', async (req, res) => {
    const encryptedPassword = req.body.password;

    // Decrypt the password
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, encryption_key);
    const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8).toLowerCase();
    let find_filter = {};
    find_filter.user_password = decryptedPassword;
    let finding = await UserModels.find(find_filter);
    // console.log(finding);
    try {
        res.send(finding);
    } catch (error) {
        res.send(error);
    }
});

// app.get("/", (req, res) => {
//     res.send("this is server end");
// });

app.listen(process.env.PORT || 3001, ()=>{
// app.listen(3001, ()=>{
    console.log("server running on port 3001...");
});

module.exports = app;