const mongoose = require('mongoose');

const facultyEntryStaffSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Please Enter a Name"], 
    trim: true, 
    maxlength: 50 
  },
  password: { 
    type: String, 
    required: [true, "Please Enter a Password"], 
    minlength: 6 
  },
  role: { 
    type: String, 
    required: true, 
    default: 'facultyentrystaff' 
  },
  dob: { 
    type: Date, 
    required: false 
  },
  designation: { 
    type: String, 
    required: false, 
    trim: true 
  },
  phone: { 
    type: String, 
    required: false, 
    match: /^[0-9]{10}$/ 
  },
  organization: { 
    type: String, 
    required: false, 
    trim: true 
  },
  ministry: { 
    type: String, 
    required: false, 
    trim: true 
  },

  joined: { 
    type: Date, 
    required: false, 
    default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000) 
  }
});

const FacultyEntryStaffModel = mongoose.model('facultyentrystafflogin', facultyEntryStaffSchema);
module.exports = FacultyEntryStaffModel;