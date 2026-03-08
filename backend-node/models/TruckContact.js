const mongoose = require("mongoose");

// Uses the `invoice_system` database on the same cluster
const invoiceSystemDb = mongoose.connection.useDb("invoice_system");

const truckContactSchema = new mongoose.Schema({
    truck_no: String,
    type: String,
    owner_name: String,
    pan_no: String,
    aadhar_no: String,
    pan_aadhar_link: String,
    contact_no: String,
    address: String,
    nil_tds_declaration: String,
    tds_applicability: String,
    incentive_commission_applicability: String,
    gst_type: String,
    gst_no: String,
    gst_percent: String,
    rc_validity: String,
    insurance_validity: String,
    fitness_validity: String,
    road_tax_validity: String,
    permit: String,
    puc: String,
    np_validity: String,
    driver_name: String,
    license_no: String,
    license_validity: String,
    // Add these for backward compatibility if needed, though owner_name and contact_no are better
    "Owner Name": String,
    "Contact No.": String,
}, { collection: "Truck Contact Number" });

module.exports = invoiceSystemDb.model("TruckContact", truckContactSchema);
